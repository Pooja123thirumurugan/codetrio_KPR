import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { SimulationTimelinePoint } from '../../types/simulation';
import { Card, CardHeader, CardContent } from '../common/Card';
import { TrendingUp } from 'lucide-react';

export const WhatIfComparisonChart: React.FC<{ timeline: SimulationTimelinePoint[] }> = ({
  timeline,
}) => {
  return (
    <Card className="border-slate-200">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-600" />
            <span>What-If Trajectory: Baseline vs Simulated Stress Curve</span>
          </div>
        }
        subtitle="Simulated queue depth and breach probability projected across next 2 hours"
      />
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="simQueueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="baseQueueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="timeOffset" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#0f172a',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04)',
                }}
                itemStyle={{ color: '#334155' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
              <Area
                type="monotone"
                dataKey="simulatedQueue"
                name="Simulated Queue Depth"
                stroke="#ef4444"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#simQueueGrad)"
              />
              <Area
                type="monotone"
                dataKey="baselineQueue"
                name="Baseline Queue Depth"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#baseQueueGrad)"
              />
              <Area
                type="monotone"
                dataKey="simulatedBreachRisk"
                name="Simulated Breach Risk (%)"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
