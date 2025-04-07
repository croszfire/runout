import React from 'react';
import { Trash2 } from 'lucide-react';
import { SavedCalculation } from '../types';

interface CalculationHistoryProps {
  savedCalculations: SavedCalculation[];
  deleteCalculation: (id: string) => void;
  formatDate: (timestamp: number) => string;
  formatDisplayTime: (time: string) => string;
  darkMode?: boolean;
}

export const CalculationHistory: React.FC<CalculationHistoryProps> = ({
  savedCalculations,
  deleteCalculation,
  formatDate,
  formatDisplayTime,
  darkMode = false,
}) => {
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-800';
  const resultBg = darkMode ? 'bg-gray-700' : 'bg-green-50';
  const resultBorder = darkMode ? 'border-gray-600' : 'border-green-200';
  const resultText = darkMode ? 'text-gray-100' : 'text-green-800';

  return (
    <div className="space-y-4">
      <h2 className={`text-lg sm:text-xl font-semibold ${textColor} mb-4`}>Calculation History</h2>
      {savedCalculations.length === 0 ? (
        <p className={`${textColor}`}>No saved calculations yet.</p>
      ) : (
        savedCalculations.map(calc => (
          <div key={calc.id} className={`p-3 sm:p-4 ${resultBg} border ${resultBorder} rounded-md text-sm sm:text-base`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className={`text-base sm:text-lg font-semibold ${resultText}`}>
                  Line {calc.lineNumber} Calculation
                </h3>
                <p className={`text-xs sm:text-sm ${resultText} opacity-75`}>
                  {formatDate(calc.timestamp)}
                </p>
              </div>
              <button
                onClick={() => deleteCalculation(calc.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className={`space-y-2 ${resultText} text-sm sm:text-base`}>
              <p>Current Progress: {calc.currentProgress}</p>
              <p>Start Count: {calc.startCount}</p>
              <p>Line Rate (units/min): {calc.lineRate}</p>
              <p>Recorded Time: {formatDisplayTime(calc.recordedTime)}</p>
              <p>Units ({calc.result.remainingWork.toFixed(2)}): {calc.result.remainingWorkTime}</p>
              <p>Completion Time: {formatDisplayTime(calc.result.completionTime)} on {calc.result.completionDate}</p>
              <p>Completion Shift: {calc.result.completionShift}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};