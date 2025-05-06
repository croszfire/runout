export interface CalculationResult {
  militaryTime: string;
  remainingWork: number;
  hoursAndMinutes: string;
  completionTime: string;
  remainingWorkTime: string;
  completionShift: 'Day' | 'Afternoon' | 'Night';
  completionDate: string;
}

export interface SavedCalculation {
  id: string;
  lineNumber: number;
  timestamp: number;
  currentProgress: string;
  startCount: string;
  models: string[];
  lineRate: string;
  recordedTime: string;
  result: CalculationResult;
}

export interface LineCalculator {
  currentProgress: string;
  startCount: string;
  models: string[];
  lineRate: string;
  recordedTime: string;
  saturdayEnabled: boolean;
  result: CalculationResult | null;
  error: string;
}

export interface ShiftSchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
  breaks: { startTime: string; endTime: string }[];
  saturdayEnabled?: boolean;
}

export interface LineSchedule {
  dayShift: ShiftSchedule;
  afternoonShift: ShiftSchedule;
  nightShift: ShiftSchedule;
}