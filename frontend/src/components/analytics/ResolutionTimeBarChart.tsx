import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { mockDepartmentMetrics } from '../../data/mockAnalytics';
import { Card, CardHeader, CardContent } from '../common/Card';
import { BarChart3 } from 'lucide-react';

export const ResolutionTimeBarChart: React.FC = () => {
  return (
    <Card className="border-slate-200">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Average Resolution Time by Department (Minutes)</span>
          </div>
        }
        subtitle="Operational velocity benchmarked across specialized resolution teams"
      />
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockDepartmentMetrics} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="department" stroke="#64748b" tick={{ fontSize: 11 }} />
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
              <Bar dataKey="avgResolutionMinutes" name="Avg Resolution Time (Min)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="preventedBreaches" name="AI Prevented Breaches" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
