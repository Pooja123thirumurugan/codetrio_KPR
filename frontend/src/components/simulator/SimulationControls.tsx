import React from 'react';
import { Sliders, Play, RotateCcw, Zap } from 'lucide-react';
import { SimulationPreset, SimulationParams } from '../../types/simulation';
import { Card, CardHeader, CardContent, CardFooter } from '../common/Card';
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
  const presets: { name: SimulationPreset; desc: string }[] = [
    { name: 'Normal Load', desc: 'Baseline operations with steady queue inflow' },
    { name: 'Ticket Spike', desc: '+150% ticket arrival surge across all channels' },
    { name: 'Agent Failure', desc: '2 Tier-3 technical specialists abruptly go offline' },
    { name: 'Queue Overload', desc: 'Cascading backlog with delayed resolution times' },
    { name: 'SLA Policy Tightening', desc: 'Critical SLA target halved from 30m to 15m' },
    { name: 'Critical Ticket Surge', desc: 'Simultaneous influx of 8 P1 enterprise incidents' },
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
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-slate-900">Simulation Parameters & Scenario Presets</span>
          </div>
        }
        subtitle="Simulate load stress tests to predict queue growth and preventive capacity deficits"
      />

      <CardContent className="space-y-6">
        {/* Preset Selector Grid */}
        <div>
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2.5">
            Select Operational Stress Scenario
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {presets.map((p) => {
              const active = params.preset === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => handlePresetSelect(p.name)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-indigo-50 border-indigo-400 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${active ? 'text-indigo-900' : 'text-slate-800'}`}>
                      {p.name}
                    </span>
                    {active && <Zap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">{p.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-100">
          {/* Ticket Arrival Rate Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-medium">Ticket Arrival Rate:</span>
              <span className="font-mono font-bold text-indigo-600">{params.ticketArrivalRatePerHour} tickets/hr</span>
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
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>10/hr (Low)</span>
              <span>150/hr (Max Surge)</span>
            </div>
          </div>

          {/* Agent Availability Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-medium">Agent Staffing Availability:</span>
              <span className="font-mono font-bold text-emerald-600">{params.agentAvailabilityPercent}% available</span>
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
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>20% (Shortage)</span>
              <span>100% (Full Roster)</span>
            </div>
          </div>

          {/* Initial Queue Depth Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-medium">Current Queue Depth:</span>
              <span className="font-mono font-bold text-cyan-600">{params.queueDepth} tickets</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={params.queueDepth}
              onChange={(e) => onChange({ ...params, queueDepth: Number(e.target.value) })}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>5 (Clear)</span>
              <span>100 (Backlogged)</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          icon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset to Baseline
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={onRun}
          loading={loading}
          icon={<Play className="w-4 h-4" />}
          className="font-bold shadow-indigo-600/40"
        >
          Run Predictive Simulation
        </Button>
      </CardFooter>
    </Card>
  );
};
