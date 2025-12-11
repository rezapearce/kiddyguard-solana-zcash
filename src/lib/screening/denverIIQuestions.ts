import { DenverIIQuestion } from '@/types';

/**
 * Simplified Denver II questionnaire
 * 3-5 key milestones per age group (0-36 months)
 * Categories: Gross Motor, Fine Motor, Language, Personal-Social
 */

export const denverIIQuestions: DenverIIQuestion[] = [
  // Age Group: 0-3 months
  {
    questionId: 'gm_0_3_1',
    questionText: 'Can your baby lift their head when lying on their stomach?',
    category: 'gross_motor',
    ageGroup: '0-3',
    milestoneAgeMonths: 1,
  },
  {
    questionId: 'fm_0_3_1',
    questionText: 'Does your baby follow objects with their eyes?',
    category: 'fine_motor',
    ageGroup: '0-3',
    milestoneAgeMonths: 2,
  },
  {
    questionId: 'lang_0_3_1',
    questionText: 'Does your baby make cooing sounds?',
    category: 'language',
    ageGroup: '0-3',
    milestoneAgeMonths: 2,
  },
  {
    questionId: 'ps_0_3_1',
    questionText: 'Does your baby smile in response to your face?',
    category: 'personal_social',
    ageGroup: '0-3',
    milestoneAgeMonths: 2,
  },

  // Age Group: 3-6 months
  {
    questionId: 'gm_3_6_1',
    questionText: 'Can your baby roll from stomach to back?',
    category: 'gross_motor',
    ageGroup: '3-6',
    milestoneAgeMonths: 4,
  },
  {
    questionId: 'gm_3_6_2',
    questionText: 'Can your baby sit with support?',
    category: 'gross_motor',
    ageGroup: '3-6',
    milestoneAgeMonths: 5,
  },
  {
    questionId: 'fm_3_6_1',
    questionText: 'Does your baby reach for and grasp objects?',
    category: 'fine_motor',
    ageGroup: '3-6',
    milestoneAgeMonths: 4,
  },
  {
    questionId: 'lang_3_6_1',
    questionText: 'Does your baby babble (make repetitive sounds like "ba-ba-ba")?',
    category: 'language',
    ageGroup: '3-6',
    milestoneAgeMonths: 5,
  },
  {
    questionId: 'ps_3_6_1',
    questionText: 'Does your baby recognize familiar faces?',
    category: 'personal_social',
    ageGroup: '3-6',
    milestoneAgeMonths: 4,
  },

  // Age Group: 6-9 months
  {
    questionId: 'gm_6_9_1',
    questionText: 'Can your baby sit without support?',
    category: 'gross_motor',
    ageGroup: '6-9',
    milestoneAgeMonths: 7,
  },
  {
    questionId: 'gm_6_9_2',
    questionText: 'Can your baby crawl on hands and knees?',
    category: 'gross_motor',
    ageGroup: '6-9',
    milestoneAgeMonths: 8,
  },
  {
    questionId: 'fm_6_9_1',
    questionText: 'Can your baby transfer objects from one hand to the other?',
    category: 'fine_motor',
    ageGroup: '6-9',
    milestoneAgeMonths: 7,
  },
  {
    questionId: 'lang_6_9_1',
    questionText: 'Does your baby respond to their name?',
    category: 'language',
    ageGroup: '6-9',
    milestoneAgeMonths: 7,
  },
  {
    questionId: 'ps_6_9_1',
    questionText: 'Does your baby show stranger anxiety or wariness?',
    category: 'personal_social',
    ageGroup: '6-9',
    milestoneAgeMonths: 8,
  },

  // Age Group: 9-12 months
  {
    questionId: 'gm_9_12_1',
    questionText: 'Can your baby pull themselves up to stand?',
    category: 'gross_motor',
    ageGroup: '9-12',
    milestoneAgeMonths: 10,
  },
  {
    questionId: 'gm_9_12_2',
    questionText: 'Can your baby walk while holding onto furniture (cruising)?',
    category: 'gross_motor',
    ageGroup: '9-12',
    milestoneAgeMonths: 11,
  },
  {
    questionId: 'fm_9_12_1',
    questionText: 'Can your baby use a pincer grasp (thumb and index finger) to pick up small objects?',
    category: 'fine_motor',
    ageGroup: '9-12',
    milestoneAgeMonths: 10,
  },
  {
    questionId: 'lang_9_12_1',
    questionText: 'Does your baby say "mama" or "dada" with meaning?',
    category: 'language',
    ageGroup: '9-12',
    milestoneAgeMonths: 10,
  },
  {
    questionId: 'ps_9_12_1',
    questionText: 'Does your baby wave bye-bye or play peek-a-boo?',
    category: 'personal_social',
    ageGroup: '9-12',
    milestoneAgeMonths: 10,
  },

  // Age Group: 12-15 months
  {
    questionId: 'gm_12_15_1',
    questionText: 'Can your baby walk independently?',
    category: 'gross_motor',
    ageGroup: '12-15',
    milestoneAgeMonths: 13,
  },
  {
    questionId: 'fm_12_15_1',
    questionText: 'Can your baby stack 2 blocks?',
    category: 'fine_motor',
    ageGroup: '12-15',
    milestoneAgeMonths: 14,
  },
  {
    questionId: 'lang_12_15_1',
    questionText: 'Does your baby say at least 3 words besides "mama" and "dada"?',
    category: 'language',
    ageGroup: '12-15',
    milestoneAgeMonths: 14,
  },
  {
    questionId: 'ps_12_15_1',
    questionText: 'Does your baby imitate actions like clapping or feeding a doll?',
    category: 'personal_social',
    ageGroup: '12-15',
    milestoneAgeMonths: 13,
  },

  // Age Group: 15-18 months
  {
    questionId: 'gm_15_18_1',
    questionText: 'Can your baby walk up stairs with help?',
    category: 'gross_motor',
    ageGroup: '15-18',
    milestoneAgeMonths: 16,
  },
  {
    questionId: 'fm_15_18_1',
    questionText: 'Can your baby scribble with a crayon?',
    category: 'fine_motor',
    ageGroup: '15-18',
    milestoneAgeMonths: 16,
  },
  {
    questionId: 'lang_15_18_1',
    questionText: 'Does your baby follow simple one-step commands (e.g., "give me the ball")?',
    category: 'language',
    ageGroup: '15-18',
    milestoneAgeMonths: 17,
  },
  {
    questionId: 'ps_15_18_1',
    questionText: 'Does your baby point to show you something interesting?',
    category: 'personal_social',
    ageGroup: '15-18',
    milestoneAgeMonths: 16,
  },

  // Age Group: 18-24 months
  {
    questionId: 'gm_18_24_1',
    questionText: 'Can your baby run?',
    category: 'gross_motor',
    ageGroup: '18-24',
    milestoneAgeMonths: 20,
  },
  {
    questionId: 'gm_18_24_2',
    questionText: 'Can your baby kick a ball?',
    category: 'gross_motor',
    ageGroup: '18-24',
    milestoneAgeMonths: 22,
  },
  {
    questionId: 'fm_18_24_1',
    questionText: 'Can your baby stack 4 blocks?',
    category: 'fine_motor',
    ageGroup: '18-24',
    milestoneAgeMonths: 20,
  },
  {
    questionId: 'lang_18_24_1',
    questionText: 'Does your baby say at least 20 words?',
    category: 'language',
    ageGroup: '18-24',
    milestoneAgeMonths: 20,
  },
  {
    questionId: 'ps_18_24_1',
    questionText: 'Does your baby help with simple tasks like putting toys away?',
    category: 'personal_social',
    ageGroup: '18-24',
    milestoneAgeMonths: 21,
  },

  // Age Group: 24-30 months
  {
    questionId: 'gm_24_30_1',
    questionText: 'Can your baby jump with both feet off the ground?',
    category: 'gross_motor',
    ageGroup: '24-30',
    milestoneAgeMonths: 26,
  },
  {
    questionId: 'fm_24_30_1',
    questionText: 'Can your baby draw a vertical line?',
    category: 'fine_motor',
    ageGroup: '24-30',
    milestoneAgeMonths: 27,
  },
  {
    questionId: 'lang_24_30_1',
    questionText: 'Does your baby combine 2 words (e.g., "more milk", "daddy go")?',
    category: 'language',
    ageGroup: '24-30',
    milestoneAgeMonths: 26,
  },
  {
    questionId: 'ps_24_30_1',
    questionText: 'Does your baby play alongside other children (parallel play)?',
    category: 'personal_social',
    ageGroup: '24-30',
    milestoneAgeMonths: 27,
  },

  // Age Group: 30-36 months
  {
    questionId: 'gm_30_36_1',
    questionText: 'Can your baby pedal a tricycle?',
    category: 'gross_motor',
    ageGroup: '30-36',
    milestoneAgeMonths: 32,
  },
  {
    questionId: 'fm_30_36_1',
    questionText: 'Can your baby copy a circle when drawing?',
    category: 'fine_motor',
    ageGroup: '30-36',
    milestoneAgeMonths: 33,
  },
  {
    questionId: 'lang_30_36_1',
    questionText: 'Does your baby speak in 3-word sentences?',
    category: 'language',
    ageGroup: '30-36',
    milestoneAgeMonths: 32,
  },
  {
    questionId: 'ps_30_36_1',
    questionText: 'Does your baby take turns in simple games?',
    category: 'personal_social',
    ageGroup: '30-36',
    milestoneAgeMonths: 33,
  },
];
