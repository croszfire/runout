import React from 'react';

interface InputWithLabelProps {
  label: string;
  type: 'text' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'numeric' | 'decimal';
  className?: string;
  maxLength?: number;
  step?: string;
  pattern?: string;
  darkMode?: boolean;
}

export const InputWithLabel: React.FC<InputWithLabelProps> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  inputMode,
  className = '',
  maxLength,
  step,
  pattern,
  darkMode = false,
}) => {
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-800';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-white';
  const inputBorder = darkMode ? 'border-gray-600' : 'border-gray-300';

  return (
    <div>
      <label className={`block text-sm font-medium ${textColor} mb-1`}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border ${inputBorder} ${inputBg} ${textColor} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base ${className}`}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        step={step}
        pattern={pattern}
      />
    </div>
  );
};