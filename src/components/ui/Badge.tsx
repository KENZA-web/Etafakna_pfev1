import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  status:
    | 'paid' | 'pending' | 'draft' | 'refused' | 'signed'
    | 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED' | 'OVERDUE'
    | 'SENT' | 'ACCEPTED' | 'REFUSED' | 'CONVERTED';
  children?: React.ReactNode;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  paid:      { label: 'Payée',       class: 'badge-paid' },
  pending:   { label: 'En attente',  class: 'badge-pending' },
  draft:     { label: 'Brouillon',   class: 'badge-draft' },
  refused:   { label: 'Refusée',     class: 'badge-refused' },
  signed:    { label: 'Accepté',     class: 'badge-signed' },
  DRAFT:     { label: 'Brouillon',   class: 'badge-draft' },
  ISSUED:    { label: 'Émise',       class: 'badge-pending' },
  PAID:      { label: 'Payée',       class: 'badge-paid' },
  CANCELLED: { label: 'Annulée',     class: 'badge-refused' },
  OVERDUE:   { label: 'En retard',   class: 'badge-refused' },
  SENT:      { label: 'Envoyé',      class: 'badge-pending' },
  ACCEPTED:  { label: 'Accepté',     class: 'badge-signed' },
  REFUSED:   { label: 'Refusé',      class: 'badge-refused' },
  CONVERTED: { label: 'Converti',    class: 'badge-signed' },
};

export const Badge: React.FC<BadgeProps> = ({ status, children }) => {
  const config = statusConfig[status] || { label: status, class: 'badge-draft' }; // fallback
  return (
    <span className={clsx('badge', config.class)}>
      {children || config.label}
    </span>
  );
};