import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  status: 'paid' | 'pending' | 'draft' | 'refused' | 'signed';
  children?: React.ReactNode;
}

const statusConfig = {
  paid: { label: 'Payée', class: 'badge-paid' },
  pending: { label: 'En attente', class: 'badge-pending' },
  draft: { label: 'Brouillon', class: 'badge-draft' },
  refused: { label: 'Refusée', class: 'badge-refused' },
  signed: { label: 'Accepté', class: 'badge-signed' },
};

export const Badge: React.FC<BadgeProps> = ({ status, children }) => {
  const config = statusConfig[status];
  return (
    <span className={clsx('badge', config.class)}>
      {children || config.label}
    </span>
  );
};