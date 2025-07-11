
export interface QuizCategory {
  id: string;
  name: string;
  subjects: QuizSubject[];
}

export interface QuizSubject {
  id: string;
  name: string;
  blocks?: QuizBlock[];
  questionCount: number;
  isMasterBlock?: boolean;
}

export interface QuizBlock {
  id: string;
  name: string;
  questionCount: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  subject: string;
  block?: string;
}

export const quizCategories: QuizCategory[] = [
  {
    id: 'basic-medical-sciences',
    name: 'Basic Medical Sciences',
    subjects: [
      {
        id: 'anatomy',
        name: 'Anatomy',
        questionCount: 0,
        blocks: [
          { id: 'upper-limb', name: 'Upper Limb', questionCount: 50 },
          { id: 'lower-limb', name: 'Lower Limb', questionCount: 45 },
          { id: 'thorax', name: 'Thorax', questionCount: 40 },
          { id: 'abdomen', name: 'Abdomen', questionCount: 42 },
          { id: 'tapp', name: 'Pelvic & Perineum (TAPP)', questionCount: 35 },
          { id: 'head-neck', name: 'Head & Neck', questionCount: 48 },
          { id: 'neuroanatomy', name: 'Neuroanatomy', questionCount: 55 }
        ]
      },
      {
        id: 'histology',
        name: 'Histology',
        questionCount: 60,
      },
      {
        id: 'embryology',
        name: 'Embryology',
        questionCount: 45,
      },
      {
        id: 'mb-anatomy',
        name: 'MB Anatomy',
        questionCount: 315,
        isMasterBlock: true
      },
      {
        id: 'physiology',
        name: 'Physiology',
        questionCount: 0,
        blocks: [
          { id: 'block-1', name: 'Block 1', questionCount: 40 },
          { id: 'block-2', name: 'Block 2', questionCount: 42 },
          { id: 'block-3', name: 'Block 3', questionCount: 38 },
          { id: 'block-4', name: 'Block 4', questionCount: 41 },
          { id: 'block-5', name: 'Block 5', questionCount: 39 },
          { id: 'block-6', name: 'Block 6', questionCount: 44 }
        ]
      },
      {
        id: 'mb-physiology',
        name: 'MB Physiology',
        questionCount: 244,
        isMasterBlock: true
      },
      {
        id: 'biochemistry',
        name: 'Biochemistry',
        questionCount: 0,
        blocks: [
          { id: 'block-1', name: 'Block 1', questionCount: 35 },
          { id: 'block-2', name: 'Block 2', questionCount: 37 },
          { id: 'block-3', name: 'Block 3', questionCount: 33 }
        ]
      },
      {
        id: 'mb-biochemistry',
        name: 'MB Biochemistry',
        questionCount: 105,
        isMasterBlock: true
      }
    ]
  },
  {
    id: 'path-pharm',
    name: 'Path & Pharm',
    subjects: [
      {
        id: 'microbiology',
        name: 'Microbiology',
        questionCount: 0,
        blocks: [
          { id: 'block-1', name: 'Block 1: Bacteriology & Mycology', questionCount: 45 },
          { id: 'block-2', name: 'Block 2: Mycology & Virology', questionCount: 42 },
          { id: 'block-3', name: 'Block 3: Parasitology', questionCount: 38 }
        ]
      },
      {
        id: 'pathology',
        name: 'Pathology',
        questionCount: 0,
        blocks: [
          { id: 'block-1', name: 'Block 1', questionCount: 40 },
          { id: 'block-2', name: 'Block 2', questionCount: 41 }
        ]
      },
      {
        id: 'chemical-pathology',
        name: 'Chemical Pathology',
        questionCount: 0,
        blocks: [
          { id: 'block-1', name: 'Block 1', questionCount: 35 },
          { id: 'block-2', name: 'Block 2', questionCount: 37 }
        ]
      },
      {
        id: 'hematology',
        name: 'Hematology',
        questionCount: 0,
        blocks: [
          { id: 'block-1', name: 'Block 1', questionCount: 32 },
          { id: 'block-2', name: 'Block 2', questionCount: 34 }
        ]
      },
      {
        id: 'pharmacology',
        name: 'Pharmacology',
        questionCount: 0,
        blocks: [
          { id: 'block-1', name: 'Block 1', questionCount: 38 },
          { id: 'block-2', name: 'Block 2', questionCount: 40 }
        ]
      },
      {
        id: 'mb-path-pharm',
        name: 'MB Path & Pharm',
        questionCount: 482,
        isMasterBlock: true
      }
    ]
  }
];

// Sample questions for demonstration
export const sampleQuestions: Question[] = [
  {
    id: '1',
    question: 'Which of the following bones forms the medial border of the anatomical snuffbox?',
    options: ['Scaphoid', 'Lunate', 'Trapezium', 'Radius'],
    correctAnswer: 0,
    explanation: 'The scaphoid bone forms the medial border of the anatomical snuffbox.',
    subject: 'anatomy',
    block: 'upper-limb'
  },
  {
    id: '2',
    question: 'The normal resting membrane potential of a typical neuron is approximately:',
    options: ['-90mV', '-70mV', '-55mV', '-40mV'],
    correctAnswer: 1,
    explanation: 'The typical resting membrane potential of neurons is around -70mV.',
    subject: 'physiology',
    block: 'block-1'
  }
];
