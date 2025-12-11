'use client';

import { Suspense } from 'react';
import { ScreeningResults } from '@/components/screening/ScreeningResults';
import { Loader2 } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
}

export default function ScreeningResultsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ScreeningResults />
    </Suspense>
  );
}
