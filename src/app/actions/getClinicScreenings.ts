'use server';

import { supabaseServer, supabaseFallback } from '@/lib/supabase-server';

// Use server client if available, otherwise fallback to regular client
const db = supabaseServer || supabaseFallback;

export interface ClinicScreening {
  id: string;
  child_name: string;
  child_age_months: number;
  ai_risk_score: number | null;
  ai_summary: string | null;
  status: string;
  created_at: string;
  clinical_notes: string | null;
  clinical_risk_level: 'LOW' | 'MODERATE' | 'HIGH' | null;
  reviewed_at: string | null;
}

/**
 * Server Action to fetch pending screenings for clinic review
 * Returns screenings with SETTLED payments that haven't been reviewed yet
 */
export async function getClinicScreenings(): Promise<{
  success: boolean;
  data?: ClinicScreening[];
  error?: string;
}> {
  try {
    // Debug: Check which client we're using
    const isServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('[getClinicScreenings] Using service role:', isServiceRole);
    
    // First, get all screenings
    // Using a manual join approach since Supabase might not detect the FK relationship
    const { data: screeningsData, error: screeningsError } = await db
      .from('screenings')
      .select(`
        id,
        child_name,
        child_age_months,
        ai_risk_score,
        ai_summary,
        status,
        created_at,
        clinical_notes,
        clinical_risk_level,
        reviewed_at
      `)
      .order('created_at', { ascending: false });

    if (screeningsError) {
      console.error('Error fetching screenings:', screeningsError);
      return {
        success: false,
        error: `Failed to fetch screenings: ${screeningsError.message}`,
      };
    }

    // Now fetch payment intents separately and filter
    // Using explicit column selection to avoid relationship detection issues
    let paymentIntentsData: any[] = [];
    let paymentError: any = null;
    
    try {
      const { data, error } = await db
        .from('payment_intents')
        .select('screening_id, status')
        .eq('status', 'SETTLED')
        .not('screening_id', 'is', null);
      
      paymentIntentsData = data || [];
      paymentError = error;
    } catch (err: any) {
      // Handle schema cache errors gracefully
      if (err?.message?.includes('relationship') || err?.message?.includes('schema cache')) {
        console.warn('[getClinicScreenings] Schema cache issue detected, trying alternative query:', err.message);
        // Try querying without explicit relationship
        try {
          const { data, error } = await db
            .from('payment_intents')
            .select('*')
            .eq('status', 'SETTLED');
          
          // Filter for non-null screening_id manually
          paymentIntentsData = (data || []).filter((pi: any) => pi.screening_id !== null);
          paymentError = error;
        } catch (fallbackErr) {
          paymentError = fallbackErr;
          console.error('[getClinicScreenings] Fallback query also failed:', fallbackErr);
        }
      } else {
        paymentError = err;
      }
    }

    // Fetch clinical reviews separately to check which screenings have been reviewed
    const { data: clinicalReviewsData, error: reviewsError } = await db
      .from('clinical_reviews')
      .select('screening_id, review_id');

    if (reviewsError) {
      console.warn('Error fetching clinical reviews:', reviewsError);
      // Continue anyway - assume no reviews if we can't fetch them
    }

    // Create a set of screening IDs that have clinical reviews
    const reviewedScreeningIds = new Set(
      (clinicalReviewsData || []).map((cr: any) => cr.screening_id)
    );

    if (paymentError) {
      console.error('Error fetching payment intents:', paymentError);
      // Provide helpful error message for schema cache issues
      if (paymentError.message?.includes('relationship') || paymentError.message?.includes('schema cache')) {
        return {
          success: false,
          error: `Database schema cache issue: ${paymentError.message}. Please run the fix_schema_cache_relationship.sql script in Supabase SQL Editor and wait 1-5 minutes for the cache to refresh.`,
        };
      }
      return {
        success: false,
        error: `Failed to fetch payment intents: ${paymentError.message}`,
      };
    }

    // Create a set of screening_ids with SETTLED payments for quick lookup
    const settledScreeningIds = new Set(
      (paymentIntentsData || []).map((pi: any) => pi.screening_id)
    );

    console.log('[getClinicScreenings] Payment intents found:', paymentIntentsData?.length || 0);
    console.log('[getClinicScreenings] Settled screening IDs:', Array.from(settledScreeningIds));
    console.log('[getClinicScreenings] Screenings found:', screeningsData?.length || 0);

    // Filter screenings: must have SETTLED payment and no clinical review
    const data = (screeningsData || []).filter((screening: any) => {
      const hasSettledPayment = settledScreeningIds.has(screening.id);
      const hasClinicalReview = reviewedScreeningIds.has(screening.id);
      
      console.log(`[getClinicScreenings] Screening ${screening.id}:`, {
        hasSettledPayment,
        hasClinicalReview,
        willInclude: hasSettledPayment && !hasClinicalReview
      });
      
      return hasSettledPayment && !hasClinicalReview;
    });

    console.log('[getClinicScreenings] Filtered screenings count:', data.length);

    // Transform the data to match our interface
    const screenings: ClinicScreening[] = (data || []).map((screening: any) => ({
      id: screening.id,
      child_name: screening.child_name,
      child_age_months: screening.child_age_months,
      ai_risk_score: screening.ai_risk_score ?? null,
      ai_summary: screening.ai_summary || null,
      status: screening.status || 'PENDING_REVIEW',
      created_at: screening.created_at,
      clinical_notes: screening.clinical_notes || null,
      clinical_risk_level: screening.clinical_risk_level || null,
      reviewed_at: screening.reviewed_at || null,
    }));

    return {
      success: true,
      data: screenings,
    };
  } catch (error) {
    console.error('Unexpected error in getClinicScreenings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
