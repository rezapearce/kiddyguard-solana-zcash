'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFamilyStore } from '@/store/useFamilyStore';
import { getFamilyScreeningSessionsAction } from '@/app/actions/screeningActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Stethoscope, ArrowRight } from 'lucide-react';

const statusColors: Record<string, string> = {
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  PAYMENT_PENDING: 'bg-orange-100 text-orange-800',
  PAID: 'bg-green-100 text-green-800',
};

export function ScreeningHistory() {
  const router = useRouter();
  const { currentUser } = useFamilyStore();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const fetchSessions = async () => {
      try {
        const result = await getFamilyScreeningSessionsAction(currentUser.familyId);
        if (result.success && result.sessions) {
          setSessions(result.sessions);
        }
      } catch (error) {
        console.error('Error fetching screening sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading screening history...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5" />
          Screening History
        </CardTitle>
        <CardDescription>
          View past developmental screenings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No screenings yet</p>
            <Button onClick={() => router.push('/screening/wizard')}>
              Start Your First Screening
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <Card
                key={session.session_id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/screening/results?sessionId=${session.session_id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{session.child_name}</h3>
                        <Badge className={statusColors[session.status] || 'bg-gray-100 text-gray-800'}>
                          {session.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Age: {session.child_age_months} months • {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
