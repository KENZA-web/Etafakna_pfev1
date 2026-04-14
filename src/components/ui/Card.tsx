import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, padding = true }) => {
  return (
    <div className={clsx('card', padding && 'p-5', className)}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <div className={clsx('flex items-start justify-between gap-3 mb-4', className)}>{children}</div>;
};

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="text-[13.5px] font-extrabold text-[#0f172a] tracking-[-0.2px]">{children}</div>;
};

export const CardSub: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="text-[11px] text-[#94a3b8] mt-0.5">{children}</div>;
};