
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
          { id: 'upper-lower-limbs', name: 'Upper and Lower Limbs', questionCount: 95 },
          { id: 'thorax-abdomen-pelvic', name: 'Thorax Abdomen Pelvic Perineum', questionCount: 117 },
          { id: 'head-neck-neuro', name: 'Head Neck and Neuro', questionCount: 103 },
          { id: 'anatomy-mb', name: 'Anatomy MB', questionCount: 315 },
          { id: 'general-anatomy', name: 'General Anatomy', questionCount: 0 },
          { id: 'embryology', name: 'Embryology', questionCount: 0 },
          { id: 'histology', name: 'Histology', questionCount: 0 }
        ]
      },
      {
        id: 'biochemistry',
        name: 'Biochemistry',
        questionCount: 0,
        blocks: [
          { id: 'block-1', name: 'Block 1', questionCount: 35 },
          { id: 'block-2', name: 'Block 2', questionCount: 37 },
          { id: 'block-3', name: 'Block 3', questionCount: 33 },
          { id: 'biochemistry-mb', name: 'Biochemistry MB', questionCount: 105 },
          { id: 'metabolism', name: 'Metabolism', questionCount: 0 },
          { id: 'enzymes', name: 'Enzymes', questionCount: 0 },
          { id: 'molecular-biology', name: 'Molecular Biology', questionCount: 0 }
        ]
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
          { id: 'block-6', name: 'Block 6', questionCount: 44 },
          { id: 'physiology-mb', name: 'Physiology MB', questionCount: 244 },
          { id: 'cardiovascular', name: 'Cardiovascular Physiology', questionCount: 0 },
          { id: 'respiratory', name: 'Respiratory Physiology', questionCount: 0 },
          { id: 'renal', name: 'Renal Physiology', questionCount: 0 },
          { id: 'neurophysiology', name: 'Neurophysiology', questionCount: 0 }
        ]
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
          { id: 'bacteriology-mycology', name: 'Bacteriology and Mycology', questionCount: 45 },
          { id: 'virology-mycology', name: 'Virology and Mycology', questionCount: 42 },
          { id: 'parasitology', name: 'Parasitology', questionCount: 38 },
          { id: 'microbiology-mb', name: 'Microbiology MB', questionCount: 125 },
          { id: 'immunology', name: 'Immunology', questionCount: 0 },
          { id: 'medical-microbiology', name: 'Medical Microbiology', questionCount: 0 },
          { id: 'antimicrobials', name: 'Antimicrobials', questionCount: 0 }
        ]
      },
      {
        id: 'hematology',
        name: 'Hematology',
        questionCount: 0,
        blocks: [
          { id: 'first-block', name: 'First Block', questionCount: 32 },
          { id: 'second-block', name: 'Second Block', questionCount: 34 },
          { id: 'hematology-mb', name: 'Hematology MB', questionCount: 66 },
          { id: 'blood-disorders', name: 'Blood Disorders', questionCount: 0 },
          { id: 'coagulation', name: 'Coagulation', questionCount: 0 }
        ]
      },
      {
        id: 'pharmacology',
        name: 'Pharmacology',
        questionCount: 0,
        blocks: [
          { id: 'first-block', name: 'First Block', questionCount: 38 },
          { id: 'second-block', name: 'Second Block', questionCount: 40 },
          { id: 'pharmacology-mb', name: 'Pharmacology MB', questionCount: 78 },
          { id: 'pharmacokinetics', name: 'Pharmacokinetics', questionCount: 0 },
          { id: 'pharmacodynamics', name: 'Pharmacodynamics', questionCount: 0 },
          { id: 'drug-interactions', name: 'Drug Interactions', questionCount: 0 }
        ]
      },
      {
        id: 'pathology',
        name: 'Pathology',
        questionCount: 0,
        blocks: [
          { id: 'first-block', name: 'First Block', questionCount: 40 },
          { id: 'second-block', name: 'Second Block', questionCount: 41 },
          { id: 'pathology-mb', name: 'Pathology MB', questionCount: 81 },
          { id: 'general-pathology', name: 'General Pathology', questionCount: 0 },
          { id: 'systemic-pathology', name: 'Systemic Pathology', questionCount: 0 },
          { id: 'forensic-pathology', name: 'Forensic Pathology', questionCount: 0 }
        ]
      },
      {
        id: 'chempath',
        name: 'Chempath',
        questionCount: 0,
        blocks: [
          { id: 'first-block', name: 'First Block', questionCount: 35 },
          { id: 'second-block', name: 'Second Block', questionCount: 37 },
          { id: 'chempath-mb', name: 'Chempath MB', questionCount: 72 },
          { id: 'clinical-chemistry', name: 'Clinical Chemistry', questionCount: 0 },
          { id: 'laboratory-medicine', name: 'Laboratory Medicine', questionCount: 0 },
          { id: 'diagnostic-tests', name: 'Diagnostic Tests', questionCount: 0 }
        ]
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
