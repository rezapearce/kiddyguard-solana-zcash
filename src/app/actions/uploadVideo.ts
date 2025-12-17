'use server';

import { createClient } from '@supabase/supabase-js';
import { supabaseServer } from '@/lib/supabase-server';

// Create isolated storage client with service role key
// This ensures no session contamination and proper RLS bypass
function getStorageClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceKey) {
    return null;
  }
  
  // Create fresh client instance to ensure isolation
  return createClient(supabaseUrl, serviceKey, {
    auth: { 
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export interface UploadVideoResult {
  success: boolean;
  path?: string;
  error?: string;
}

/**
 * Server Action: Upload video evidence to Supabase Storage
 * Uses service role client to bypass RLS policies
 * Accepts FormData with file as ArrayBuffer
 */
export async function uploadVideo(formData: FormData): Promise<UploadVideoResult> {
  console.log('[video-upload] server action called');
  
  try {
    const filePath = formData.get('filePath') as string;
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const screeningId = formData.get('screeningId') as string;
    const questionId = formData.get('questionId') as string;

    if (!filePath || !file || !userId || !screeningId || !questionId) {
      return {
        success: false,
        error: 'Missing required parameters',
      };
    }

    console.log('[video-upload] uploading to storage:', filePath, 'size:', file.size);
    console.log('[video-upload] using client:', supabaseServer ? 'Service Role' : 'NONE - WILL FAIL');
    
    // CRITICAL: We MUST use service role for storage uploads to bypass RLS
    const storageClient = getStorageClient();
    
    if (!storageClient) {
      console.error('[video-upload] CRITICAL: Service role key not available! Storage uploads require service role to bypass RLS.');
      return {
        success: false,
        error: 'Storage service not configured. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.',
      };
    }
    
    console.log('[video-upload] Using isolated service role client for storage');
    
    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    
    console.log('[video-upload] attempting upload to bucket: clinical-evidence');
    console.log('[video-upload] filePath:', filePath);
    console.log('[video-upload] storageClient type:', supabaseServer ? 'Service Role' : 'Fallback');
    
    // Use service role client explicitly - this should bypass all RLS policies
    const { data, error } = await storageClient.storage
      .from('clinical-evidence')
      .upload(filePath, arrayBuffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'video/webm',
      });

    if (error) {
      console.error('[video-upload] storage error:', JSON.stringify(error, null, 2));
      console.error('[video-upload] error message:', error.message);
      console.error('[video-upload] error name:', error.name);
      // Check if statusCode exists before accessing it
      if ('statusCode' in error) {
        console.error('[video-upload] error code:', (error as any).statusCode);
      }
      console.error('[video-upload] service role available:', !!supabaseServer);
      console.error('[video-upload] environment check:', {
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      });
      
      // If RLS error persists with service role, suggest checking storage policies
      if (error.message?.includes('row-level security') || error.message?.includes('RLS')) {
        return {
          success: false,
          error: `Storage RLS error: ${error.message}. Ensure SUPABASE_SERVICE_ROLE_KEY is set and storage policies allow service role uploads.`,
        };
      }
      
      return {
        success: false,
        error: `Failed to upload video: ${error.message}`,
      };
    }

    console.log('[video-upload] upload successful:', data.path);
    return {
      success: true,
      path: data.path,
    };
  } catch (error) {
    console.error('[video-upload] unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
