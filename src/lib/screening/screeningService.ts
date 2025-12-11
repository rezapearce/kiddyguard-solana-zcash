import { supabase } from '@/lib/supabase';
import { supabaseServer, supabaseFallback } from '@/lib/supabase-server';
import { ScreeningSession, ScreeningResponse, ScreeningAnalysis } from '@/types';
import { getAgeGroup } from './questionnaireData';

// Use server client if available, otherwise fallback to regular client
const db = supabaseServer || supabaseFallback;

/**
 * Screening Service - Database operations for pediatric screening
 */

export interface CreateSessionParams {
  familyId: string;
  childName: string;
  ageMonths: number;
}

export interface SaveResponseParams {
  sessionId: string;
  questionId: string;
  questionText: string;
  category: string;
  responseValue: string;
  milestoneAgeMonths?: number;
}

/**
 * Create a new screening session
 */
export async function createScreeningSession(
  params: CreateSessionParams
): Promise<string> {
  const { familyId, childName, ageMonths } = params;
  const ageGroup = getAgeGroup(ageMonths);

  const { data, error } = await db
    .from('screening_sessions')
    .insert({
      family_id: familyId,
      child_name: childName,
      child_age_months: ageMonths,
      age_group: ageGroup,
      status: 'IN_PROGRESS',
    })
    .select('session_id')
    .single();

  if (error) {
    throw new Error(`Failed to create screening session: ${error.message}`);
  }

  if (!data || !data.session_id) {
    throw new Error('Failed to create screening session: No session ID returned');
  }

  return data.session_id;
}

/**
 * Save a screening response
 */
export async function saveScreeningResponse(
  params: SaveResponseParams
): Promise<void> {
  const { sessionId, questionId, questionText, category, responseValue, milestoneAgeMonths } = params;

  const { error } = await db
    .from('screening_responses')
    .insert({
      session_id: sessionId,
      question_id: questionId,
      question_text: questionText,
      category,
      response_value: responseValue,
      milestone_age_months: milestoneAgeMonths || null,
    });

  if (error) {
    throw new Error(`Failed to save screening response: ${error.message}`);
  }
}

/**
 * Get all responses for a screening session
 */
export async function getSessionResponses(
  sessionId: string
): Promise<ScreeningResponse[]> {
  const { data, error } = await db
    .from('screening_responses')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch screening responses: ${error.message}`);
  }

  return (data || []) as ScreeningResponse[];
}

/**
 * Get a screening session by ID
 */
export async function getScreeningSession(
  sessionId: string
): Promise<ScreeningSession | null> {
  const { data, error } = await db
    .from('screening_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch screening session: ${error.message}`);
  }

  return data as ScreeningSession;
}

/**
 * Update screening session status
 */
export async function updateSessionStatus(
  sessionId: string,
  status: ScreeningSession['status'],
  paymentIntentId?: string | null
): Promise<void> {
  const updateData: any = { status };
  if (paymentIntentId !== undefined) {
    updateData.payment_intent_id = paymentIntentId;
  }

  const { error } = await db
    .from('screening_sessions')
    .update(updateData)
    .eq('session_id', sessionId);

  if (error) {
    throw new Error(`Failed to update session status: ${error.message}`);
  }
}

/**
 * Complete a screening session (mark as COMPLETED)
 */
export async function completeScreeningSession(sessionId: string): Promise<void> {
  await updateSessionStatus(sessionId, 'COMPLETED');
}

/**
 * Get screening analysis for a session
 */
export async function getScreeningAnalysis(
  sessionId: string
): Promise<ScreeningAnalysis | null> {
  const { data, error } = await db
    .from('screening_analysis')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch screening analysis: ${error.message}`);
  }

  return data as ScreeningAnalysis;
}

/**
 * Save screening analysis
 */
export async function saveScreeningAnalysis(
  sessionId: string,
  analysis: {
    riskLevel: ScreeningAnalysis['risk_level'];
    riskScore?: number;
    summary: string;
    recommendations?: string;
    rawResponse?: any;
  }
): Promise<string> {
  const { data, error } = await db
    .from('screening_analysis')
    .insert({
      session_id: sessionId,
      risk_level: analysis.riskLevel,
      risk_score: analysis.riskScore || null,
      summary: analysis.summary,
      recommendations: analysis.recommendations || null,
      ai_model: 'llama-3',
      ai_provider: 'groq',
      raw_response: analysis.rawResponse || null,
    })
    .select('analysis_id')
    .single();

  if (error) {
    throw new Error(`Failed to save screening analysis: ${error.message}`);
  }

  if (!data || !data.analysis_id) {
    throw new Error('Failed to save screening analysis: No analysis ID returned');
  }

  return data.analysis_id;
}

/**
 * Get all screening sessions for a family
 */
export async function getFamilyScreeningSessions(
  familyId: string
): Promise<ScreeningSession[]> {
  const { data, error } = await db
    .from('screening_sessions')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch family screening sessions: ${error.message}`);
  }

  return (data || []) as ScreeningSession[];
}
