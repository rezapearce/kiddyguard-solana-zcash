import {
  getSessionResponses,
  getScreeningSession,
  saveScreeningAnalysis,
  getScreeningAnalysis,
} from '@/lib/screening/screeningService';
import { analyzeScreeningResponses } from './groqClient';

/**
 * Generate AI analysis for a completed screening session
 */
export async function generateAnalysis(sessionId: string): Promise<string> {
  // Check if analysis already exists
  const existingAnalysis = await getScreeningAnalysis(sessionId);
  if (existingAnalysis) {
    return existingAnalysis.analysis_id;
  }

  // Get session and responses
  const session = await getScreeningSession(sessionId);
  if (!session) {
    throw new Error(`Screening session ${sessionId} not found`);
  }

  if (session.status !== 'COMPLETED') {
    throw new Error(`Screening session ${sessionId} is not completed yet`);
  }

  const responses = await getSessionResponses(sessionId);
  if (responses.length === 0) {
    throw new Error(`No responses found for screening session ${sessionId}`);
  }

  // Generate AI analysis
  const analysis = await analyzeScreeningResponses(responses, session.child_age_months);

  // Save analysis to database
  const analysisId = await saveScreeningAnalysis(sessionId, {
    riskLevel: analysis.riskLevel,
    riskScore: analysis.riskScore,
    summary: analysis.summary,
    recommendations: JSON.stringify(analysis.recommendations),
    rawResponse: analysis,
  });

  return analysisId;
}
