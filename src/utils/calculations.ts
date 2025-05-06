import { LineCalculator, LineSchedule } from '../types';

export const calculateLineResult = (
  line: LineCalculator,
  lineNumber: number,
  schedule: Record<number, LineSchedule>
) => {
  if (!line.currentProgress || !line.startCount || !line.recordedTime) {
    throw new Error('Please fill in all required fields');
  }

  const current = parseFloat(line.currentProgress);
  const start = parseFloat(line.startCount);
  const modelNumbers = line.models
    .filter(model => model !== '')
    .map(model => parseFloat(model));

  if (isNaN(current) || isNaN(start)) {
    throw new Error('Please enter valid numbers');
  }

  const modelsSum = modelNumbers.reduce((sum, num) => sum + num, 0);
  let remainingWork = current - start - modelsSum;
  remainingWork = Math.abs(remainingWork);

  const lineRate = parseFloat(line.lineRate);
  if (isNaN(lineRate) || lineRate <= 0) {
    throw new Error('Invalid line rate');
  }

  // Calculate total minutes needed without considering shifts
  const rawMinutes = remainingWork / lineRate;
  
  // Calculate actual time needed considering shifts and breaks
  const now = new Date();
  const recordedHours = parseInt(line.recordedTime.substring(0, 2));
  const recordedMinutes = parseInt(line.recordedTime.substring(2));
  
  // Set the base date to today at the recorded time
  const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), recordedHours, recordedMinutes);
  
  // If the recorded time is earlier than current time, assume it's for the next day
  if (baseDate < now) {
    baseDate.setDate(baseDate.getDate() + 1);
  }

  let currentTime = new Date(baseDate.getTime());
  let remainingMins = Math.ceil(rawMinutes);
  let actualMinutes = 0;
  let unitsProduced = 0;
  let hasStarted = false;
  let breaks: { startTime: string; endTime: string; shift: string }[] = [];
  
  while (unitsProduced < remainingWork) {
    const currentTimeStr = `${currentTime.getHours().toString().padStart(2, '0')}${currentTime.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = currentTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Check if we should skip this time
    let shouldSkip = false;
    
    // Skip all Sunday except night shift
    if (currentDay === 0) {
      const isNightShift = currentTime.getHours() >= 22 || currentTime.getHours() < 6;
      if (!isNightShift) {
        shouldSkip = true;
      }
    }
    
    // Skip Saturday if Saturday toggle is off
    if (currentDay === 6 && !line.saturdayEnabled) {
      // Skip to Monday morning at the start of the first enabled shift
      const nextMonday = new Date(currentTime);
      nextMonday.setDate(nextMonday.getDate() + (8 - currentDay)); // Move to next Monday
      
      // Find the first enabled shift on Monday
      const lineSchedule = schedule[lineNumber];
      let firstShiftStart = '0600'; // Default to 6 AM if no shifts are enabled
      
      if (lineSchedule.dayShift.enabled) {
        firstShiftStart = lineSchedule.dayShift.startTime;
      } else if (lineSchedule.afternoonShift.enabled) {
        firstShiftStart = lineSchedule.afternoonShift.startTime;
      } else if (lineSchedule.nightShift.enabled) {
        firstShiftStart = lineSchedule.nightShift.startTime;
      }
      
      const [hours, minutes] = [parseInt(firstShiftStart.substring(0, 2)), parseInt(firstShiftStart.substring(2))];
      nextMonday.setHours(hours, minutes, 0, 0);
      currentTime = nextMonday;
      continue;
    }
    
    // Check if we're in a break
    const isInBreak = (shift: ShiftSchedule, shiftName: string) => {
      if (!shift.enabled) return false;
      
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      
      return shift.breaks.some(breakTime => {
        const breakStart = parseInt(breakTime.startTime.substring(0, 2)) * 60 + parseInt(breakTime.startTime.substring(2));
        const breakEnd = parseInt(breakTime.endTime.substring(0, 2)) * 60 + parseInt(breakTime.endTime.substring(2));
        const isInBreak = currentTimeInMinutes >= breakStart && currentTimeInMinutes < breakEnd;
        
        if (isInBreak) {
          // Check if this break is already in our breaks array
          const breakExists = breaks.some(b => 
            b.startTime === breakTime.startTime && 
            b.endTime === breakTime.endTime && 
            b.shift === shiftName
          );
          
          if (!breakExists) {
            breaks.push({
              startTime: breakTime.startTime,
              endTime: breakTime.endTime,
              shift: shiftName
            });
          }
        }
        
        return isInBreak;
      });
    };
    
    const lineSchedule = schedule[lineNumber];
    const inBreak = isInBreak(lineSchedule.dayShift, 'Day') || 
                   isInBreak(lineSchedule.afternoonShift, 'Afternoon') || 
                   isInBreak(lineSchedule.nightShift, 'Night');
    
    // Check if we're in an active shift and not in a break
    const isActive = !shouldSkip && !inBreak && isInActiveShift(currentTimeStr, lineNumber, schedule);
    
    // Only start counting once we're in an active shift
    if (isActive) {
      hasStarted = true;
    }
    
    // Only produce units and count time if we've started and we're in an active shift
    if (hasStarted && isActive) {
      unitsProduced += lineRate / 60; // Add units per minute
      actualMinutes++; // Only increment actual minutes when producing units
    }
    
    // Always increment current time
    currentTime.setTime(currentTime.getTime() + 60000); // Add one minute
  }

  // Double check to ensure we're not ending on Saturday
  if (currentTime.getDay() === 6 && !line.saturdayEnabled) {
    const nextMonday = new Date(currentTime);
    nextMonday.setDate(nextMonday.getDate() + 2); // Move to Monday
    
    // Find the first enabled shift on Monday
    const lineSchedule = schedule[lineNumber];
    let firstShiftStart = '0600'; // Default to 6 AM if no shifts are enabled
    
    if (lineSchedule.dayShift.enabled) {
      firstShiftStart = lineSchedule.dayShift.startTime;
    } else if (lineSchedule.afternoonShift.enabled) {
      firstShiftStart = lineSchedule.afternoonShift.startTime;
    } else if (lineSchedule.nightShift.enabled) {
      firstShiftStart = lineSchedule.nightShift.startTime;
    }
    
    const [hours, minutes] = [parseInt(firstShiftStart.substring(0, 2)), parseInt(firstShiftStart.substring(2))];
    nextMonday.setHours(hours, minutes, 0, 0);
    currentTime = nextMonday;
  }

  // Calculate hours and minutes without rounding
  const totalMinutes = actualMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const hoursAndMinutes = `${hours}h ${minutes}m`;
  const remainingWorkTime = `${hours} hours, ${minutes} minutes`;

  // Calculate completion time directly
  const startTimeInMinutes = recordedHours * 60 + recordedMinutes;
  const completionTimeInMinutes = startTimeInMinutes + totalMinutes;
  const completionHours = Math.floor(completionTimeInMinutes / 60) % 24;
  const completionMinutes = completionTimeInMinutes % 60;
  const completionTime = `${completionHours.toString().padStart(2, '0')}${completionMinutes.toString().padStart(2, '0')}`;

  // Ensure completion date doesn't fall on Saturday if Saturday operations are disabled
  let completionDate = new Date(currentTime);
  if (completionDate.getDay() === 6 && !line.saturdayEnabled) {
    completionDate.setDate(completionDate.getDate() + 2); // Move to Monday
  }

  const completionDateStr = completionDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const completionShift = getShiftType(completionTime, lineNumber, schedule);

  return {
    militaryTime: line.recordedTime,
    remainingWork,
    hoursAndMinutes,
    completionTime,
    remainingWorkTime,
    completionShift,
    completionDate: completionDateStr,
    breaks: breaks
  };
};

export const addTimeToMilitary = (
  time: string,
  hoursToAdd: number,
  minutesToAdd: number,
  lineNumber: number,
  schedule: Record<number, LineSchedule>
) => {
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

    if (isInActiveShift(minutesToTime(currentTimeInMinutes), lineNumber, schedule)) {
      remainingMinutes--;
    }
  }

  return minutesToTime(currentTimeInMinutes);
};

export const getShiftType = (
  time: string,
  lineNumber: number,
  schedule: Record<number, LineSchedule>
): 'Day' | 'Afternoon' | 'Night' => {
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

export const isInActiveShift = (
  time: string,
  lineNumber: number,
  schedule: Record<number, LineSchedule>
): boolean => {
  const timeInMinutes = parseInt(time.substring(0, 2)) * 60 + parseInt(time.substring(2));
  const lineSchedule = schedule[lineNumber];
  
  const isInShiftTime = (shift: ShiftSchedule) => {
    // Skip if shift is not enabled
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

  // Check each shift type
  const isInDayShift = isInShiftTime(lineSchedule.dayShift);
  const isInAfternoonShift = isInShiftTime(lineSchedule.afternoonShift);
  const isInNightShift = isInShiftTime(lineSchedule.nightShift);

  // Return true if we're in any enabled shift
  return isInDayShift || isInAfternoonShift || isInNightShift;
};