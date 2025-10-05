import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch project with roles
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*, project_roles(*)')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    // Fetch applications
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('*')
      .eq('project_id', projectId)
      .neq('status', 'rejected');

    if (appsError) throw appsError;

    if (!applications || applications.length === 0) {
      return new Response(
        JSON.stringify({ shortlistedApplicants: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch public profiles for all applicants
    const talentIds = applications.map((app: any) => app.talent_id);
    const { data: publicProfiles, error: profilesError } = await supabase
      .from('public_profiles')
      .select('*')
      .in('user_id', talentIds);

    if (profilesError) throw profilesError;

    // Fetch talent profiles for additional info
    const { data: talentProfiles, error: talentError } = await supabase
      .from('talent_profiles')
      .select('*')
      .in('user_id', talentIds);

    if (talentError) throw talentError;

    // Get video URLs from storage and enrich applications
    const applicationsWithVideos = await Promise.all(
      applications.map(async (app: any) => {
        const { data: urlData } = await supabase.storage
          .from('application-videos')
          .createSignedUrl(app.video_url, 3600);
        
        const profile = publicProfiles?.find((p: any) => p.user_id === app.talent_id);
        const talentProfile = talentProfiles?.find((tp: any) => tp.user_id === app.talent_id);
        
        return {
          ...app,
          videoUrl: urlData?.signedUrl,
          profile,
          talentProfile
        };
      })
    );

    // PRE-FILTER: Check basic physical requirements before AI analysis
    const physicallyQualified: any[] = [];
    const autoRejected: any[] = [];

    for (const app of applicationsWithVideos) {
      let passesFilter = true;
      const rejectionReasons: string[] = [];
      
      // Check against each role's requirements
      for (const role of (project.project_roles || [])) {
        const requirements = role.requirements || {};
        
        // Height check (in cm)
        if (requirements.minHeight && app.talentProfile?.height_cm) {
          if (app.talentProfile.height_cm < requirements.minHeight) {
            passesFilter = false;
            rejectionReasons.push(`Height below minimum (${requirements.minHeight}cm required)`);
          }
        }
        if (requirements.maxHeight && app.talentProfile?.height_cm) {
          if (app.talentProfile.height_cm > requirements.maxHeight) {
            passesFilter = false;
            rejectionReasons.push(`Height above maximum (${requirements.maxHeight}cm required)`);
          }
        }

        // Weight check (in kg)
        if (requirements.minWeight && app.talentProfile?.weight_kg) {
          if (app.talentProfile.weight_kg < requirements.minWeight) {
            passesFilter = false;
            rejectionReasons.push(`Weight below minimum (${requirements.minWeight}kg required)`);
          }
        }
        if (requirements.maxWeight && app.talentProfile?.weight_kg) {
          if (app.talentProfile.weight_kg > requirements.maxWeight) {
            passesFilter = false;
            rejectionReasons.push(`Weight above maximum (${requirements.maxWeight}kg required)`);
          }
        }

        // Gender check
        if (requirements.gender && app.talentProfile?.gender_identity) {
          const requiredGenders = Array.isArray(requirements.gender) ? requirements.gender : [requirements.gender];
          if (!requiredGenders.includes(app.talentProfile.gender_identity)) {
            passesFilter = false;
            rejectionReasons.push(`Gender doesn't match role requirements`);
          }
        }

        // Ethnicity check
        if (requirements.ethnicity && app.talentProfile?.ethnicity) {
          const requiredEthnicities = Array.isArray(requirements.ethnicity) ? requirements.ethnicity : [requirements.ethnicity];
          const hasMatch = app.talentProfile.ethnicity.some((e: string) => requiredEthnicities.includes(e));
          if (!hasMatch) {
            passesFilter = false;
            rejectionReasons.push(`Ethnicity doesn't match role requirements`);
          }
        }

        // Looks/types check
        if (requirements.looksTypes && app.talentProfile?.looks_types) {
          const requiredLooks = Array.isArray(requirements.looksTypes) ? requirements.looksTypes : [requirements.looksTypes];
          const hasMatch = app.talentProfile.looks_types.some((look: string) => requiredLooks.includes(look));
          if (!hasMatch) {
            passesFilter = false;
            rejectionReasons.push(`Physical type doesn't match role requirements`);
          }
        }

        // Hair color check
        if (requirements.hairColor && app.talentProfile?.hair_color) {
          const requiredHairColors = Array.isArray(requirements.hairColor) ? requirements.hairColor : [requirements.hairColor];
          if (!requiredHairColors.includes(app.talentProfile.hair_color)) {
            passesFilter = false;
            rejectionReasons.push(`Hair color doesn't match role requirements`);
          }
        }

        // Eye color check
        if (requirements.eyeColor && app.talentProfile?.eye_color) {
          const requiredEyeColors = Array.isArray(requirements.eyeColor) ? requirements.eyeColor : [requirements.eyeColor];
          if (!requiredEyeColors.includes(app.talentProfile.eye_color)) {
            passesFilter = false;
            rejectionReasons.push(`Eye color doesn't match role requirements`);
          }
        }
      }

      if (passesFilter) {
        physicallyQualified.push(app);
      } else {
        autoRejected.push({ app, reasons: rejectionReasons });
        // Update application status and score immediately
        await supabase
          .from('applications')
          .update({ 
            ai_match_score: 0,
            status: 'rejected'
          })
          .eq('id', app.id);
        
        console.log(`Auto-rejected applicant ${app.profile?.full_name}: ${rejectionReasons.join(', ')}`);
      }
    }

    console.log(`Pre-filter results: ${physicallyQualified.length} qualified, ${autoRejected.length} auto-rejected`);

    // If no one passes pre-filter, return empty list
    if (physicallyQualified.length === 0) {
      return new Response(
        JSON.stringify({ shortlistedApplicants: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build prompt for AI analysis
    const projectDescription = `
Project: ${project.title}
Type: ${project.project_type}
Description: ${project.description || 'N/A'}

Roles: ${project.project_roles?.map((r: any) => `
  - ${r.role_name}: ${r.role_description || 'N/A'}
    Required emotions: ${r.emotions?.join(', ') || 'N/A'}
    Requirements: ${JSON.stringify(r.requirements) || 'N/A'}
`).join('\n') || 'N/A'}
`;

    const applicantsData = physicallyQualified.map((app: any, idx: number) => `
Applicant ${idx + 1}:
Name: ${app.profile?.full_name || 'Unknown'}
Gender: ${app.talentProfile?.gender_identity || 'N/A'}
Height: ${app.talentProfile?.height_cm ? `${app.talentProfile.height_cm} cm` : 'N/A'}
Weight: ${app.talentProfile?.weight_kg ? `${app.talentProfile.weight_kg} kg` : 'N/A'}
Location: ${app.talentProfile?.location || 'N/A'}
Languages: ${app.talentProfile?.languages?.join(', ') || 'N/A'}
Special Skills: ${app.talentProfile?.special_skills?.join(', ') || 'N/A'}
Athletic Skills: ${app.talentProfile?.athletic_skills?.join(', ') || 'N/A'}
Instruments: ${app.talentProfile?.instruments?.join(', ') || 'N/A'}
Union Status: ${app.talentProfile?.union_status || 'N/A'}
Looks/Types: ${app.talentProfile?.looks_types?.join(', ') || 'N/A'}
Cover Letter: ${app.cover_letter || 'N/A'}
Video Available: ${app.videoUrl ? 'Yes' : 'No'}
Application ID: ${app.id}
`).join('\n\n');

    const prompt = `You are an expert casting director AI analyzing applicants for a film/TV project. Evaluate each candidate thoroughly.

${projectDescription}

APPLICANTS:
${applicantsData}

EVALUATION CRITERIA (similar to professional casting analysis):
1. **Physical Match (30%)**: Height, weight, gender, looks/types matching role requirements
2. **Skills & Experience (25%)**: Special skills, athletic abilities, instruments, languages relevant to role
3. **Professional Profile (20%)**: Union status, location convenience, overall presentation
4. **Intangibles (15%)**: Cover letter quality, enthusiasm, unique qualities
5. **Video Performance (10%)**: If video available, assess presence and energy

SCORING METHODOLOGY:
- 90-100: Exceptional match, strongly recommend for shortlist
- 75-89: Very good match, solid candidate
- 50-74: Acceptable match, consider if limited options
- Below 50: Not recommended for this role

For each applicant, provide:
1. **Match Score (0-100)**: Be realistic and specific. Most candidates should score 60-85.
2. **Key Strengths (2-4 points)**: Specific attributes that make them suitable
3. **Concerns (1-3 points)**: Any gaps or potential issues
4. **Recommendation**: 1-2 sentences with clear reasoning

Return ONLY valid JSON array (no markdown, no code blocks):
[
  {
    "applicationId": "uuid-here",
    "matchScore": 78,
    "strengths": ["Perfect height match for lead role", "Experienced with action sequences", "Union member with clean schedule"],
    "concerns": ["Location requires relocation", "Limited comedy experience"],
    "recommendation": "Strong candidate with excellent physical match and action experience. Relocation is manageable given project timeline."
  }
]

Be thorough, fair, and objective. Consider diversity and authentic representation.`;

    console.log('Sending request to Lovable AI...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a professional casting director. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    console.log('AI Response:', content);

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in AI response');
    }

    const evaluations = JSON.parse(jsonMatch[0]);

    // Update applications with AI match scores
    for (const evaluation of evaluations) {
      await supabase
        .from('applications')
        .update({ ai_match_score: Math.round(evaluation.matchScore) })
        .eq('id', evaluation.applicationId);
    }

    // Filter applicants with 50%+ match score
    const shortlisted = evaluations
      .filter((e: any) => e.matchScore >= 50)
      .sort((a: any, b: any) => b.matchScore - a.matchScore);

    // Enrich with applicant data
    const enrichedShortlist = shortlisted.map((evaluation: any) => {
      const app = physicallyQualified.find((a: any) => a.id === evaluation.applicationId);
      return {
        ...evaluation,
        application: app,
        talentName: app?.profile?.full_name || 'Unknown',
        talentAvatar: app?.profile?.avatar_url,
        talentId: app?.talent_id,
      };
    });

    return new Response(
      JSON.stringify({ shortlistedApplicants: enrichedShortlist }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-shortlist-applicants:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
