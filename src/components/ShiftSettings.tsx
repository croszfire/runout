import React from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import { InputWithLabel } from './InputWithLabel';
import { ShiftSchedule } from '../types';

interface ShiftSettingsProps {
  shift: ShiftSchedule;
  shiftName: string;
  lineNumber: number;
  shiftType: 'dayShift' | 'afternoonShift' | 'nightShift';
  toggleShift: (lineNumber: number, shift: 'dayShift' | 'afternoonShift' | 'nightShift') => void;
  toggleSaturday: (lineNumber: number, shift: 'dayShift' | 'afternoonShift' | 'nightShift') => void;
  updateSchedule: (
    lineNumber: number,
    shift: 'dayShift' | 'afternoonShift' | 'nightShift',
    field: keyof ShiftSchedule,
    value: string | boolean
  ) => void;
  updateBreak: (
    lineNumber: number,
    shift: 'dayShift' | 'afternoonShift' | 'nightShift',
    breakIndex: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => void;
  addBreak: (lineNumber: number, shift: 'dayShift' | 'afternoonShift' | 'nightShift') => void;
  removeBreak: (lineNumber: number, shift: 'dayShift' | 'afternoonShift' | 'nightShift', breakIndex: number) => void;
  darkMode?: boolean;
}

export const ShiftSettings: React.FC<ShiftSettingsProps> = ({
  shift,
  shiftName,
  lineNumber,
  shiftType,
  toggleShift,
  toggleSaturday,
  updateSchedule,
  updateBreak,
  addBreak,
  removeBreak,
  darkMode = false,
}) => {
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-800';
  const inputBorder = darkMode ? 'border-gray-600' : 'border-gray-300';

  return (
    <div className={`p-4 border ${inputBorder} rounded-lg`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-medium ${textColor}`}>{shiftName}</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${textColor}`}>Saturday</span>
            <button
              onClick={() => toggleSaturday(lineNumber, shiftType)}
              className="flex items-center"
            >
              {shift.saturdayEnabled ? (
                <ToggleRight className="w-6 h-6 text-indigo-600" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${textColor}`}>
              {shift.enabled ? 'Enabled' : 'Disabled'}
            </span>
            <button onClick={() => toggleShift(lineNumber, shiftType)}>
              {shift.enabled ? (
                <ToggleRight className="w-6 h-6 text-indigo-600" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <InputWithLabel
          label="Start Time"
          type="text"
          value={shift.startTime}
          onChange={(value) => updateSchedule(lineNumber, shiftType, 'startTime', value)}
          placeholder="0600"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          darkMode={darkMode}
        />
        <InputWithLabel
          label="End Time"
          type="text"
          value={shift.endTime}
          onChange={(value) => updateSchedule(lineNumber, shiftType, 'endTime', value)}
          placeholder="1430"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          darkMode={darkMode}
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className={`text-base font-medium ${textColor}`}>Breaks</h4>
          <button
            onClick={() => addBreak(lineNumber, shiftType)}
            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add Break
          </button>
        </div>
        {shift.breaks.map((breakTime, index) => (
          <div key={index} className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-end">
            <InputWithLabel
              label="Start Time"
              type="text"
              value={breakTime.startTime}
              onChange={(value) => updateBreak(lineNumber, shiftType, index, 'startTime', value)}
              placeholder="1200"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              darkMode={darkMode}
            />
            <InputWithLabel
              label="End Time"
              type="text"
              value={breakTime.endTime}
              onChange={(value) => updateBreak(lineNumber, shiftType, index, 'endTime', value)}
              placeholder="1230"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              darkMode={darkMode}
            />
            <button
              onClick={() => removeBreak(lineNumber, shiftType, index)}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};