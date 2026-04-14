import React from 'react';

interface DonutData {
  status: string;
  count: number;
  color: string;
  label: string;
}

interface DonutChartProps {
  data: DonutData[];
  total: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, total }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  
  let offset = 0;
  const paths = data.map((item) => {
    const dash = (item.count / total) * circumference;
    const path = (
      <circle
        key={item.status}
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={item.color}
        strokeWidth="13"
        strokeDasharray={`${dash.toFixed(1)} ${(circumference - dash).toFixed(1)}`}
        strokeDashoffset={(-offset).toFixed(1)}
        transform="rotate(-90 50 50)"
      />
    );
    offset += dash;
    return path;
  });

  return (
    <div className="flex flex-col items-center">
      <svg className="w-[120px] h-[120px] mb-3.5" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="13" />
        {paths}
        <text x="50" y="47" textAnchor="middle" fontSize="14" fontWeight="900" fill="#0f172a" fontFamily="Plus Jakarta Sans">
          {total}
        </text>
        <text x="50" y="59" textAnchor="middle" fontSize="8" fill="#94a3b8" fontFamily="Plus Jakarta Sans">
          factures
        </text>
      </svg>
      <div className="w-full flex flex-col gap-1.5">
        {data.map((item) => (
          <div key={item.status} className="flex items-center gap-2 text-[11.5px] text-[#1e293b]">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
            {item.label}
            <span className="ml-auto font-extrabold text-[12px] text-[#0f172a] font-mono">
              {Math.round((item.count / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;