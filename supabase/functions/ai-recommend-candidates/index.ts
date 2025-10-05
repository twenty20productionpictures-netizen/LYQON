import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, roleId, limit = 10 } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch project and role details
    const { data: project } = await supabase
      .from('projects')
      .select('*, project_roles(*)')
      .eq('id', projectId)
      .single();

    const role = roleId 
      ? project.project_roles.find((r: any) => r.id === roleId)
      : project.project_roles[0];

    // Fetch talent profiles
    const { data: talents } = await supabase
      .from('talent_profiles')
      .select(`
        *,
        profiles(full_name, email),
        talent_credits(count),
        talent_media(count)
      `)
      .limit(50);

    if (!talents || talents.length === 0) {
      return new Response(JSON.stringify({ recommendations: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `You are an AI casting director analyzing talent for a specific role.

PROJECT: ${project.title}
ROLE: ${role.role_name}
DESCRIPTION: ${role.role_description}
REQUIREMENTS: ${JSON.stringify(role.requirements)}

TALENT POOL (${talents.length} candidates):
${talents.map((t: any, i: number) => `
${i + 1}. ID: ${t.id}
   Skills: Languages(${t.languages?.length || 0}), Instruments(${t.instruments?.length || 0}), Combat(${t.combat_skills?.length || 0}), Athletic(${t.athletic_skills?.length || 0})
   Physical: ${t.height_feet}'${t.height_inches}", ${t.weight}lbs, ${t.ethnicity?.join('/')}, ${t.hair_color} hair, ${t.eye_color} eyes
   Location: ${t.location}, Union: ${t.union_status}
   Experience: ${t.talent_credits?.[0]?.count || 0} credits
`).join('')}

Analyze each candidate and select the top ${limit} best matches. Consider:
1. Skill alignment with role requirements
2. Physical fit for the character
3. Experience level appropriateness
4. Practical factors (location, union status)

Respond with a JSON object:
{
  "recommendations": [
    {
      "talentId": "<uuid>",
      "matchScore": <number 0-100>,
      "reasoning": "<brief explanation>",
      "keyStrengths": ["strength1", "strength2"]
    }
  ]
}

Return exactly ${limit} recommendations, ordered by match score (highest first).`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a professional casting director AI. Always respond with valid JSON only.' },
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
    console.error('Error in ai-recommend-candidates:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
