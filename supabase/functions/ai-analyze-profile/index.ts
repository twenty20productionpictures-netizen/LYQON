import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { talentProfile, mediaCount } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `You are an AI casting consultant analyzing a talent profile for completeness and marketability.

PROFILE DATA:
- Name: ${talentProfile.full_name || 'Not provided'}
- Physical Details: ${talentProfile.height_feet ? `${talentProfile.height_feet}'${talentProfile.height_inches}"` : 'Not provided'}, ${talentProfile.weight || 'Not provided'}lbs
- Appearance: ${talentProfile.ethnicity?.join(', ') || 'Not provided'}, ${talentProfile.hair_color || 'Not provided'} hair, ${talentProfile.eye_color || 'Not provided'} eyes
- Skills: Languages: ${talentProfile.languages?.length || 0}, Instruments: ${talentProfile.instruments?.length || 0}, Combat: ${talentProfile.combat_skills?.length || 0}, Athletic: ${talentProfile.athletic_skills?.length || 0}, Special: ${talentProfile.special_skills?.length || 0}
- Location: ${talentProfile.location || 'Not provided'}
- Union: ${talentProfile.union_status || 'Not provided'}
- Media Items: ${mediaCount || 0}
- Profile Completion: ${talentProfile.profile_completion_percentage || 0}%

Analyze this profile and provide actionable improvement suggestions. Consider:
1. Profile completeness
2. Marketability factors
3. Missing critical information
4. Competitive positioning

Respond with a JSON object:
{
  "overallScore": <number 0-100>,
  "completeness": <number 0-100>,
  "marketability": <number 0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "priorityActions": ["action1", "action2"],
  "summary": "<brief 2-3 sentence summary>"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a professional talent agent AI. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-analyze-profile:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
