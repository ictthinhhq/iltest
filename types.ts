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