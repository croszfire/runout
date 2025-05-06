import React from 'react';
import { Calculator, RefreshCw, Save } from 'lucide-react';
import { InputWithLabel } from './InputWithLabel';
import { LineCalculator } from '../types';

interface CalculatorFormProps {
  line: LineCalculator;
  lineNum: string;
  updateLineValue: (lineNumber: number, field: keyof LineCalculator, value: string) => void;
  handleModelChange: (lineNumber: number, index: number, value: string) => void;
  calculateTime: (lineNumber: number) => void;
  resetCalculator: (lineNumber: number) => void;
  saveCalculation: (lineNumber: number) => void;
  formatDisplayTime: (time: string) => string;
  darkMode?: boolean;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  line,
  lineNum,
  updateLineValue,
  handleModelChange,
  calculateTime,
  resetCalculator,
  saveCalculation,
  formatDisplayTime,
  darkMode = false,
}) => {
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-800';
  const resultBg = darkMode ? 'bg-gray-700' : 'bg-green-50';
  const resultBorder = darkMode ? 'border-gray-600' : 'border-green-200';
  const resultText = darkMode ? 'text-gray-100' : 'text-green-800';

  return (
    <div className="space-y-4">
      <InputWithLabel
        label="Current Progress"
        type="number"
        value={line.currentProgress}
        onChange={(value) => updateLineValue(Number(lineNum), 'currentProgress', value)}
        placeholder="Enter current progress"
        inputMode="decimal"
        darkMode={darkMode}
      />

      <InputWithLabel
        label="Recorded Time (Military Format)"
        type="text"
        value={line.recordedTime}
        onChange={(value) => updateLineValue(Number(lineNum), 'recordedTime', value)}
        placeholder="Enter time (e.g., 1330)"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        darkMode={darkMode}
      />

      <InputWithLabel
        label="Start Count"
        type="number"
        value={line.startCount}
        onChange={(value) => updateLineValue(Number(lineNum), 'startCount', value)}
        placeholder="Enter start count"
        inputMode="decimal"
        darkMode={darkMode}
      />

      <div>
        <label className={`block text-sm font-medium ${textColor} mb-1`}>
          Units Leading Up
        </label>
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {line.models.map((model, index) => (
            <input
              key={index}
              type="number"
              inputMode="decimal"
              value={model}
              onChange={(e) => handleModelChange(Number(lineNum), index, e.target.value)}
              className={`w-full px-2 sm:px-3 py-2 border ${darkMode ? 'border-gray-600' : 'border-gray-300'} ${darkMode ? 'bg-gray-700' : 'bg-white'} ${textColor} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-sm sm:text-base`}
              placeholder={`#${index + 1}`}
            />
          ))}
        </div>
      </div>

      <InputWithLabel
        label="Line Rate (units per minute)"
        type="number"
        value={line.lineRate}
        onChange={(value) => updateLineValue(Number(lineNum), 'lineRate', value)}
        placeholder="Enter line rate"
        inputMode="decimal"
        step="0.001"
        darkMode={darkMode}
      />

      <div className="flex space-x-2">
        <button
          onClick={() => calculateTime(Number(lineNum))}
          className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 text-base"
        >
          <Calculator className="w-5 h-5" />
          <span>Calculate</span>
        </button>
        
        <button
          onClick={() => resetCalculator(Number(lineNum))}
          className="px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
          title="Reset calculator"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {line.error && (
        <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 rounded-md text-sm sm:text-base">
          {line.error}
        </div>
      )}

      {line.result && (
        <div className={`p-3 sm:p-4 ${resultBg} border ${resultBorder} rounded-md`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className={`text-base sm:text-lg font-semibold ${resultText}`}>
              Calculation Results for Line {lineNum}
            </h3>
            <button
              onClick={() => saveCalculation(Number(lineNum))}
              className="text-indigo-600 hover:text-indigo-700 p-1"
              title="Save calculation"
            >
              <Save className="w-5 h-5" />
            </button>
          </div>
          <div className={`space-y-2 ${resultText} text-sm sm:text-base`}>
            <p>Recorded Time: <span className="font-mono font-bold">{formatDisplayTime(line.recordedTime)}</span></p>
            <p>Units ({line.result.remainingWork.toFixed(2)}): <span className="font-mono font-bold">{line.result.remainingWorkTime}</span></p>
            <p>
              Completion Time: <span className="font-mono font-bold">{formatDisplayTime(line.result.completionTime)} on {line.result.completionDate}</span>
              <span className="ml-2 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded text-xs font-semibold">
                {line.result.completionShift} Shift
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};