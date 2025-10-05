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
    const { talentProfile, projectRole } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `You are an AI casting assistant analyzing talent-role compatibility.

TALENT PROFILE:
- Skills: ${JSON.stringify(talentProfile.skills || {})}
- Experience: ${talentProfile.credits?.length || 0} credits
- Physical: Height ${talentProfile.height_feet}'${talentProfile.height_inches}", ${talentProfile.weight}lbs, ${talentProfile.ethnicity?.join(', ')}, ${talentProfile.hair_color} hair, ${talentProfile.eye_color} eyes
- Location: ${talentProfile.location}
- Union Status: ${talentProfile.union_status}

PROJECT ROLE:
- Role: ${projectRole.role_name}
- Description: ${projectRole.role_description}
- Requirements: ${JSON.stringify(projectRole.requirements)}

Analyze the match between this talent and role. Consider:
1. Skill alignment (40%)
2. Physical requirements fit (30%)
3. Experience level (20%)
4. Practical factors like location and union status (10%)

Respond with a JSON object:
{
  "matchScore": <number 0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "concerns": ["concern1", "concern2"],
  "recommendation": "<brief recommendation>"
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
          { role: 'system', content: 'You are a professional casting AI assistant. Always respond with valid JSON only.' },
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
    console.error('Error in ai-match-talent:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
