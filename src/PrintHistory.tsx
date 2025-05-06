import React from 'react';

interface CalculationResult {
  militaryTime: string;
  remainingWork: number;
  hoursAndMinutes: string;
  completionTime: string;
  remainingWorkTime: string;
  completionShift: 'Day' | 'Afternoon' | 'Night';
  completionDate: string;
  breakTimeline: {
    shiftDate: string;
    shiftHours: string;
    breaks: {
      number: number;
      duration: string;
      startTime: string;
      endTime: string;
    }[];
    totalBreakTime: string;
  }[];
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

interface PrintHistoryProps {
  calculations: SavedCalculation[];
}

const formatDisplayTime = (militaryTime: string) => {
  if (militaryTime.length === 4) {
    return `${militaryTime.substring(0, 2)}:${militaryTime.substring(2)}`;
  }
  return militaryTime;
};

const PrintHistory: React.FC<PrintHistoryProps> = ({ calculations }) => {
  return (
    <div className="print-container p-4">
      <style type="text/css" media="print">
        {`
          @page { size: auto; margin: 10mm; }
          @media print {
            body { 
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .print-container {
              padding: 0;
            }
            .page-break {
              page-break-before: always;
            }
          }
        `}
      </style>

      <div className="text-center mb-2">
        <h1 className="text-xl font-bold">Production Calculator History</h1>
        <p className="text-xs text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {calculations.map((calc, index) => (
          <div key={calc.id} className={`${index > 0 && index % 6 === 0 ? 'page-break' : ''}`}>
            <div className="border border-gray-300 rounded p-1">
              <div className="border-b border-gray-300 pb-0.5 mb-1">
                <h2 className="text-sm font-bold">Line {calc.lineNumber} Calculation</h2>
                <p className="text-xs text-gray-600">
                  {new Date(calc.timestamp).toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1 mb-1">
                <div>
                  <h3 className="text-xs font-bold mb-0.5">Input Values</h3>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr>
                        <td className="py-0">Current Progress:</td>
                        <td className="text-right">{calc.currentProgress}</td>
                      </tr>
                      <tr>
                        <td className="py-0">Start Count:</td>
                        <td className="text-right">{calc.startCount}</td>
                      </tr>
                      <tr>
                        <td className="py-0">Line Rate:</td>
                        <td className="text-right">{calc.lineRate} units/min</td>
                      </tr>
                      <tr>
                        <td className="py-0">Recorded Time:</td>
                        <td className="text-right">{formatDisplayTime(calc.recordedTime)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="text-xs font-bold mb-0.5">Results</h3>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr>
                        <td className="py-0">Units:</td>
                        <td className="text-right">{calc.result.remainingWork.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="py-0">Time Required:</td>
                        <td className="text-right">{calc.result.remainingWorkTime}</td>
                      </tr>
                      <tr>
                        <td className="py-0">Completion Time:</td>
                        <td className="text-right">
                          {formatDisplayTime(calc.result.completionTime)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0">Completion Date:</td>
                        <td className="text-right">{calc.result.completionDate}</td>
                      </tr>
                      <tr>
                        <td className="py-0">Shift:</td>
                        <td className="text-right">{calc.result.completionShift}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-1">
                <h3 className="text-xs font-bold mb-0.5">Break Timeline</h3>
                {calc.result.breakTimeline.map((timeline, timelineIndex) => (
                  <div key={timelineIndex} className="mb-0.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold">{timeline.shiftDate}</span>
                      <span>Total Break: {timeline.totalBreakTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrintHistory; 