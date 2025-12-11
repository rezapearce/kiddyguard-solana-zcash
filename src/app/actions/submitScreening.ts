'use server';

import { supabaseServer, supabaseFallback } from '@/lib/supabase-server';
import { denverIIQuestions } from '@/lib/screening/denverIIQuestions';
import { revalidatePath } from 'next/cache';

// Use server client if available, otherwise fallback to regular client
const db = supabaseServer || supabaseFallback;

export interface SubmitScreeningResult {
  success: boolean;
  screening_id?: string;
  risk_level?: 'High' | 'Low';
  error?: string;
}

/**
 * Map category codes to readable domain names
 */
function getDomainName(category: string): string {
  const domainMap: Record<string, string> = {
    gross_motor: 'Gross Motor',
    fine_motor: 'Fine Motor',
    language: 'Language',
    personal_social: 'Personal-Social',
  };
  return domainMap[category] || category;
}

/**
 * Generate summary text based on risk level and affected domains
 */
function generateSummary(
  riskLevel: 'High' | 'Low',
  affectedDomains: string[]
): string {
  if (riskLevel === 'High') {
    const domainsText = affectedDomains.join(', ');
    return `Concerns detected in ${domainsText}. Clinical review recommended.`;
  }
  return 'Developmental milestones appear on track.';
}

/**
 * Submit a screening with rule engine analysis
 * 
 * @param familyId - UUID of the family
 * @param childName - Name of the child
 * @param age - Age in months (0-36)
 * @param answers - Map of questionId -> boolean (true = achieved, false = not achieved)
 * @returns Screening result with screening_id and risk_level
 */
export async function submitScreening(
  familyId: string,
  childName: string,
  age: number,
  answers: Map<string, boolean>
): Promise<SubmitScreeningResult> {
  try {
    // Validate inputs
    if (!familyId || !childName || age === undefined || age < 0 || age > 36) {
      return {
        success: false,
        error: 'Invalid input parameters',
      };
    }

    if (!answers || answers.size === 0) {
      return {
        success: false,
        error: 'Answers cannot be empty',
      };
    }

    // Process answers: Convert Map to array with metadata
    const answersArray: Array<{
      questionId: string;
      response: boolean;
      category: string;
      questionText: string;
      milestoneAgeMonths: number;
    }> = [];

    let noAnswersCount = 0;
    const affectedCategories = new Set<string>();

    // Look up question metadata for each answer
    for (const [questionId, response] of answers.entries()) {
      const question = denverIIQuestions.find((q) => q.questionId === questionId);

      if (!question) {
        console.warn(`Question not found: ${questionId}`);
        continue;
      }

      answersArray.push({
        questionId,
        response,
        category: question.category,
        questionText: question.questionText,
        milestoneAgeMonths: question.milestoneAgeMonths,
      });

      // Count "No" answers (false = milestone not achieved)
      if (!response) {
        noAnswersCount++;
        affectedCategories.add(question.category);
      }
    }

    const totalAnswers = answersArray.length;
    if (totalAnswers === 0) {
      return {
        success: false,
        error: 'No valid answers found',
      };
    }

    // Calculate risk using rule engine
    const noAnswersPercentage = (noAnswersCount / totalAnswers) * 100;
    const isHighRisk = noAnswersPercentage > 50;

    const ai_risk_score = isHighRisk ? 85 : 10;
    const risk_level: 'High' | 'Low' = isHighRisk ? 'High' : 'Low';

    // Generate summary
    const affectedDomains = Array.from(affectedCategories).map(getDomainName);
    const ai_summary = generateSummary(risk_level, affectedDomains);

    // Insert into screenings table
    const insertData = {
      family_id: familyId,
      child_name: childName.trim(),
      child_age_months: age,
      answers: answersArray,
      ai_risk_score,
      ai_summary,
      status: 'PENDING_REVIEW' as const,
    };

    const { data, error } = await db
      .from('screenings')
      .insert(insertData)
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting screening:', error);
      return {
        success: false,
        error: `Failed to save screening: ${error.message}`,
      };
    }

    if (!data || !data.id) {
      return {
        success: false,
        error: 'Failed to save screening: No ID returned',
      };
    }

    // Revalidate paths to update UI
    revalidatePath('/screening');
    revalidatePath('/');

    return {
      success: true,
      screening_id: data.id,
      risk_level,
    };
  } catch (error) {
    console.error('Unexpected error in submitScreening:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
