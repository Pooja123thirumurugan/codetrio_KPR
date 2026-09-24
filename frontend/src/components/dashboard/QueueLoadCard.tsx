import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const QueueLoadCard: React.FC = () => {
  const { departmentPressure } = useApp();

  return (
    <Card className="border-slate-200">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Department Queue Depth & Capacity Pressure</span>
          </div>
        }
        subtitle="Real-time load balancing across all 5 operational support departments"
      />
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {departmentPressure.map((dept) => {
            const isCrit = dept.status === 'CRITICAL';
            return (
              <div
                key={dept.department}
                className={`p-4 rounded-xl border transition-all ${
                  isCrit
                    ? 'bg-rose-50/80 border-rose-200 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 truncate">{dept.department}</span>
                  {isCrit ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 px-1.5 py-0.5 rounded bg-rose-100 border border-rose-200">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      SURGE
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      OPTIMAL
                    </span>
                  )}
                </div>

                <div className="space-y-2 mt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Queue Depth:</span>
                    <span className="font-mono font-bold text-slate-900">{dept.queueDepth}</span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Capacity Load:</span>
                    <span className={`font-mono font-bold ${isCrit ? 'text-rose-600' : 'text-slate-800'}`}>
                      {dept.avgCapacityUtilization}%
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        dept.avgCapacityUtilization >= 85
                          ? 'bg-rose-500'
                          : dept.avgCapacityUtilization >= 70
                          ? 'bg-amber-500'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(100, dept.avgCapacityUtilization)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] pt-1 text-slate-500">
                    <span>At-Risk: <strong className={dept.highRiskTicketsCount > 0 ? 'text-amber-600' : 'text-slate-700'}>{dept.highRiskTicketsCount}</strong></span>
                    <span>Pred. Breaches: <strong className={dept.predictedBreachesCount > 0 ? 'text-rose-600' : 'text-slate-700'}>{dept.predictedBreachesCount}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
