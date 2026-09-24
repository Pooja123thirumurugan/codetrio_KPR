import React, { useState } from 'react';
import { SimulationControls } from '../components/simulator/SimulationControls';
import { SimulationResults } from '../components/simulator/SimulationResults';
import { WhatIfComparisonChart } from '../components/simulator/WhatIfComparisonChart';
import { SimulationParams, SimulationResult } from '../types/simulation';
import { simulationPresets } from '../data/mockSimulation';
import { demoAdapter } from '../services/demoAdapter';
import { Sliders, Sparkles } from 'lucide-react';

export const Simulator: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    preset: 'Ticket Spike',
    ticketArrivalRatePerHour: 95,
    agentAvailabilityPercent: 70,
    queueDepth: 38,
    slaDurationModifierMinutes: 0,
    autoEscalationAggressiveness: 'Balanced',
  });

  const [result, setResult] = useState<SimulationResult>(simulationPresets['Ticket Spike']);
  const [loading, setLoading] = useState(false);

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await demoAdapter.runSimulation(
        params.preset,
        params.ticketArrivalRatePerHour,
        params.agentAvailabilityPercent
      );
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const defaultParams: SimulationParams = {
      preset: 'Normal Load',
      ticketArrivalRatePerHour: 30,
      agentAvailabilityPercent: 85,
      queueDepth: 18,
      slaDurationModifierMinutes: 0,
      autoEscalationAggressiveness: 'Balanced',
    };
    setParams(defaultParams);
    setResult(simulationPresets['Normal Load']);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">What-If Queue & SLA Simulator</h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
            Interactive Model
          </span>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Stress-test support operations across traffic surges, agent absences, and tightening SLA targets
        </p>
      </div>

      {/* Simulation Controls & Presets */}
      <SimulationControls
        params={params}
        onChange={setParams}
        onRun={handleRunSimulation}
        onReset={handleReset}
        loading={loading}
      />

      {/* Trajectory Comparison Chart */}
      <WhatIfComparisonChart timeline={result.timeline} />

      {/* Projected Metrics, Breach Impact & Mitigations */}
      <SimulationResults result={result} />
    </div>
  );
};
