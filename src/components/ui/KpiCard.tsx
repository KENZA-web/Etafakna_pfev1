import React from 'react';
import clsx from 'clsx';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'indigo' | 'green' | 'amber' | 'red' | 'violet' | 'teal';
  trend?: { value: number; isUp: boolean };
  footer?: string;
}

const colorClasses = {
  indigo: 'kpi-indigo',
  green: 'kpi-green',
  amber: 'kpi-amber',
  red: 'kpi-red',
  violet: 'kpi-violet',
  teal: 'kpi-teal',
};

const iconColors = {
  indigo: 'bg-[#eef2ff] text-[#4f46e5]',
  green: 'bg-[#dcfce7] text-[#16a34a]',
  amber: 'bg-[#fef3c7] text-[#d97706]',
  red: 'bg-[#fee2e2] text-[#dc2626]',
  violet: 'bg-[#ede9fe] text-[#7c3aed]',
  teal: 'bg-[#cffafe] text-[#0891b2]',
};

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon, color, trend, footer }) => {
  return (
    <div className={clsx('kpi', colorClasses[color])}>
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        <div className={clsx('kpi-ico', iconColors[color])}>{icon}</div>
      </div>
      <div className="kpi-val">{value}</div>
      <div className="kpi-foot">
        {trend && (
          <span className={clsx('trend', trend.isUp ? 'trend-up' : 'trend-dn')}>
            {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
        {footer && <span>{footer}</span>}
      </div>
    </div>
  );
};