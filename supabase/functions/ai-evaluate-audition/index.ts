import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { auditionId } = await req.json();

    if (!auditionId) {
      return new Response(
        JSON.stringify({ error: "auditionId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch audition details
    const { data: audition, error: auditionError } = await supabase
      .from("auditions")
      .select("*")
      .eq("id", auditionId)
      .single();

    if (auditionError || !audition) {
      console.error("Error fetching audition:", auditionError);
      return new Response(
        JSON.stringify({ error: "Audition not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update status to analyzing
    await supabase
      .from("auditions")
      .update({ status: "analyzing" })
      .eq("id", auditionId);

    // Get public URL for the video
    const { data: publicUrlData } = supabase.storage
      .from("audition-videos")
      .getPublicUrl(audition.video_url);

    const videoUrl = publicUrlData.publicUrl;

    // Prepare the AI prompt
    const emotionalKeywords = audition.emotional_keywords?.join(", ") || "none specified";
    
    const prompt = `You are an expert casting director and emotion analyst. Analyze this audition video/image and provide a detailed evaluation.

ROLE REQUIREMENTS:
${audition.role_description}

EMOTIONAL KEYWORDS DESIRED: ${emotionalKeywords}

ROLE ARCHETYPES TO CONSIDER:
- Hero/Protagonist: Confident, charismatic, courageous, determined
- Villain/Antagonist: Intimidating, manipulative, powerful, menacing
- Romantic Lead: Charming, empathetic, vulnerable, passionate
- Comedic Character: Energetic, expressive, good timing, humorous
- Dramatic Character: Intense, emotionally deep, authentic, range
- Supporting Role: Reliable, consistent, versatile, dependable

ANALYSIS REQUIRED:
1. Detect emotions present (happy, sad, angry, fear, surprise, disgust, neutral) with confidence scores
2. Evaluate emotional intensity (low, medium, high)
3. Assess face visibility and expressiveness
4. Evaluate technical quality (lighting, contrast, clarity)
5. Match performer to role requirements
6. Provide specific strengths and areas for improvement
7. Give casting recommendation

Return ONLY a valid JSON object with this exact structure:
{
  "overall_match_score": <number 0-100>,
  "recommendation": "<strong_yes|yes|maybe|probably_not|no>",
  "emotions_detected": {
    "happy": <0-1>,
    "sad": <0-1>,
    "angry": <0-1>,
    "fear": <0-1>,
    "surprise": <0-1>,
    "disgust": <0-1>,
    "neutral": <0-1>
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2"],
  "technical_notes": ["note1", "note2"],
  "detailed_analysis": {
    "emotional_intensity": "<low|medium|high>",
    "face_quality_score": <0-100>,
    "technical_quality_score": <0-100>,
    "emotion_match_score": <0-100>,
    "archetype_match": "<hero|villain|romantic_lead|comedic|dramatic|supporting>",
    "summary": "<2-3 sentence summary>"
  }
}`;

    // Call Lovable AI with vision model
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: videoUrl } }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      await supabase
        .from("auditions")
        .update({ status: "failed" })
        .eq("id", auditionId);

      return new Response(
        JSON.stringify({ error: "AI analysis failed", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || "{}";

    console.log("AI Response:", aiContent);

    // Parse the AI response
    let evaluation;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                        aiContent.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiContent;
      evaluation = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, aiContent);
      
      await supabase
        .from("auditions")
        .update({ status: "failed" })
        .eq("id", auditionId);

      return new Response(
        JSON.stringify({ error: "Failed to parse AI evaluation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save evaluation to database
    const { error: evalError } = await supabase
      .from("audition_evaluations")
      .insert({
        audition_id: auditionId,
        overall_match_score: evaluation.overall_match_score,
        recommendation: evaluation.recommendation,
        emotions_detected: evaluation.emotions_detected,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        technical_notes: evaluation.technical_notes,
        detailed_analysis: evaluation.detailed_analysis,
      });

    if (evalError) {
      console.error("Error saving evaluation:", evalError);
      
      await supabase
        .from("auditions")
        .update({ status: "failed" })
        .eq("id", auditionId);

      return new Response(
        JSON.stringify({ error: "Failed to save evaluation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update audition status to completed
    await supabase
      .from("auditions")
      .update({ status: "completed" })
      .eq("id", auditionId);

    return new Response(
      JSON.stringify({ success: true, evaluation }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-evaluate-audition:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
