import React from 'react';
import { RiskLevel, PriorityLevel, TicketStatus } from '../../types/ticket';
import { EscalationType } from '../../types/escalation';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'blue' | 'gray';
  size?: 'xs' | 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  pulse = false,
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    blue: 'bg-sky-50 text-sky-700 border-sky-200',
    gray: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 font-semibold',
    sm: 'text-xs px-2.5 py-1 font-semibold',
    md: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase shadow-sm ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {children}
    </span>
  );
};

export const RiskBadge: React.FC<{ level: RiskLevel; pulse?: boolean; size?: 'xs' | 'sm' | 'md' }> = ({
  level,
  pulse,
  size = 'sm',
}) => {
  switch (level) {
    case 'CRITICAL':
      return (
        <Badge variant="danger" size={size} pulse={pulse ?? true} className="font-extrabold shadow-rose-100">
          CRITICAL
        </Badge>
      );
    case 'HIGH':
      return (
        <Badge variant="warning" size={size} pulse={pulse} className="font-bold shadow-amber-100">
          HIGH RISK
        </Badge>
      );
    case 'MEDIUM':
      return (
        <Badge variant="blue" size={size} pulse={pulse} className="font-semibold">
          MEDIUM
        </Badge>
      );
    case 'LOW':
    default:
      return (
        <Badge variant="success" size={size} pulse={pulse} className="font-semibold">
          LOW RISK
        </Badge>
      );
  }
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  switch (priority) {
    case 'P1 - Critical':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
          P1 Critical
        </span>
      );
    case 'P2 - High':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 shadow-sm">
          P2 High
        </span>
      );
    case 'P3 - Medium':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
          P3 Medium
        </span>
      );
    case 'P4 - Low':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          P4 Low
        </span>
      );
  }
};

export const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  switch (status) {
    case 'IN_PROGRESS':
      return <Badge variant="blue" size="xs">In Progress</Badge>;
    case 'ESCALATED':
      return <Badge variant="danger" size="xs" pulse>Escalated</Badge>;
    case 'RESOLVED':
      return <Badge variant="success" size="xs">Resolved</Badge>;
    case 'NEW':
      return <Badge variant="purple" size="xs">New</Badge>;
    case 'PENDING':
    default:
      return <Badge variant="warning" size="xs">Pending</Badge>;
  }
};

export const PreventiveEscalationBadge: React.FC<{ type: EscalationType }> = ({ type }) => {
  if (type === 'PREVENTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
        PRE-BREACH ESCALATION
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
      POST-BREACH
    </span>
  );
};
