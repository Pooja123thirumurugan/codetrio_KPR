import React from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  Zap,
  CheckCircle2,
  TrendingUp,
  Users,
  Layers,
  Clock,
  Flame,
} from 'lucide-react';
import { SimulationPreset, SimulationParams } from '../../types/simulation';
import { Card, CardContent } from '../common/Card';
import { Button } from '../common/Button';

interface SimulationControlsProps {
  params: SimulationParams;
  onChange: (params: SimulationParams) => void;
  onRun: () => void;
  onReset: () => void;
  loading: boolean;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  params,
  onChange,
  onRun,
  onReset,
  loading,
}) => {
  const presets: {
    name: SimulationPreset;
    desc: string;
    tag: string;
    icon: React.ReactNode;
  }[] = [
    {
      name: 'Normal Load',
      desc: 'Nominal operations with steady queue arrival',
      tag: '30/hr • 85%',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    },
    {
      name: 'Ticket Spike',
      desc: '+150% volume surge across all intake channels',
      tag: '95/hr Surge',
      icon: <TrendingUp className="w-4 h-4 text-indigo-600" />,
    },
    {
      name: 'Agent Failure',
      desc: '2 Tier-3 technical specialists abruptly go offline',
      tag: '45% Staffing',
      icon: <Users className="w-4 h-4 text-amber-600" />,
    },
    {
      name: 'Queue Overload',
      desc: 'Cascading backlog with delayed resolution times',
      tag: '55 Backlog',
      icon: <Layers className="w-4 h-4 text-purple-600" />,
    },
    {
      name: 'SLA Policy Tightening',
      desc: 'Critical SLA target halved from 30m to 15m',
      tag: '15m SLA',
      icon: <Clock className="w-4 h-4 text-rose-600" />,
    },
    {
      name: 'Critical Ticket Surge',
      desc: 'Simultaneous influx of 8 P1 enterprise incidents',
      tag: '8 P1 Surge',
      icon: <Flame className="w-4 h-4 text-red-600" />,
    },
  ];

  const handlePresetSelect = (preset: SimulationPreset) => {
    let arrival = 45;
    let availability = 70;
    let queue = 24;

    switch (preset) {
      case 'Normal Load':
        arrival = 30;
        availability = 85;
        queue = 18;
        break;
      case 'Ticket Spike':
        arrival = 95;
        availability = 70;
        queue = 38;
        break;
      case 'Agent Failure':
        arrival = 45;
        availability = 45;
        queue = 32;
        break;
      case 'Queue Overload':
        arrival = 110;
        availability = 60;
        queue = 55;
        break;
      case 'SLA Policy Tightening':
        arrival = 45;
        availability = 75;
        queue = 24;
        break;
      case 'Critical Ticket Surge':
        arrival = 85;
        availability = 65;
        queue = 40;
        break;
    }

    onChange({
      ...params,
      preset,
      ticketArrivalRatePerHour: arrival,
      agentAvailabilityPercent: availability,
      queueDepth: queue,
    });
  };

  return (
    <Card className="border-slate-200/90 bg-white shadow-xs overflow-hidden">
      {/* Cockpit Header with Embedded Action CTAs */}
      <div className="px-6 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Scenario Presets & Simulation Cockpit
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Interactive
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a preset scenario or fine-tune parameter thresholds to test capacity limits
          </p>
        </div>

        {/* Action Controls in Header - No scrolling needed */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            className="h-8 px-3 text-xs bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs"
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onRun}
            loading={loading}
            icon={<Play className="w-3.5 h-3.5" />}
            className="h-8 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            Run Simulation
          </Button>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Preset Selector Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              1. Choose Stress Scenario
            </span>
            <span className="text-[11px] text-slate-400">
              Active: <strong className="text-indigo-600">{params.preset}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {presets.map((p) => {
              const active = params.preset === p.name;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handlePresetSelect(p.name)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    active
                      ? 'bg-indigo-50/60 border-indigo-400 shadow-xs ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-slate-100/80 border border-slate-200/60 shrink-0">
                        {p.icon}
                      </span>
                      <span className={`text-xs font-bold ${active ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {p.name}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
                        active
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {p.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {p.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Parameter Sliders Cockpit */}
        <div className="pt-4 border-t border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              2. Fine-Tune Operational Parameters
            </span>
            <span className="text-[11px] text-slate-400">Live Stress Controls</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Slider 1: Arrival Rate */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Ticket Arrival Rate</span>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {params.ticketArrivalRatePerHour} / hr
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={params.ticketArrivalRatePerHour}
                onChange={(e) =>
                  onChange({ ...params, ticketArrivalRatePerHour: Number(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>10/hr (Low)</span>
                <span>80/hr (Nominal)</span>
                <span>150/hr (Surge)</span>
              </div>
            </div>

            {/* Slider 2: Staffing Availability */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Agent Staffing</span>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {params.agentAvailabilityPercent}% Available
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={params.agentAvailabilityPercent}
                onChange={(e) =>
                  onChange({ ...params, agentAvailabilityPercent: Number(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>20% (Shortage)</span>
                <span>75% (Target)</span>
                <span>100% (Full)</span>
              </div>
            </div>

            {/* Slider 3: Initial Queue Backlog */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Queue Depth</span>
                <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  {params.queueDepth} Tickets
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={params.queueDepth}
                onChange={(e) => onChange({ ...params, queueDepth: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>5 (Clear)</span>
                <span>35 (Nominal)</span>
                <span>100 (Critical)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
