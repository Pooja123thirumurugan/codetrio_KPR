import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types/ticket';
import { Shield, Headset, User, ChevronDown, Check, Sparkles } from 'lucide-react';

interface RoleOption {
  role: UserRole;
  label: string;
  subLabel: string;
  badge: string;
  icon: React.ReactNode;
  color: string;
  bgGlow: string;
  defaultPath: string;
}

export const RoleSwitcher: React.FC = () => {
  const { currentRole, setCurrentRole, addToast } = useApp();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const roles: RoleOption[] = [
    {
      role: 'ADMIN',
      label: 'Admin / Ops Lead',
      subLabel: 'Crisis, Simulator, Twin & Full Fleet',
      badge: 'Full Access',
      icon: <Shield className="w-4 h-4 text-indigo-600" />,
      color: 'text-indigo-700 border-indigo-200 bg-indigo-50/80',
      bgGlow: 'from-indigo-50 to-white',
      defaultPath: '/dashboard',
    },
    {
      role: 'AGENT',
      label: 'Support Agent (Priya Sharma)',
      subLabel: 'Assigned P1 Queue & AI Copilot',
      badge: 'L3 Specialist',
      icon: <Headset className="w-4 h-4 text-emerald-600" />,
      color: 'text-emerald-700 border-emerald-200 bg-emerald-50/80',
      bgGlow: 'from-emerald-50 to-white',
      defaultPath: '/workbench',
    },
    {
      role: 'CUSTOMER',
      label: 'Customer (Acme Corp)',
      subLabel: 'Submit Tickets & Track SLA',
      badge: 'Enterprise Platinum',
      icon: <User className="w-4 h-4 text-cyan-600" />,
      color: 'text-cyan-700 border-cyan-200 bg-cyan-50/80',
      bgGlow: 'from-cyan-50 to-white',
      defaultPath: '/portal',
    },
  ];

  const currentOption = roles.find((r) => r.role === currentRole) || roles[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (option: RoleOption) => {
    setCurrentRole(option.role);
    setIsOpen(false);
    navigate(option.defaultPath);
    addToast({
      type: 'info',
      title: `Switched to ${option.label}`,
      message: `UI perspective changed. ${option.subLabel}.`,
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 h-9 px-3 rounded-lg border text-xs font-medium transition-all shadow-xs ${currentOption.color} hover:brightness-95 active:scale-95`}
        title="Switch perspective between Admin, Agent, and Customer"
      >
        <span className="shrink-0">{currentOption.icon}</span>
        <span className="font-semibold text-slate-800 hidden sm:inline whitespace-nowrap">
          {currentOption.label.split('(')[0].trim()}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              Switch Experience Persona
            </span>
            <span className="text-[10px] text-slate-400">Live Simulation</span>
          </div>

          <div className="p-1.5 space-y-1">
            {roles.map((option) => {
              const isSelected = option.role === currentRole;
              return (
                <button
                  key={option.role}
                  onClick={() => handleRoleSelect(option)}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? `bg-gradient-to-r ${option.bgGlow} border border-indigo-200 shadow-xs`
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-lg border mt-0.5 ${option.color}`}>
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-800 truncate">{option.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{option.subLabel}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {option.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-500 text-center">
            Switch perspectives anytime to evaluate how each stakeholder interacts with SLA Guardian AI.
          </div>
        </div>
      )}
    </div>
  );
};
