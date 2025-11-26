export interface Competency {
  name: string;
  score: number; // 0-100 scale
  description: string;
}

export interface LearningPathItem {
  timeframe: string;
  title: string;
  description: string;
  actionItems: string[];
}

export interface AnalysisResult {
  summary: string;
  competencies: Competency[];
  strengths: string[];
  weaknesses: string[];
  learningPath: LearningPathItem[];
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  QUIZ = 'QUIZ', // New status for taking the quiz
  INPUT = 'INPUT', // New status for entering data
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

// BioLab Specific Types
export interface ExperimentDesign {
  bacteriaType: string;
  temperature: string;
  ph: string;
  nutrient: string;
  prediction: string;
}

export interface DataPoint {
  time: string; // e.g., "0h", "2h"
  value: string; // e.g., OD value or colony count
}

export interface ExperimentData {
  dataPoints: DataPoint[];
  observation: string;
}

export interface ExperimentApplication {
  conclusion: string;
  practicalApp: string; // e.g., yogurt, safety
}

// Quiz Types
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index
  competencyType: string;
}

export interface QuizResult {
  score: number; // X/Total
  level: 'Cơ bản' | 'Khá' | 'Nâng cao';
  details: string; // Brief description based on score
}

// Teacher Dashboard Types
export interface StudentSubmission {
  id: string;
  studentName: string;
  timestamp: Date;
  quizResult?: QuizResult; // Added quiz result
  design: ExperimentDesign;
  data: ExperimentData;
  application: ExperimentApplication;
  analysis: AnalysisResult;
}

export interface ClassAnalysisResult {
  overallAssessment: string;
  commonMisconceptions: string[];
  recommendedTeachingStrategies: string[];
}