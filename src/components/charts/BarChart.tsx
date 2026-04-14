import React from 'react';

interface BarChartProps {
  data: number[];
  labels: string[];
  color?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, labels, color = '#4f46e5' }) => {
  const max = Math.max(...data);
  
  return (
    <div className="flex items-end gap-1.5 h-[130px] px-1">
      {data.map((value, index) => {
        const height = Math.round((value / max) * 118);
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex gap-0.5 items-end w-full">
              <div
                className="flex-1 rounded-t-md cursor-pointer transition-all hover:brightness-90 hover:scale-y-105 origin-bottom relative group"
                style={{ height: `${height}px`, backgroundColor: color }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-[#0f172a] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-1 font-mono">
                  {(value / 1000).toFixed(1)}k TND
                </div>
              </div>
            </div>
            <div className="text-[9.5px] text-[#94a3b8]">{labels[index]}</div>
          </div>
        );
      })}
    </div>
  );
};

export default BarChart;