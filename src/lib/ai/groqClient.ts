import Groq from 'groq-sdk';
import { ScreeningResponse, ScreeningRiskLevel } from '@/types';

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
  console.warn('GROQ_API_KEY not found in environment variables');
}

const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

export interface AnalysisResult {
  riskLevel: ScreeningRiskLevel;
  riskScore: number;
  summary: string;
  recommendations: string[];
}

/**
 * Analyze screening responses using Groq (Llama 3)
 */
export async function analyzeScreeningResponses(
  responses: ScreeningResponse[],
  childAgeMonths: number
): Promise<AnalysisResult> {
  if (!groq) {
    throw new Error('Groq API key not configured. Please set GROQ_API_KEY environment variable.');
  }

  // Format responses for AI context
  const responseSummary = responses.map(r => {
    const status = r.response_value === 'yes' ? 'ACHIEVED' : 
                   r.response_value === 'no' ? 'NOT_ACHIEVED' : 
                   r.response_value === 'sometimes' ? 'PARTIAL' : 'NOT_APPLICABLE';
    return `- ${r.category.toUpperCase()}: ${r.question_text} (Expected at ${r.milestone_age_months} months) - ${status}`;
  }).join('\n');

  // Count concerns (no responses)
  const concerns = responses.filter(r => r.response_value === 'no').length;
  const totalQuestions = responses.length;
  const concernRate = totalQuestions > 0 ? (concerns / totalQuestions) * 100 : 0;

  const prompt = `You are a pediatric developmental screening AI assistant analyzing Denver II screening results.

Child Age: ${childAgeMonths} months

Screening Responses:
${responseSummary}

Total Questions: ${totalQuestions}
Concerns (Not Achieved): ${concerns}
Concern Rate: ${concernRate.toFixed(1)}%

Please analyze these screening results and provide:
1. Risk Level: LOW, MODERATE, or HIGH
   - LOW: Most milestones achieved, minor delays acceptable for age
   - MODERATE: Some significant delays, may need monitoring or early intervention
   - HIGH: Multiple delays across domains, likely needs professional evaluation

2. Risk Score: A number from 0-100 where:
   - 0-30: LOW risk
   - 31-70: MODERATE risk
   - 71-100: HIGH risk

3. Summary: A brief 2-3 sentence summary of the child's developmental status

4. Recommendations: A JSON array of 3-5 specific, actionable recommendations (strings)

Respond in the following JSON format:
{
  "riskLevel": "LOW" | "MODERATE" | "HIGH",
  "riskScore": <number 0-100>,
  "summary": "<2-3 sentence summary>",
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...]
}

Be professional, supportive, and evidence-based. Remember that developmental milestones have a range, and some variation is normal.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a pediatric developmental screening AI assistant. Analyze Denver II screening results and provide risk assessment with actionable recommendations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from Groq API');
    }

    const parsed = JSON.parse(content);
    
    // Validate and normalize response
    const riskLevel = ['LOW', 'MODERATE', 'HIGH'].includes(parsed.riskLevel)
      ? parsed.riskLevel as ScreeningRiskLevel
      : 'MODERATE';

    const riskScore = typeof parsed.riskScore === 'number'
      ? Math.max(0, Math.min(100, parsed.riskScore))
      : concernRate;

    const summary = typeof parsed.summary === 'string' && parsed.summary.trim()
      ? parsed.summary.trim()
      : 'Analysis completed. Please review individual responses.';

    const recommendations = Array.isArray(parsed.recommendations)
      ? parsed.recommendations.filter((r: any) => typeof r === 'string').slice(0, 5)
      : [];

    return {
      riskLevel,
      riskScore,
      summary,
      recommendations,
    };
  } catch (error) {
    console.error('Error calling Groq API:', error);
    
    // Fallback analysis based on concern rate
    let riskLevel: ScreeningRiskLevel = 'LOW';
    if (concernRate > 50) {
      riskLevel = 'HIGH';
    } else if (concernRate > 25) {
      riskLevel = 'MODERATE';
    }

    return {
      riskLevel,
      riskScore: concernRate,
      summary: `Screening completed. ${concerns} out of ${totalQuestions} milestones not yet achieved. ${riskLevel === 'HIGH' ? 'Consider professional evaluation.' : riskLevel === 'MODERATE' ? 'Monitor development and consider early intervention.' : 'Continue monitoring normal development.'}`,
      recommendations: [
        'Continue regular developmental monitoring',
        'Engage in age-appropriate activities',
        'Consult with pediatrician if concerns persist',
      ],
    };
  }
}
