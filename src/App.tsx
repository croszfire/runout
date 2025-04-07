import React, { useState, useEffect } from 'react';
import { Clock, Calculator, Settings, Sun, Moon, RefreshCw, Save, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface CalculationResult {
  militaryTime: string;
  remainingWork: number;
  hoursAndMinutes: string;
  remainingWorkTime: string;
  timeline: Array<{
    type: 'start' | 'break_start' | 'break_end' | 'end';
    time: string;
    shift: 'Day' | 'Afternoon' | 'Night';
  }>;
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
  saturdayEnabled: boolean;
  result: CalculationResult | null;
  error: string;
}

interface ShiftSchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
  breaks: { startTime: string; endTime: string }[];
  saturdayEnabled?: boolean;
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
    saturdayEnabled: false,
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
      saturdayEnabled: false,
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
      saturdayEnabled: false,
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
      saturdayEnabled: false,
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
      saturdayEnabled: false,
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
      saturdayEnabled: false,
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
      saturdayEnabled: false,
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
      saturdayEnabled: false,
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
      saturdayEnabled: false,
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
      saturdayEnabled: false,
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
      saturdayEnabled: false,
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
      saturdayEnabled: false,
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
      saturdayEnabled: false,
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
      saturdayEnabled: false,
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
      saturdayEnabled: false,
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
      saturdayEnabled: false,
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
      saturdayEnabled: false,
      breaks: [
        { startTime: '0930', endTime: '0945' },
        { startTime: '1200', endTime: '1230' }
      ]
    },
    afternoonShift: {
      enabled: false,
      startTime: '1425',
      endTime: '2255',
      saturdayEnabled: false,
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
      saturdayEnabled: false,
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
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [lines, setLines] = useState<Record<number, LineCalculator>>({
    2: getInitialLineState(2),
    3: getInitialLineState(3),
    4: getInitialLineState(4),
    5: getInitialLineState(5),
    6: getInitialLineState(6),
    7: getInitialLineState(7)
  });

  // Add useEffect for updating current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  const toggleSaturday = (lineNumber: number, shift: 'dayShift' | 'afternoonShift' | 'nightShift') => {
    setSchedule(prev => ({
      ...prev,
      [lineNumber]: {
        ...prev[lineNumber],
        [shift]: {
          ...prev[lineNumber][shift],
          saturdayEnabled: !prev[lineNumber][shift].saturdayEnabled
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
    // Remove any non-numeric characters
    let numbers = value.replace(/\D/g, '');
    
    // Handle empty input
    if (!numbers) return '';
      
    // If input is less than 4 digits, just return what we have
    if (numbers.length < 4) {
        return numbers;
      }

    // Take only the first 4 digits
    numbers = numbers.slice(0, 4);
    
    // Convert to valid military time
    let hours = parseInt(numbers.substring(0, 2));
    let minutes = parseInt(numbers.substring(2, 4));
    
    // Validate and adjust hours and minutes
    if (hours > 23) hours = 23;
    if (minutes > 59) minutes = 59;
    
    // Return just the numbers without colon
    return `${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`;
  };

  const formatDisplayTime = (militaryTime: string) => {
    if (!militaryTime || militaryTime.length !== 4) return militaryTime;
    return `${militaryTime.substring(0, 2)}:${militaryTime.substring(2)}`;
  };

  const updateLineValue = (lineNumber: number, field: keyof LineCalculator, value: string) => {
    setLines(prev => ({
      ...prev,
      [lineNumber]: {
        ...prev[lineNumber],
        [field]: field === 'recordedTime' ? formatMilitaryTime(value) : value,
        error: '' // Clear any previous errors
      }
    }));
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
    let newLine = { ...line, error: '', result: null };

    try {
      // Clean up and validate inputs
      const current = parseFloat(line.currentProgress);
      const start = parseFloat(line.startCount);
      const lineRate = parseFloat(line.lineRate);
      const cleanTimeStr = line.recordedTime.replace(/\D/g, '');

      // Basic validation
      if (!line.currentProgress || !line.startCount || !cleanTimeStr || !line.lineRate) {
        newLine.error = 'Please fill in all required fields';
        setLines(prev => ({ ...prev, [lineNumber]: newLine }));
        return;
      }

      // Validate numbers
      if (isNaN(current) || isNaN(start) || isNaN(lineRate)) {
        newLine.error = 'Please enter valid numbers';
        setLines(prev => ({ ...prev, [lineNumber]: newLine }));
        return;
      }

      if (lineRate <= 0) {
        newLine.error = 'Line rate must be greater than 0';
        setLines(prev => ({ ...prev, [lineNumber]: newLine }));
        return;
      }

      // Validate time format
      if (cleanTimeStr.length !== 4) {
        newLine.error = 'Please enter a valid 4-digit military time';
        setLines(prev => ({ ...prev, [lineNumber]: newLine }));
        return;
      }

      const hours = parseInt(cleanTimeStr.substring(0, 2));
      const minutes = parseInt(cleanTimeStr.substring(2));

      if (hours > 23 || minutes > 59) {
        newLine.error = 'Please enter a valid time (00:00-23:59)';
        setLines(prev => ({ ...prev, [lineNumber]: newLine }));
        return;
      }

      // Calculate remaining work
      const modelNumbers = line.models
        .filter(model => model !== '')
        .map(model => parseFloat(model))
        .filter(num => !isNaN(num));

      const modelsSum = modelNumbers.reduce((sum, num) => sum + num, 0);
      const remainingWork = Math.abs(current - start - modelsSum);
      const totalMinutes = Math.round(remainingWork / lineRate);

      const calculatedHours = Math.floor(totalMinutes / 60);
      const calculatedMinutes = totalMinutes % 60;
      const hoursAndMinutes = `${calculatedHours}h ${calculatedMinutes}m`;
      const remainingWorkTime = `${calculatedHours} hours, ${calculatedMinutes} minutes`;

      // Generate timeline
      const timeline = [];
      let currentTime = cleanTimeStr;
      const lineSchedule = schedule[lineNumber];
      let currentShift = getShiftType(currentTime, lineNumber, schedule);

      // Add start time
      timeline.push({
        type: 'start',
        time: currentTime,
        shift: currentShift
      });

      // Calculate all break times and end times this run will encounter
      let remainingMins = totalMinutes;
      let timeInMinutes = parseInt(currentTime.substring(0, 2)) * 60 + parseInt(currentTime.substring(2));
      let currentDay = 0;

      while (remainingMins > 0) {
        const currentShiftData = 
          currentShift === 'Day' ? lineSchedule.dayShift :
          currentShift === 'Afternoon' ? lineSchedule.afternoonShift :
          lineSchedule.nightShift;

        // Check for breaks
        for (const breakTime of currentShiftData.breaks) {
          const breakStartMins = parseInt(breakTime.startTime.substring(0, 2)) * 60 + 
                               parseInt(breakTime.startTime.substring(2));
          const breakEndMins = parseInt(breakTime.endTime.substring(0, 2)) * 60 + 
                             parseInt(breakTime.endTime.substring(2));

          // Adjust break times for current day
          const adjustedBreakStartMins = breakStartMins + (currentDay * 24 * 60);
          const adjustedBreakEndMins = breakEndMins + (currentDay * 24 * 60);
          const adjustedTimeInMinutes = timeInMinutes + (currentDay * 24 * 60);

          // Only add break if we haven't already added it and we will encounter it
          if (adjustedTimeInMinutes < adjustedBreakStartMins && 
              adjustedTimeInMinutes + remainingMins > adjustedBreakStartMins &&
              !timeline.some(event => 
                event.type === 'break_start' && 
                event.time === breakTime.startTime && 
                event.shift === currentShift
              )) {
            timeline.push({
              type: 'break_start',
              time: breakTime.startTime,
              shift: currentShift
            });
            timeline.push({
              type: 'break_end',
              time: breakTime.endTime,
              shift: currentShift
            });
          }
        }

        // Check for shift end
        const shiftEndMins = parseInt(currentShiftData.endTime.substring(0, 2)) * 60 + 
                           parseInt(currentShiftData.endTime.substring(2));
        const adjustedShiftEndMins = shiftEndMins + (currentDay * 24 * 60);
        const adjustedTimeInMinutes = timeInMinutes + (currentDay * 24 * 60);

        if (adjustedTimeInMinutes < adjustedShiftEndMins && 
            adjustedTimeInMinutes + remainingMins > adjustedShiftEndMins) {
          timeline.push({
            type: 'end',
            time: currentShiftData.endTime,
            shift: currentShift
          });

          // Find next shift
          const shifts = ['Day', 'Afternoon', 'Night'] as const;
          const currentShiftIndex = shifts.indexOf(currentShift);
          let nextShift = shifts[(currentShiftIndex + 1) % 3];
          
          // Find next enabled shift
          while (!lineSchedule[`${nextShift.toLowerCase()}Shift` as keyof LineSchedule].enabled) {
            nextShift = shifts[(shifts.indexOf(nextShift) + 1) % 3];
          }

          currentShift = nextShift;
          const nextShiftData = lineSchedule[`${nextShift.toLowerCase()}Shift` as keyof LineSchedule];
          
          // If next shift starts on the next day, increment the day counter
          if (parseInt(nextShiftData.startTime) < parseInt(currentShiftData.endTime)) {
            currentDay++;
          }

          timeline.push({
            type: 'start',
            time: nextShiftData.startTime,
            shift: currentShift
          });

          timeInMinutes = parseInt(nextShiftData.startTime.substring(0, 2)) * 60 + 
                         parseInt(nextShiftData.startTime.substring(2));
        } else {
          timeInMinutes++;
          if (timeInMinutes >= 24 * 60) {
            timeInMinutes = 0;
            currentDay++;
          }
        }

        // Only decrement remaining minutes during work time (not during breaks)
        const isInBreak = currentShiftData.breaks.some(breakTime => {
          const breakStart = parseInt(breakTime.startTime.substring(0, 2)) * 60 + parseInt(breakTime.startTime.substring(2));
          const breakEnd = parseInt(breakTime.endTime.substring(0, 2)) * 60 + parseInt(breakTime.endTime.substring(2));
          return timeInMinutes >= breakStart && timeInMinutes < breakEnd;
        });

        if (!isInBreak) {
          remainingMins--;
        }
      }

      // Add final end time
      const finalTime = `${Math.floor(timeInMinutes / 60).toString().padStart(2, '0')}${(timeInMinutes % 60).toString().padStart(2, '0')}`;
      timeline.push({
        type: 'end',
        time: finalTime,
        shift: currentShift
      });

      newLine.result = {
        militaryTime: cleanTimeStr,
        remainingWork,
        hoursAndMinutes,
        remainingWorkTime,
        timeline: timeline.sort((a, b) => parseInt(a.time) - parseInt(b.time))
      };

      setLines(prev => ({ ...prev, [lineNumber]: newLine }));
    } catch (err) {
      console.error('Calculation error:', err);
      newLine.error = 'Error in calculation. Please check your inputs.';
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const resetCalculator = (lineNumber: number) => {
    setLines(prev => ({
      ...prev,
      [lineNumber]: getInitialLineState(lineNumber)
    }));
  };

  const calculateBreakDuration = (startTime: string, endTime: string): number => {
    const startHours = parseInt(startTime.substring(0, 2));
    const startMinutes = parseInt(startTime.substring(2));
    const endHours = parseInt(endTime.substring(0, 2));
    const endMinutes = parseInt(endTime.substring(2));

    let totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    
    // Handle overnight breaks
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }

    return totalMinutes;
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

  return (
    <div className={`min-h-screen ${bgColor} p-2 sm:p-4 pb-24 transition-colors duration-200`}>
      <div className="max-w-3xl mx-auto">
        {/* Current Date/Time Display */}
        <div className={`${cardBg} rounded-xl shadow-lg p-2 mb-3`}>
          <div className={`text-center ${textColor}`}>
            <div className="text-lg font-bold">
              {currentDateTime.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="text-xl font-mono">
              {currentDateTime.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
          </div>
        </div>

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
                    <div className={`space-y-2 ${resultText} text-sm sm:text-base`}>
                      <p>Current Progress: {calc.currentProgress}</p>
                      <p>Start Count: {calc.startCount}</p>
                      <p>Line Rate (units/min): {calc.lineRate}</p>
                      <p>Recorded Time: {formatDisplayTime(calc.recordedTime)}</p>
                      <p>Units ({calc.result.remainingWork.toFixed(2)}): {calc.result.remainingWorkTime}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : showSettings ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-lg sm:text-xl font-semibold ${textColor} mb-4`}>Line {activeTab} Settings</h2>
              </div>
              
              {(['dayShift', 'afternoonShift', 'nightShift'] as const).map((shiftType) => {
                const shift = schedule[activeTab][shiftType];
                const shiftName = shiftType === 'dayShift' ? 'Day Shift' :
                                shiftType === 'afternoonShift' ? 'Afternoon Shift' : 'Night Shift';
                
                return (
                  <div key={shiftType} className={`p-4 border ${inputBorder} rounded-lg`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-medium ${textColor}`}>{shiftName}</h3>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${textColor}`}>Saturday</span>
                          <button
                            onClick={() => toggleSaturday(activeTab, shiftType)}
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
                          <button
                            onClick={() => toggleShift(activeTab, shiftType)}
                          >
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
                  {/* Current Progress */}
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

                  {/* Recorded Time */}
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

                  {/* Start Count */}
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

                  {/* Units Leading Up */}
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

                  {/* Line Rate */}
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

                  {/* Saturday Toggle */}
                  <div className="flex items-center justify-between">
                    <label className={`block text-sm font-medium ${textColor}`}>
                      Saturday Operations
                    </label>
                    <button
                      onClick={() => updateLineValue(Number(lineNum), 'saturdayEnabled', !line.saturdayEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        line.saturdayEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          line.saturdayEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Calculate and Reset buttons */}
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

                  {/* Error message */}
                  {line.error && (
                    <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 rounded-md text-sm sm:text-base">
                      {line.error}
                    </div>
                  )}

                  {/* Results */}
                  {line.result && (
                    <div className={`p-3 sm:p-4 ${resultBg} border ${resultBorder} rounded-md relative`}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-base sm:text-lg font-semibold ${resultText}`}>
                          Calculation Results for Line {lineNum}
                        </h3>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => saveCalculation(Number(lineNum))}
                            className="text-indigo-600 hover:text-indigo-700 p-1"
                            title="Save calculation"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className={`space-y-2 ${resultText} text-sm sm:text-base`}>
                          <p>Recorded Time: <span className="font-mono font-bold">{formatDisplayTime(line.recordedTime)}</span></p>
                          <p>Units ({line.result.remainingWork.toFixed(2)}): <span className="font-mono font-bold">{line.result.remainingWorkTime}</span></p>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className={`text-sm font-semibold ${resultText} mb-2`}>Timeline:</h4>
                          <div className="space-y-2">
                            {line.result.timeline
                              .reduce((events, event, index, array) => {
                                if (event.type === 'break_start') {
                                  const endEvent = array.find(
                                    e => e.type === 'break_end' && 
                                    e.shift === event.shift && 
                                    parseInt(e.time) > parseInt(event.time)
                                  );
                                  if (endEvent) {
                                    // Check if this is the last break in the current shift
                                    const nextBreakInShift = array.find(
                                      (e, i) => i > index && 
                                      e.type === 'break_start' && 
                                      e.shift === event.shift
                                    );
                                    const isLastBreakInShift = !nextBreakInShift;

                                    // Get shift data if this is the last break
                                    let currentShiftData, nextShift, nextShiftData;
                                    if (isLastBreakInShift) {
                                      currentShiftData = 
                                        event.shift === 'Day' ? schedule[lineNum].dayShift :
                                        event.shift === 'Afternoon' ? schedule[lineNum].afternoonShift :
                                        schedule[lineNum].nightShift;

                                      const shifts = ['Day', 'Afternoon', 'Night'] as const;
                                      const currentShiftIndex = shifts.indexOf(event.shift);
                                      nextShift = shifts[(currentShiftIndex + 1) % 3];
                                      while (!schedule[lineNum][`${nextShift.toLowerCase()}Shift` as keyof LineSchedule].enabled) {
                                        nextShift = shifts[(shifts.indexOf(nextShift) + 1) % 3];
                                      }
                                      nextShiftData = schedule[lineNum][`${nextShift.toLowerCase()}Shift` as keyof LineSchedule];
                                    }

                                    // Calculate the time difference from recorded time
                                    const recordedTimeMinutes = parseInt(line.recordedTime.substring(0, 2)) * 60 + 
                                                         parseInt(line.recordedTime.substring(2));
                                    let breakStartMinutes = parseInt(event.time.substring(0, 2)) * 60 + 
                                                          parseInt(event.time.substring(2));
                                    
                                    // Adjust break time if it's before recorded time (meaning it's next day)
                                    if (breakStartMinutes < recordedTimeMinutes) {
                                      breakStartMinutes += 24 * 60;
                                    }

                                    events.push({
                                      type: 'break',
                                      startTime: event.time,
                                      endTime: endEvent.time,
                                      shift: event.shift,
                                      timeFromRecorded: breakStartMinutes - recordedTimeMinutes,
                                      isLastBreak: isLastBreakInShift,
                                      nextShiftStart: nextShiftData?.startTime,
                                      nextShift: nextShift,
                                      currentShiftEnd: currentShiftData?.endTime
                                    });

                                    // If this is the last break in the shift, add the shift change immediately after
                                    if (isLastBreakInShift && currentShiftData && nextShiftData) {
                                      let shiftEndMinutes = parseInt(currentShiftData.endTime.substring(0, 2)) * 60 + 
                                                          parseInt(currentShiftData.endTime.substring(2));
                                      if (shiftEndMinutes < recordedTimeMinutes) {
                                        shiftEndMinutes += 24 * 60;
                                      }
                                      
                                      events.push({
                                        type: 'shift_change',
                                        startTime: currentShiftData.endTime,
                                        endTime: nextShiftData.startTime,
                                        currentShift: event.shift,
                                        nextShift: nextShift,
                                        timeFromRecorded: shiftEndMinutes - recordedTimeMinutes
                                      });
                                    }
                                  }
                                }
                                return events;
                              }, [] as Array<{
                                type: string;
                                startTime: string;
                                endTime: string;
                                shift?: string;
                                currentShift?: string;
                                nextShift?: string;
                                timeFromRecorded: number;
                                isLastBreak?: boolean;
                              }>)
                              .sort((a, b) => a.timeFromRecorded - b.timeFromRecorded)
                              .map((event) => (
                                <div key={`${event.type}-${event.startTime}`}>
                                  {event.type === 'break' ? (
                                    <div className="flex items-center space-x-3 text-orange-600 dark:text-orange-400">
                                      <span className="font-mono font-bold">
                                        {formatDisplayTime(event.startTime)} - {formatDisplayTime(event.endTime)}
                                      </span>
                                      <span className="text-sm font-semibold px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                                        Break ({event.shift} Shift)
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400">
                                      <span className="font-mono font-bold">
                                        {formatDisplayTime(event.startTime)} - {formatDisplayTime(event.endTime)}
                                      </span>
                                      <span className="text-sm font-semibold px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                                        Shift Change: {event.currentShift} → {event.nextShift}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
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