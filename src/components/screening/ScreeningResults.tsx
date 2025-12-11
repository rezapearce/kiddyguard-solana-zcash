'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useFamilyStore } from '@/store/useFamilyStore';
import { ScreeningRiskLevel } from '@/types';
import { getScreeningResultsAction } from '@/app/actions/screeningActions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertTriangle, AlertCircle, ArrowLeft } from 'lucide-react';

const riskLevelConfig: Record<ScreeningRiskLevel, { label: string; color: string; icon: any }> = {
  LOW: {
    label: 'Low Risk',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2,
  },
  MODERATE: {
    label: 'Moderate Risk',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: AlertTriangle,
  },
  HIGH: {
    label: 'High Risk',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertCircle,
  },
};

export function ScreeningResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useFamilyStore();
  const sessionId = searchParams.get('sessionId');

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const result = await getScreeningResultsAction(sessionId);
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to fetch results');
        }
        setResults(result.data);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading results...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || 'Results not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { session, responses, analysis } = results;
  const riskConfig = analysis
    ? riskLevelConfig[analysis.risk_level as ScreeningRiskLevel]
    : null;
  const RiskIcon = riskConfig?.icon || AlertCircle;

  // Parse recommendations if stored as JSON string
  let recommendations: string[] = [];
  if (analysis?.recommendations) {
    try {
      recommendations = JSON.parse(analysis.recommendations);
    } catch {
      recommendations = [analysis.recommendations];
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => router.push('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Screening Results</CardTitle>
                <CardDescription>
                  {session.child_name} - {session.child_age_months} months old
                </CardDescription>
              </div>
              {analysis && riskConfig && (
                <Badge className={`${riskConfig.color} border px-4 py-2`}>
                  <RiskIcon className="mr-2 h-4 w-4" />
                  {riskConfig.label}
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Analysis Card */}
        {analysis ? (
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>
                Risk Score: {analysis.risk_score?.toFixed(1) || 'N/A'} / 100
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-muted-foreground">{analysis.summary}</p>
              </div>
              {recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Recommendations</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  AI analysis is being generated. Please check back in a moment.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Responses Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Response Summary</CardTitle>
            <CardDescription>
              {responses.length} questions answered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {responses.filter((r: any) => r.response_value === 'yes').length}
                </div>
                <div className="text-sm text-green-600">Achieved</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">
                  {responses.filter((r: any) => r.response_value === 'sometimes').length}
                </div>
                <div className="text-sm text-yellow-600">Partial</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">
                  {responses.filter((r: any) => r.response_value === 'no').length}
                </div>
                <div className="text-sm text-red-600">Not Achieved</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-700">
                  {responses.filter((r: any) => r.response_value === 'not_applicable').length}
                </div>
                <div className="text-sm text-gray-600">N/A</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        {session.payment_intent_id && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
              <CardDescription>
                Payment intent created. Status: {session.status}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/')}>
                View Payment Status
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
