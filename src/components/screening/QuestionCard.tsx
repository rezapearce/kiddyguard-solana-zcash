'use client';

import { DenverIIQuestion, ScreeningResponseValue } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QuestionCardProps {
  question: DenverIIQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedValue?: ScreeningResponseValue;
  onSelect: (value: ScreeningResponseValue) => void;
}

const categoryLabels: Record<string, string> = {
  gross_motor: 'Gross Motor',
  fine_motor: 'Fine Motor',
  language: 'Language',
  personal_social: 'Personal-Social',
};

const categoryColors: Record<string, string> = {
  gross_motor: 'bg-blue-100 text-blue-800',
  fine_motor: 'bg-green-100 text-green-800',
  language: 'bg-purple-100 text-purple-800',
  personal_social: 'bg-orange-100 text-orange-800',
};

export function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  selectedValue,
  onSelect,
}: QuestionCardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge className={categoryColors[question.category] || 'bg-gray-100 text-gray-800'}>
            {categoryLabels[question.category] || question.category}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
        </div>
        <CardTitle className="text-xl">{question.questionText}</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Expected milestone at {question.milestoneAgeMonths} months
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button
            variant={selectedValue === 'yes' ? 'default' : 'outline'}
            className="w-full justify-start h-auto py-4 text-left"
            onClick={() => onSelect('yes')}
          >
            <span className="font-semibold mr-2">✓</span>
            <span>Yes, my child can do this</span>
          </Button>
          <Button
            variant={selectedValue === 'sometimes' ? 'default' : 'outline'}
            className="w-full justify-start h-auto py-4 text-left"
            onClick={() => onSelect('sometimes')}
          >
            <span className="font-semibold mr-2">~</span>
            <span>Sometimes / Partially</span>
          </Button>
          <Button
            variant={selectedValue === 'no' ? 'default' : 'outline'}
            className="w-full justify-start h-auto py-4 text-left"
            onClick={() => onSelect('no')}
          >
            <span className="font-semibold mr-2">✗</span>
            <span>No, my child cannot do this yet</span>
          </Button>
          <Button
            variant={selectedValue === 'not_applicable' ? 'default' : 'outline'}
            className="w-full justify-start h-auto py-4 text-left"
            onClick={() => onSelect('not_applicable')}
          >
            <span className="font-semibold mr-2">—</span>
            <span>Not Applicable</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
