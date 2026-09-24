import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { mockCategoryMetrics } from '../../data/mockAnalytics';
import { Card, CardHeader, CardContent } from '../common/Card';
import { PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#6366f1', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#8b5cf6', '#3b82f6'];

export const CategoryPieChart: React.FC = () => {
  return (
    <Card className="border-slate-200">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-indigo-600" />
            <span>Ticket Inflow by Category</span>
          </div>
        }
        subtitle="Distribution of incoming support volume across functional categories"
      />
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockCategoryMetrics}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="count"
              >
                {mockCategoryMetrics.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
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
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
