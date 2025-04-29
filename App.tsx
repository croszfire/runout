import React, { useState, useEffect } from 'react';
import { Clock, Calculator, Settings, Sun, Moon, RefreshCw, Save, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface CalculationResult {
  militaryTime: string;
  remainingWork: number;
  hoursAndMinutes: string;
  completionTime: string;
  remainingWorkTime: string;
  completionShift: 'Day' | 'Afternoon' | 'Night';
  completionDate: string;
}

interface SavedCalculation {
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

interface LineCalculator {
  currentProgress: string;
  startCount: string;
  models: string[];
  lineRate: string;
  recordedTime: string;
  result: CalculationResult | null;
  error: string;
}

interface ShiftSchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
  breaks: { startTime: string; endTime: string }[];
}

interface LineSchedule {
  dayShift: ShiftSchedule;
  afternoonShift: ShiftSchedule;
  nightShift: ShiftSchedule;
}

const getInitialLineState = (lineNumber: number): LineCalculator => {
  let lineRate = '';
  
  if ([2, 3, 4, 7].includes(lineNumber)) {
    lineRate = '5.2';
  } else if (lineNumber === 5) {
    lineRate = '2.3';
  } else if (lineNumber === 6) {
    lineRate = '1.0';
  }
  
  return {
    currentProgress: '',
    startCount: '',
    models: ['', '', '', '', ''],
    lineRate,
    recordedTime: '',
    result: null,
    error: ''
  };
};

const initialSchedule: Record<number, LineSchedule> = {
  2: {
    dayShift: {
      enabled: true,
      startTime: '0635',
      endTime: '1505',
      breaks: [
        { startTime: '0900', endTime: '0910' },
        { startTime: '1130', endTime: '1200' },
        { startTime: '1400', endTime: '1410' }
      ]
    },
    afternoonShift: {
      enabled: false,
      startTime: '1500',
      endTime: '2330',
      breaks: [
        { startTime: '1700', endTime: '1710' },
        { startTime: '1930', endTime: '2000' },
        { startTime: '2200', endTime: '2210' }
      ]
    },
    nightShift: {
      enabled: false,
      startTime: '2330',
      endTime: '0630',
      breaks: [
        { startTime: '0100', endTime: '0110' },
        { startTime: '0330', endTime: '0400' },
        { startTime: '0530', endTime: '0540' }
      ]
    }
  },
  3: {
    dayShift: {
      enabled: true,
      startTime: '0630',
      endTime: '1500',
      breaks: [
        { startTime: '0830', endTime: '0840' },
        { startTime: '1115', endTime: '1145' },
        { startTime: '1350', endTime: '1400' }
      ]
    },
    afternoonShift: {
      enabled: false,
      startTime: '1455',
      endTime: '2325',
      breaks: [
        { startTime: '1655', endTime: '1705' },
        { startTime: '1925', endTime: '1955' },
        { startTime: '2155', endTime: '2205' }
      ]
    },
    nightShift: {
      enabled: true,
      startTime: '2155',
      endTime: '0625',
      breaks: [
        { startTime: '2345', endTime: '2355' },
        { startTime: '0215', endTime: '0245' },
        { startTime: '0445', endTime: '0455' }
      ]
    }
  },
  4: {
    dayShift: {
      enabled: true,
      startTime: '0620',
      endTime: '1450',
      breaks: [
        { startTime: '0820', endTime: '0830' },
        { startTime: '1045', endTime: '1115' },
        { startTime: '1320', endTime: '1330' }
      ]
    },
    afternoonShift: {
      enabled: false,
      startTime: '1445',
      endTime: '2315',
      breaks: [
        { startTime: '1645', endTime: '1655' },
        { startTime: '1915', endTime: '1945' },
        { startTime: '2145', endTime: '2155' }
      ]
    },
    nightShift: {
      enabled: true,
      startTime: '2145',
      endTime: '0615',
      breaks: [
        { startTime: '2345', endTime: '2355' },
        { startTime: '0146', endTime: '0215' },
        { startTime: '0415', endTime: '0425' }
      ]
    }
  },
  5: {
    dayShift: {
      enabled: true,
      startTime: '0625',
      endTime: '1445',
      breaks: [
        { startTime: '0830', endTime: '0840' },
        { startTime: '1100', endTime: '1130' },
        { startTime: '1320', endTime: '1330' }
      ]
    },
    afternoonShift: {
      enabled: false,
      startTime: '1440',
      endTime: '2310',
      breaks: [
        { startTime: '1640', endTime: '1650' },
        { startTime: '1910', endTime: '1940' },
        { startTime: '2140', endTime: '2150' }
      ]
    },
    nightShift: {
      enabled: true,
      startTime: '2155',
      endTime: '0625',
      breaks: [
        { startTime: '0030', endTime: '0040' },
        { startTime: '0230', endTime: '0300' },
        { startTime: '0450', endTime: '0500' }
      ]
    }
  },
  6: {
    dayShift: {
      enabled: true,
      startTime: '0615',
      endTime: '1445',
      breaks: [
        { startTime: '0815', endTime: '0825' },
        { startTime: '1115', endTime: '1145' },
        { startTime: '1335', endTime: '1345' }
      ]
    },
    afternoonShift: {
      enabled: false,
      startTime: '1440',
      endTime: '2310',
      breaks: [
        { startTime: '1640', endTime: '1650' },
        { startTime: '1910', endTime: '1940' },
        { startTime: '2140', endTime: '2150' }
      ]
    },
    nightShift: {
      enabled: false,
      startTime: '2305',
      endTime: '0735',
      breaks: [
        { startTime: '0105', endTime: '0115' },
        { startTime: '0335', endTime: '0405' },
        { startTime: '0605', endTime: '0615' }
      ]
    }
  },
  7: {
    dayShift: {
      enabled: true,
      startTime: '0600',
      endTime: '1430',
      breaks: [
        { startTime: '0930', endTime: '0945' },
        { startTime: '1200', endTime: '1230' }
      ]
    },
    afternoonShift: {
      enabled: false,
      startTime: '1425',
      endTime: '2255',
      breaks: [
        { startTime: '1625', endTime: '1635' },
        { startTime: '1855', endTime: '1925' },
        { startTime: '2125', endTime: '2135' }
      ]
    },
    nightShift: {
      enabled: true,
      startTime: '2145',
      endTime: '0615',
      breaks: [
        { startTime: '0000', endTime: '0010' },
        { startTime: '0200', endTime: '0230' },
        { startTime: '0430', endTime: '0440' }
      ]
    }
  }
};

const getShiftType = (time: string, lineNumber: number, schedule: Record<number, LineSchedule>): 'Day' | 'Afternoon' | 'Night' => {
  const timeInMinutes = parseInt(time.substring(0, 2)) * 60 + parseInt(time.substring(2));
  const lineSchedule = schedule[lineNumber];

  const isInShiftTime = (shift: ShiftSchedule) => {
    if (!shift.enabled) return false;
    
    const shiftStart = parseInt(shift.startTime.substring(0, 2)) * 60 + parseInt(shift.startTime.substring(2));
    const shiftEnd = parseInt(shift.endTime.substring(0, 2)) * 60 + parseInt(shift.endTime.substring(2));

    if (shiftStart > shiftEnd) {
      // Overnight shift
      return timeInMinutes >= shiftStart || timeInMinutes < shiftEnd;
    } else {
      return timeInMinutes >= shiftStart && timeInMinutes < shiftEnd;
    }
  };

  if (isInShiftTime(lineSchedule.dayShift)) return 'Day';
  if (isInShiftTime(lineSchedule.afternoonShift)) return 'Afternoon';
  if (isInShiftTime(lineSchedule.nightShift)) return 'Night';

  // Default to the next enabled shift
  if (lineSchedule.dayShift.enabled) return 'Day';
  if (lineSchedule.afternoonShift.enabled) return 'Afternoon';
  return 'Night';
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState(2);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [activeShift, setActiveShift] = useState<'Day' | 'Afternoon' | 'Night'>('Day');
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [minimizedSections, setMinimizedSections] = useState<Record<string, boolean>>({});
  const [lines, setLines] = useState<Record<number, LineCalculator>>({
    2: getInitialLineState(2),
    3: getInitialLineState(3),
    4: getInitialLineState(4),
    5: getInitialLineState(5),
    6: getInitialLineState(6),
    7: getInitialLineState(7)
  });

  useEffect(() => {
    const loadSavedCalculations = () => {
      const saved = localStorage.getItem('savedCalculations');
      if (saved) {
        const calculations = JSON.parse(saved) as SavedCalculation[];
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentCalculations = calculations.filter(calc => calc.timestamp > oneWeekAgo);
        setSavedCalculations(recentCalculations);
        if (recentCalculations.length !== calculations.length) {
          localStorage.setItem('savedCalculations', JSON.stringify(recentCalculations));
        }
      }
    };

    loadSavedCalculations();
  }, []);

  const toggleShift = (lineNumber: number, shift: 'dayShift' | 'afternoonShift' | 'nightShift') => {
    setSchedule(prev => ({
      ...prev,
      [lineNumber]: {
        ...prev[lineNumber],
        [shift]: {
          ...prev[lineNumber][shift],
          enabled: !prev[lineNumber][shift].enabled
        }
      }
    }));
  };

  const saveCalculation = (lineNumber: number) => {
    const line = lines[lineNumber];
    if (!line.result) return;

    const newCalculation: SavedCalculation = {
      id: crypto.randomUUID(),
      lineNumber,
      timestamp: Date.now(),
      currentProgress: line.currentProgress,
      startCount: line.startCount,
      models: [...line.models],
      lineRate: line.lineRate,
      recordedTime: line.recordedTime,
      result: line.result
    };

    const updatedCalculations = [newCalculation, ...savedCalculations];
    setSavedCalculations(updatedCalculations);
    localStorage.setItem('savedCalculations', JSON.stringify(updatedCalculations));
  };

  const deleteCalculation = (id: string) => {
    const updatedCalculations = savedCalculations.filter(calc => calc.id !== id);
    setSavedCalculations(updatedCalculations);
    localStorage.setItem('savedCalculations', JSON.stringify(updatedCalculations));
  };

  const handleModelChange = (lineNumber: number, index: number, value: string) => {
    setLines(prev => ({
      ...prev,
      [lineNumber]: {
        ...prev[lineNumber],
        models: prev[lineNumber].models.map((model, i) => i === index ? value : model)
      }
    }));
  };

  const formatMilitaryTime = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length === 4) {
      const hours = parseInt(numbers.substring(0, 2));
      const minutes = parseInt(numbers.substring(2, 4));
      
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return numbers;
      }
    }
    return value.slice(0, 4);
  };

  const addTimeToMilitary = (time: string, hoursToAdd: number, minutesToAdd: number, lineNumber: number) => {
    const lineSchedule = schedule[lineNumber];
    let currentHours = parseInt(time.substring(0, 2));
    let currentMinutes = parseInt(time.substring(2));
    let remainingMinutes = hoursToAdd * 60 + minutesToAdd;

    const timeToMinutes = (time: string) => {
      const hours = parseInt(time.substring(0, 2));
      const minutes = parseInt(time.substring(2));
      return hours * 60 + minutes;
    };

    const minutesToTime = (totalMinutes: number) => {
      const hours = Math.floor(totalMinutes / 60) % 24;
      const minutes = totalMinutes % 60;
      return `${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`;
    };

    const isInBreak = (timeInMinutes: number, shift: ShiftSchedule) => {
      return shift.breaks.some(breakTime => {
        const breakStart = timeToMinutes(breakTime.startTime);
        const breakEnd = timeToMinutes(breakTime.endTime);
        return timeInMinutes >= breakStart && timeInMinutes < breakEnd;
      });
    };

    const isInShift = (timeInMinutes: number) => {
      const shifts = [
        lineSchedule.dayShift,
        lineSchedule.afternoonShift,
        lineSchedule.nightShift
      ].filter(shift => shift.enabled);

      return shifts.some(shift => {
        const shiftStart = timeToMinutes(shift.startTime);
        const shiftEnd = timeToMinutes(shift.endTime);
        
        if (shiftStart > shiftEnd) {
          return timeInMinutes >= shiftStart || timeInMinutes < shiftEnd;
        }
        return timeInMinutes >= shiftStart && timeInMinutes < shiftEnd;
      });
    };

    let currentTimeInMinutes = currentHours * 60 + currentMinutes;

    while (remainingMinutes > 0) {
      currentTimeInMinutes++;
      currentTimeInMinutes = currentTimeInMinutes % (24 * 60); // Wrap around at midnight

      const currentShift = [
        lineSchedule.dayShift,
        lineSchedule.afternoonShift,
        lineSchedule.nightShift
      ].find(shift => {
        if (!shift.enabled) return false;
        const shiftStart = timeToMinutes(shift.startTime);
        const shiftEnd = timeToMinutes(shift.endTime);
        
        if (shiftStart > shiftEnd) {
          return currentTimeInMinutes >= shiftStart || currentTimeInMinutes < shiftEnd;
        }
        return currentTimeInMinutes >= shiftStart && currentTimeInMinutes < shiftEnd;
      });

      if (isInShift(currentTimeInMinutes) && !currentShift?.breaks.some(breakTime => {
        const breakStart = timeToMinutes(breakTime.startTime);
        const breakEnd = timeToMinutes(breakTime.endTime);
        return currentTimeInMinutes >= breakStart && currentTimeInMinutes < breakEnd;
      })) {
        remainingMinutes--;
      }
    }

    return minutesToTime(currentTimeInMinutes);
  };

  const updateSchedule = (
    lineNumber: number,
    shift: 'dayShift' | 'afternoonShift' | 'nightShift',
    field: keyof ShiftSchedule,
    value: string | boolean
  ) => {
    if (field === 'enabled') {
      setSchedule(prev => ({
        ...prev,
        [lineNumber]: {
          ...prev[lineNumber],
          [shift]: {
            ...prev[lineNumber][shift],
            enabled: value as boolean
          }
        }
      }));
    } else {
      const formattedTime = formatMilitaryTime(value as string);
      setSchedule(prev => ({
        ...prev,
        [lineNumber]: {
          ...prev[lineNumber],
          [shift]: {
            ...prev[lineNumber][shift],
            [field]: formattedTime
          }
        }
      }));
    }
  };

  const updateBreak = (
    lineNumber: number,
    shift: 'dayShift' | 'afternoonShift' | 'nightShift',
    breakIndex: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const formattedTime = formatMilitaryTime(value);
    setSchedule(prev => ({
      ...prev,
      [lineNumber]: {
        ...prev[lineNumber],
        [shift]: {
          ...prev[lineNumber][shift],
          breaks: prev[lineNumber][shift].breaks.map((breakTime, index) =>
            index === breakIndex ? { ...breakTime, [field]: formattedTime } : breakTime
          )
        }
      }
    }));
  };

  const addBreak = (lineNumber: number, shift: 'dayShift' | 'afternoonShift' | 'nightShift') => {
    setSchedule(prev => ({
      ...prev,
      [lineNumber]: {
        ...prev[lineNumber],
        [shift]: {
          ...prev[lineNumber][shift],
          breaks: [...prev[lineNumber][shift].breaks, { startTime: '1200', endTime: '1230' }]
        }
      }
    }));
  };

  const removeBreak = (lineNumber: number, shift: 'dayShift' | 'afternoonShift' | 'nightShift', breakIndex: number) => {
    setSchedule(prev => ({
      ...prev,
      [lineNumber]: {
        ...prev[lineNumber],
        [shift]: {
          ...prev[lineNumber][shift],
          breaks: prev[lineNumber][shift].breaks.filter((_, index) => index !== breakIndex)
        }
      }
    }));
  };

  const calculateTime = (lineNumber: number) => {
    const line = lines[lineNumber];
    let newLine = { ...line, error: '', result: null as CalculationResult | null };

    if (!line.currentProgress || !line.startCount || !line.recordedTime) {
      newLine.error = 'Please fill in all required fields';
      setLines(prev => ({ ...prev, [lineNumber]: newLine }));
      return;
    }

    try {
      const current = parseFloat(line.currentProgress);
      const start = parseFloat(line.startCount);
      const modelNumbers = line.models
        .filter(model => model !== '')
        .map(model => parseFloat(model));

      if (isNaN(current) || isNaN(start)) {
        newLine.error = 'Please enter valid numbers';
        setLines(prev => ({ ...prev, [lineNumber]: newLine }));
        return;
      }

      const modelsSum = modelNumbers.reduce((sum, num) => sum + num, 0);
      let remainingWork = current - start - modelsSum;
      remainingWork = Math.abs(remainingWork);

      const lineRate = parseFloat(line.lineRate);
      if (isNaN(lineRate) || lineRate <= 0) {
        newLine.error = 'Invalid line rate';
        setLines(prev => ({ ...prev, [lineNumber]: newLine }));
        return;
      }

      // Simple direct calculation
      const minutes = Math.round(remainingWork / lineRate);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      const hoursAndMinutes = `${hours}h ${remainingMinutes}m`;
      const remainingWorkTime = `${hours} hours, ${remainingMinutes} minutes`;

      // Calculate completion date and time
      const now = new Date();
      const recordedHours = parseInt(line.recordedTime.substring(0, 2));
      const recordedMinutes = parseInt(line.recordedTime.substring(2));
      
      // Set the base date to today at the recorded time
      const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), recordedHours, recordedMinutes);
      
      // If the recorded time is earlier than current time, assume it's for the next day
      if (baseDate < now) {
        baseDate.setDate(baseDate.getDate() + 1);
      }

      const completionTime = addTimeToMilitary(
        line.recordedTime.replace(':', ''),
        hours,
        remainingMinutes,
        lineNumber
      );

      // Calculate the completion date based on the total time needed
      const completionDate = new Date(baseDate.getTime());
      let remainingMins = minutes;
      let currentTime = baseDate.getTime();
      
      while (remainingMins > 0) {
        currentTime += 60000; // Add one minute
        const currentDate = new Date(currentTime);
        const currentTimeStr = `${currentDate.getHours().toString().padStart(2, '0')}${currentDate.getMinutes().toString().padStart(2, '0')}`;
        
        // Check if we're in an active shift and not in a break
        if (isInActiveShift(currentTimeStr, lineNumber, schedule)) {
          remainingMins--;
        }
      }

      const completionDateStr = new Date(currentTime).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });

      const completionShift = getShiftType(completionTime, lineNumber, schedule);

      newLine.result = {
        militaryTime: line.recordedTime,
        remainingWork,
        hoursAndMinutes,
        completionTime,
        remainingWorkTime,
        completionShift,
        completionDate: completionDateStr
      };

      setLines(prev => ({ ...prev, [lineNumber]: newLine }));
    } catch (err) {
      newLine.error = 'Invalid input format';
      setLines(prev => ({ ...prev, [lineNumber]: newLine }));
    }
  };

  // Helper function to check if a time is in an active shift
  const isInActiveShift = (time: string, lineNumber: number, schedule: Record<number, LineSchedule>): boolean => {
    const timeInMinutes = parseInt(time.substring(0, 2)) * 60 + parseInt(time.substring(2));
    const lineSchedule = schedule[lineNumber];
    
    const isInShiftTime = (shift: ShiftSchedule) => {
      if (!shift.enabled) return false;
      
      const shiftStart = parseInt(shift.startTime.substring(0, 2)) * 60 + parseInt(shift.startTime.substring(2));
      const shiftEnd = parseInt(shift.endTime.substring(0, 2)) * 60 + parseInt(shift.endTime.substring(2));
      
      // Check if we're in a break
      const inBreak = shift.breaks.some(breakTime => {
        const breakStart = parseInt(breakTime.startTime.substring(0, 2)) * 60 + parseInt(breakTime.startTime.substring(2));
        const breakEnd = parseInt(breakTime.endTime.substring(0, 2)) * 60 + parseInt(breakTime.endTime.substring(2));
        return timeInMinutes >= breakStart && timeInMinutes < breakEnd;
      });
      
      if (inBreak) return false;
      
      if (shiftStart > shiftEnd) {
        // Overnight shift
        return timeInMinutes >= shiftStart || timeInMinutes < shiftEnd;
      } else {
        return timeInMinutes >= shiftStart && timeInMinutes < shiftEnd;
      }
    };

    return isInShiftTime(lineSchedule.dayShift) ||
           isInShiftTime(lineSchedule.afternoonShift) ||
           isInShiftTime(lineSchedule.nightShift);
  };

  const updateLineValue = (lineNumber: number, field: keyof LineCalculator, value: string) => {
    setLines(prev => ({
      ...prev,
      [lineNumber]: {
        ...prev[lineNumber],
        [field]: value
      }
    }));
  };

  const formatDisplayTime = (militaryTime: string) => {
    if (militaryTime.length === 4) {
      return `${militaryTime.substring(0, 2)}:${militaryTime.substring(2)}`;
    }
    return militaryTime;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const resetCalculator = (lineNumber: number) => {
    setLines(prev => ({
      ...prev,
      [lineNumber]: getInitialLineState(lineNumber)
    }));
  };

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-800';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-white';
  const inputBorder = darkMode ? 'border-gray-600' : 'border-gray-300';
  const tabBg = darkMode ? 'bg-gray-700' : 'bg-gray-100';
  const activeTabBg = darkMode ? 'bg-indigo-600' : 'bg-indigo-600';
  const resultBg = darkMode ? 'bg-gray-700' : 'bg-green-50';
  const resultBorder = darkMode ? 'border-gray-600' : 'border-green-200';
  const resultText = darkMode ? 'text-gray-100' : 'text-green-800';

  const saveSchedule = () => {
    localStorage.setItem('lineSchedules', JSON.stringify(schedule));
  };

  useEffect(() => {
    const savedSchedule = localStorage.getItem('lineSchedules');
    if (savedSchedule) {
      setSchedule(JSON.parse(savedSchedule));
    }
  }, []);

  const toggleMinimize = (sectionId: string) => {
    setMinimizedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderCalculationDetails = (line: LineCalculator) => {
    if (!line.result) return null;
    const sectionId = `calc-details-${activeTab}`;
    const isMinimized = minimizedSections[sectionId];

    return (
      <div className={`mt-6 ${cardBg} rounded-xl shadow-lg overflow-hidden`}>
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          onClick={() => toggleMinimize(sectionId)}
        >
          <h3 className={`text-lg font-semibold ${textColor}`}>Calculation Details</h3>
          <button className={`transform transition-transform ${isMinimized ? '' : 'rotate-180'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <div className={`transition-all duration-300 ease-in-out ${isMinimized ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'} overflow-hidden`}>
          <div className="p-4 space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className={`font-semibold mb-2 ${textColor}`}>Input Values</h4>
              <div className="space-y-1">
                <p>Current Progress: {line.currentProgress}</p>
                <p>Start Count: {line.startCount}</p>
                <p>Models Sum: {line.models.reduce((sum, num) => sum + (num ? parseFloat(num) : 0), 0)}</p>
                <p>Line Rate: {line.lineRate} units/min</p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className={`font-semibold mb-2 ${textColor}`}>Calculations</h4>
              <div className="space-y-1">
                <p className="font-medium">Remaining Work:</p>
                <p className="font-mono">|{line.currentProgress} - {line.startCount} - {line.models.reduce((sum, num) => sum + (num ? parseFloat(num) : 0), 0)}|</p>
                <p className="font-mono">= {line.result.remainingWork.toFixed(2)} units</p>
                
                <p className="font-medium mt-4">Time Required:</p>
                <p className="font-mono">{line.result.remainingWork.toFixed(2)} units ÷ {line.lineRate} units/min</p>
                <p className="font-mono">= {line.result.hoursAndMinutes}</p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className={`font-semibold mb-2 ${textColor}`}>Break Adjustments</h4>
              <div className="space-y-1">
                <p>{line.result.completionDate}:</p>
                <p>Total Break Time: {line.result.remainingWorkTime}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${bgColor} p-2 sm:p-4 pb-24 transition-colors duration-200`}>
      <div className="max-w-3xl mx-auto">
        <div className={`${cardBg} rounded-t-xl shadow-lg p-3 sm:p-4`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
              <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>Production Calculator</h1>
            </div>
            <div className="flex space-x-1 sm:space-x-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
              <button
                onClick={() => {
                  setShowSettings(false);
                  setShowHistory(!showHistory);
                }}
                className={`p-1.5 sm:p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 ${showHistory ? 'text-indigo-600' : textColor}`}
              >
                <Clock className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setShowHistory(false);
                  setShowSettings(!showSettings);
                }}
                className={`p-1.5 sm:p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 ${showSettings ? 'text-indigo-600' : textColor}`}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-700">
            {Object.keys(lines).map((lineNum) => (
              <button
                key={lineNum}
                onClick={() => setActiveTab(Number(lineNum))}
                className={`px-3 py-2 text-sm sm:text-base rounded-t-lg transition-colors ${
                  activeTab === Number(lineNum)
                    ? `${activeTabBg} text-white`
                    : `${tabBg} ${textColor} hover:bg-gray-200 dark:hover:bg-gray-600`
                }`}
              >
                Line {lineNum}
              </button>
            ))}
          </div>
        </div>

        <div className={`${cardBg} rounded-b-xl shadow-lg p-4 sm:p-6`}>
          {showHistory ? (
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
                    <div className={`space-y-1.5 sm:space-y-2 ${resultText}`}>
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
          ) : showSettings ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col items-center mb-8">
                <h2 className={`text-lg sm:text-xl font-semibold ${textColor} mb-6`}>Line {activeTab} Settings</h2>
                <button
                  onClick={() => {
                    saveSchedule();
                    alert('All break times have been saved!');
                  }}
                  className="w-3/4 flex items-center justify-center space-x-3 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg text-lg font-bold"
                >
                  <Save className="w-6 h-6" />
                  <span>SAVE ALL BREAK TIMES</span>
                </button>
              </div>

              {(['dayShift', 'afternoonShift', 'nightShift'] as const).map((shiftType) => {
                const shift = schedule[activeTab][shiftType];
                const shiftName = shiftType === 'dayShift' ? 'Day Shift' :
                                shiftType === 'afternoonShift' ? 'Afternoon Shift' : 'Night Shift';
                
                return (
                  <div key={shiftType} className={`p-4 border ${inputBorder} rounded-lg`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-medium ${textColor}`}>{shiftName}</h3>
                      <button
                        onClick={() => toggleShift(activeTab, shiftType)}
                        className="flex items-center space-x-2"
                      >
                        <span className={`text-sm ${textColor}`}>
                          {shift.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                        {shift.enabled ? (
                          <ToggleRight className="w-6 h-6 text-indigo-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="mb-4">
                      <button
                        onClick={() => {
                          saveSchedule();
                          alert('Break times saved successfully!');
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        <Save className="w-5 h-5" />
                        <span>Commit Break Times</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className={`block text-sm font-medium ${textColor} mb-1`}>
                          Start Time
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={shift.startTime}
                          onChange={(e) => updateSchedule(activeTab, shiftType, 'startTime', e.target.value)}
                          className={`w-full px-3 py-2 border ${inputBorder} ${inputBg} ${textColor} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base`}
                          placeholder="0600"
                          maxLength={4}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${textColor} mb-1`}>
                          End Time
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={shift.endTime}
                          onChange={(e) => updateSchedule(activeTab, shiftType, 'endTime', e.target.value)}
                          className={`w-full px-3 py-2 border ${inputBorder} ${inputBg} ${textColor} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base`}
                          placeholder="1430"
                          maxLength={4}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className={`text-base font-medium ${textColor}`}>Breaks</h4>
                        <button
                          onClick={() => addBreak(activeTab, shiftType)}
                          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Add Break
                        </button>
                      </div>
                      {shift.breaks.map((breakTime, index) => (
                        <div key={index} className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-end">
                          <div>
                            <label className={`block text-sm font-medium ${textColor} mb-1`}>
                              Start Time
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={breakTime.startTime}
                              onChange={(e) => updateBreak(activeTab, shiftType, index, 'startTime', e.target.value)}
                              className={`w-full px-3 py-2 border ${inputBorder} ${inputBg} ${textColor} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base`}
                              placeholder="1200"
                              maxLength={4}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${textColor} mb-1`}>
                              End Time
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={breakTime.endTime}
                              onChange={(e) => updateBreak(activeTab, shiftType, index, 'endTime', e.target.value)}
                              className={`w-full px-3 py-2 border ${inputBorder} ${inputBg} ${textColor} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base`}
                              placeholder="1230"
                              maxLength={4}
                            />
                          </div>
                          <button
                            onClick={() => removeBreak(activeTab, shiftType, index)}
                            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            Object.entries(lines).map(([lineNum, line]) => (
              <div
                key={lineNum}
                className={activeTab === Number(lineNum) ? 'block' : 'hidden'}
              >
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textColor} mb-1`}>
                      Current Progress
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={line.currentProgress}
                      onChange={(e) => updateLineValue(Number(lineNum), 'currentProgress', e.target.value)}
                      className={`w-full px-3 py-2 border ${inputBorder} ${inputBg} ${textColor} rounded-md focus:ring-2 focus:ring-indigo-500 text-base`}
                      placeholder="Enter current progress"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textColor} mb-1`}>
                      Start Count
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={line.startCount}
                      onChange={(e) => updateLineValue(Number(lineNum), 'startCount', e.target.value)}
                      className={`w-full px-3 py-2 border ${inputBorder} ${inputBg} ${textColor} rounded-md focus:ring-2 focus:ring-indigo-500 text-base`}
                      placeholder="Enter start count"
                    />
                  </div>

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
                          className={`w-full px-2 sm:px-3 py-2 border ${inputBorder} ${inputBg} ${textColor} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-sm sm:text-base`}
                          placeholder={`#${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textColor} mb-1`}>
                      Line Rate (units per minute)
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={line.lineRate}
                      onChange={(e) => updateLineValue(Number(lineNum), 'lineRate', e.target.value)}
                      className={`w-full px-3 py-2 border ${inputBorder} ${inputBg} ${textColor} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base`}
                      placeholder="Enter line rate"
                      step="0.001"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textColor} mb-1`}>
                      Recorded Time (Military Format)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={line.recordedTime}
                      onChange={(e) => updateLineValue(Number(lineNum), 'recordedTime', e.target.value)}
                      className={`w-full px-3 py-2 border ${inputBorder} ${inputBg} ${textColor} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base`}
                      placeholder="Enter time (e.g., 1330)"
                      maxLength={4}
                    />
                  </div>

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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;