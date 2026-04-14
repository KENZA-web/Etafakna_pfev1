import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'ai';
  size?: 'sm' | 'xs' | 'default';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'default',
  children,
  className,
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== 'default' ? `btn-${size}` : '';
  
  return (
    <button
      className={clsx(baseClass, variantClass, sizeClass, className)}
      {...props}
    >
      {children}
    </button>
  );
};