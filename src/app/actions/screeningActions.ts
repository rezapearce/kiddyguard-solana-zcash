'use server';

import { revalidatePath } from 'next/cache';
import {
  createScreeningSession,
  saveScreeningResponse,
  completeScreeningSession,
  getScreeningSession,
  getSessionResponses,
  getScreeningAnalysis,
  updateSessionStatus,
  getFamilyScreeningSessions,
} from '@/lib/screening/screeningService';
import { generateAnalysis } from '@/lib/ai/analysisService';
import { createPaymentIntent } from './createIntent';
import { ScreeningResponseValue } from '@/types';

const MOCK_CLINIC_ID = '00000000-0000-0000-0000-000000000001';
const SCREENING_PAYMENT_AMOUNT_IDR = parseInt(
  process.env.SCREENING_PAYMENT_AMOUNT_IDR || '50000',
  10
);

export interface CreateSessionResult {
  success: boolean;
  sessionId?: string;
  error?: string;
}

export interface SaveResponseResult {
  success: boolean;
  error?: string;
}

export interface CompleteScreeningResult {
  success: boolean;
  sessionId?: string;
  paymentIntentId?: string;
  error?: string;
}

export interface ScreeningResultsData {
  session: any;
  responses: any[];
  analysis: any | null;
}

/**
 * Create a new screening session
 */
export async function createScreeningSessionAction(
  familyId: string,
  childName: string,
  ageMonths: number
): Promise<CreateSessionResult> {
  try {
    if (!familyId || !childName || ageMonths < 0 || ageMonths > 36) {
      return {
        success: false,
        error: 'Invalid parameters',
      };
    }

    const sessionId = await createScreeningSession({
      familyId,
      childName,
      ageMonths,
    });

    revalidatePath('/screening');
    return {
      success: true,
      sessionId,
    };
  } catch (error) {
    console.error('Error creating screening session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create screening session',
    };
  }
}

/**
 * Save a screening response
 */
export async function saveScreeningResponseAction(
  sessionId: string,
  questionId: string,
  questionText: string,
  category: string,
  responseValue: ScreeningResponseValue,
  milestoneAgeMonths?: number
): Promise<SaveResponseResult> {
  try {
    if (!sessionId || !questionId || !responseValue) {
      return {
        success: false,
        error: 'Missing required parameters',
      };
    }

    await saveScreeningResponse({
      sessionId,
      questionId,
      questionText,
      category,
      responseValue,
      milestoneAgeMonths,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error saving screening response:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save response',
    };
  }
}

/**
 * Complete screening session and generate AI analysis
 */
export async function completeScreeningAction(
  sessionId: string,
  userId: string,
  familyId: string
): Promise<CompleteScreeningResult> {
  try {
    if (!sessionId || !userId || !familyId) {
      return {
        success: false,
        error: 'Missing required parameters',
      };
    }

    // Mark session as completed
    await completeScreeningSession(sessionId);

    // Generate AI analysis (async, don't wait)
    generateAnalysis(sessionId).catch((error) => {
      console.error(`Error generating analysis for session ${sessionId}:`, error);
    });

    // Create payment intent automatically
    const paymentResult = await createPaymentIntent(
      userId,
      familyId,
      MOCK_CLINIC_ID,
      SCREENING_PAYMENT_AMOUNT_IDR,
      'USDC_BALANCE'
    );

    if (paymentResult.success && paymentResult.intentId) {
      // Link payment intent to screening session
      await updateSessionStatus(sessionId, 'PAYMENT_PENDING', paymentResult.intentId);

      revalidatePath('/screening');
      return {
        success: true,
        sessionId,
        paymentIntentId: paymentResult.intentId,
      };
    } else {
      // Payment intent creation failed, but session is still completed
      console.error('Failed to create payment intent:', paymentResult.error);
      revalidatePath('/screening');
      return {
        success: true,
        sessionId,
        error: `Screening completed but payment intent creation failed: ${paymentResult.error}`,
      };
    }
  } catch (error) {
    console.error('Error completing screening:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete screening',
    };
  }
}

/**
 * Get screening results (session + responses + analysis)
 */
export async function getScreeningResultsAction(
  sessionId: string
): Promise<{ success: boolean; data?: ScreeningResultsData; error?: string }> {
  try {
    const session = await getScreeningSession(sessionId);
    if (!session) {
      return {
        success: false,
        error: 'Screening session not found',
      };
    }

    const responses = await getSessionResponses(sessionId);
    const analysis = await getScreeningAnalysis(sessionId);

    return {
      success: true,
      data: {
        session,
        responses,
        analysis,
      },
    };
  } catch (error) {
    console.error('Error fetching screening results:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch screening results',
    };
  }
}

/**
 * Get all screening sessions for a family
 */
export async function getFamilyScreeningSessionsAction(
  familyId: string
): Promise<{ success: boolean; sessions?: any[]; error?: string }> {
  try {
    const sessions = await getFamilyScreeningSessions(familyId);
    return {
      success: true,
      sessions,
    };
  } catch (error) {
    console.error('Error fetching family screening sessions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch screening sessions',
    };
  }
}
