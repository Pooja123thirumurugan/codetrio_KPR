import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { mockComplianceTrend } from '../../data/mockAnalytics';
import { Card, CardHeader, CardContent } from '../common/Card';
import { ShieldCheck } from 'lucide-react';

export const SLAComplianceTrend: React.FC = () => {
  return (
    <Card className="border-slate-200">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            <span>SLA Compliance Adherence Trend: Guardian AI vs Legacy</span>
          </div>
        }
        subtitle="7-day comparative compliance rate maintaining >98% contractual SLA adherence"
      />
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockComplianceTrend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis domain={[80, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
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
              <Line
                type="monotone"
                dataKey="withGuardianAI"
                name="With SLA Guardian AI (%)"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ r: 4, fill: '#06b6d4' }}
              />
              <Line
                type="monotone"
                dataKey="legacyWithoutAI"
                name="Legacy Routing Without AI (%)"
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#64748b' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
