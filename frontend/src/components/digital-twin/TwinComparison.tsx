import React, { useState } from 'react';
import { Cpu, ArrowRight, Zap, CheckCircle2, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DigitalTwinState } from '../../types/simulation';
import { Card, CardHeader, CardContent, CardFooter } from '../common/Card';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';

export const TwinComparison: React.FC<{
  twinState: DigitalTwinState;
  onOptimize: () => void;
  isOptimized: boolean;
}> = ({ twinState, onOptimize, isOptimized }) => {
  const { addToast } = useApp();

  const handleOptimizeClick = () => {
    onOptimize();
    addToast({
      type: 'success',
      title: 'Digital Twin Scenario Optimized',
      message: 'Autonomous recommendations applied. Projected breach risk reduced to 0.',
    });
  };

  return (
    <div className="space-y-6">
      {/* 3-Column Parallel Comparison */}
      {/* 3-Column Parallel Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: CURRENT STATE */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-blue-600 font-bold uppercase tracking-wider">CURRENT STATE</span>
              </div>
            }
            subtitle="Observed live telemetry across support channels"
          />
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500">Queue Depth:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{twinState.current.queueDepth}</span>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500">At-Risk Tickets:</span>
                <span className="font-mono font-bold text-amber-600 text-sm">{twinState.current.atRiskTickets}</span>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500">Avg Utilization:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{twinState.current.avgUtilization}%</span>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500">Predicted Breaches:</span>
                <span className="font-mono font-bold text-rose-600 text-sm">{twinState.current.predictedBreaches}</span>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500">Active Agents:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{twinState.current.activeAgents}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Avg Wait Time:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{twinState.current.avgWaitMinutes}m</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <span className="text-[11px] text-slate-400 font-mono">Current Live Feed</span>
          </CardFooter>
        </Card>

        {/* Column 2: SIMULATED FUTURE STATE */}
        <Card
          className={`border transition-all shadow-xs ${
            isOptimized
              ? 'border-emerald-200 bg-emerald-50/50'
              : 'border-rose-200 bg-rose-50/40'
          }`}
        >
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isOptimized ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'}`} />
                <span
                  className={`font-bold uppercase tracking-wider ${
                    isOptimized ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {isOptimized ? 'OPTIMIZED STATE (ACTIVE)' : 'SIMULATED FUTURE STATE'}
                </span>
              </div>
            }
            subtitle={isOptimized ? 'AI rebalanced load state' : 'Unmitigated queue trajectory'}
          />
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">Queue Depth:</span>
                <span className={`font-mono font-bold text-sm ${isOptimized ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {twinState.simulatedFuture.queueDepth}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">At-Risk Tickets:</span>
                <span className={`font-mono font-bold text-sm ${isOptimized ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {twinState.simulatedFuture.atRiskTickets}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">Avg Utilization:</span>
                <span className={`font-mono font-bold text-sm ${isOptimized ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {twinState.simulatedFuture.avgUtilization}%
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">Predicted Breaches:</span>
                <span className={`font-mono font-bold text-sm ${isOptimized ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {twinState.simulatedFuture.predictedBreaches}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">Active Agents:</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{twinState.simulatedFuture.activeAgents}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Avg Wait Time:</span>
                <span className={`font-mono font-bold text-sm ${isOptimized ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {twinState.simulatedFuture.avgWaitMinutes}m
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <span className={`text-[11px] font-mono font-medium ${isOptimized ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isOptimized ? 'Deficit Eliminated' : 'Severe Deficit Warning'}
            </span>
          </CardFooter>
        </Card>

        {/* Column 3: AI OPTIMIZED TARGET */}
        <Card className="border-indigo-100 bg-white shadow-xs">
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-600" />
                <span className="text-cyan-700 font-bold uppercase tracking-wider">AI OPTIMIZED TARGET</span>
              </div>
            }
            subtitle="Autonomous rebalancing trajectory"
          />
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500">Target Queue Depth:</span>
                <span className="font-mono font-bold text-cyan-700 text-sm">
                  {twinState.optimizedRecommendation.queueDepth}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500">Target At-Risk:</span>
                <span className="font-mono font-bold text-cyan-700 text-sm">
                  {twinState.optimizedRecommendation.atRiskTickets}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500">Optimal Utilization:</span>
                <span className="font-mono font-bold text-cyan-700 text-sm">
                  {twinState.optimizedRecommendation.avgUtilization}%
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500">Target Breaches:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">0 Breaches</span>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500">Target Agents:</span>
                <span className="font-mono font-bold text-cyan-700 text-sm">
                  {twinState.optimizedRecommendation.activeAgents}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Target Wait Time:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {twinState.optimizedRecommendation.avgWaitMinutes}m
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <span className="text-[11px] text-cyan-700 font-mono font-medium">100% Policy Adherence</span>
          </CardFooter>
        </Card>
      </div>

      {/* Recommended Action Plan & One-Click Optimize Button */}
      <Card className="border-indigo-100 bg-white shadow-xs">
        <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Autonomous Digital Twin Rebalancing Engine
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Applying the optimization package will reallocate queue load across 12 agents, trigger 4 pre-breach escalations before critical thresholds, and activate AI Response Copilots.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
              {twinState.optimizedRecommendation.changesSummary.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="shrink-0 self-end md:self-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleOptimizeClick}
              disabled={isOptimized}
              icon={<Zap className="w-4 h-4" />}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
            >
              {isOptimized ? 'Scenario Optimized' : 'Optimize Scenario'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
