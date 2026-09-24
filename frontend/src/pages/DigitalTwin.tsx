import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, Zap } from 'lucide-react';
import { TwinComparison } from '../components/digital-twin/TwinComparison';
import { DigitalTwinState } from '../types/simulation';
import { demoAdapter } from '../services/demoAdapter';
import { Button } from '../components/common/Button';

export const DigitalTwin: React.FC = () => {
  const [twinState, setTwinState] = useState<DigitalTwinState | null>(null);
  const [isOptimized, setIsOptimized] = useState(false);

  useEffect(() => {
    demoAdapter.getDigitalTwin().then(setTwinState);
  }, []);

  const handleOptimize = async () => {
    const updated = await demoAdapter.optimizeDigitalTwinScenario();
    setTwinState(updated);
    setIsOptimized(true);
  };

  const handleReset = async () => {
    demoAdapter.resetDemoState();
    const fresh = await demoAdapter.getDigitalTwin();
    setTwinState(fresh);
    setIsOptimized(false);
  };

  if (!twinState) return null;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">SLA Digital Twin</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold">
              Predictive Mirror
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Real-time digital replica comparing observed live operations with predicted future states and optimal AI trajectories
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOptimized && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Reset Twin to Unoptimized
            </Button>
          )}
        </div>
      </div>

      {/* Twin Parallel Comparison & Rebalancing Controller */}
      <TwinComparison
        twinState={twinState}
        onOptimize={handleOptimize}
        isOptimized={isOptimized}
      />
    </div>
  );
};
