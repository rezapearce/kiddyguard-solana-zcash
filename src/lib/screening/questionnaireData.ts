import { DenverIIQuestion } from '@/types';
import { denverIIQuestions } from './denverIIQuestions';

/**
 * Determines the age group based on child's age in months
 */
export function getAgeGroup(ageMonths: number): string {
  if (ageMonths < 3) return '0-3';
  if (ageMonths < 6) return '3-6';
  if (ageMonths < 9) return '6-9';
  if (ageMonths < 12) return '9-12';
  if (ageMonths < 15) return '12-15';
  if (ageMonths < 18) return '15-18';
  if (ageMonths < 24) return '18-24';
  if (ageMonths < 30) return '24-30';
  if (ageMonths < 36) return '30-36';
  return '30-36'; // Default to highest age group
}

/**
 * Filters questions based on child's age
 * Returns questions for the child's current age group and previous age groups
 * (to ensure we don't miss milestones that should have been achieved earlier)
 */
export function getQuestionsForAge(ageMonths: number): DenverIIQuestion[] {
  const ageGroup = getAgeGroup(ageMonths);
  
  // Get all questions up to and including the current age group
  const ageGroupOrder = ['0-3', '3-6', '6-9', '9-12', '12-15', '15-18', '18-24', '24-30', '30-36'];
  const currentIndex = ageGroupOrder.indexOf(ageGroup);
  
  // Include current age group and one previous age group for safety
  const relevantGroups = ageGroupOrder.slice(
    Math.max(0, currentIndex - 1),
    currentIndex + 1
  );
  
  return denverIIQuestions.filter(q => relevantGroups.includes(q.ageGroup));
}

/**
 * Gets questions for a specific age group
 */
export function getQuestionsByAgeGroup(ageGroup: string): DenverIIQuestion[] {
  return denverIIQuestions.filter(q => q.ageGroup === ageGroup);
}

/**
 * Gets the total number of questions for an age
 */
export function getQuestionCountForAge(ageMonths: number): number {
  return getQuestionsForAge(ageMonths).length;
}
