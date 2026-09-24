import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Database, Bell, Cpu, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { mockSLAPolicies } from '../data/mockSLA';
import { Button } from '../components/common/Button';
import { useApp } from '../context/AppContext';

export const Settings: React.FC = () => {
  const { addToast } = useApp();
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [threshold, setThreshold] = useState(75);
  const [copilotTone, setCopilotTone] = useState('Empathetic');
  const [refreshInterval, setRefreshInterval] = useState('10s');

  const handleSave = () => {
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'SLA policy thresholds and system preferences updated successfully.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Settings & SLA Policies</h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Configure automated pre-breach thresholds, department SLA targets, and Phase 3 API interfaces
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleSave} className="font-bold">
          Save Configuration
        </Button>
      </div>

      {/* SLA Policies Table */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-900 font-bold">Contractual SLA Policies & Thresholds</span>
            </div>
          }
          subtitle="Configured first-response and resolution contracts by department and priority tier"
        />
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Policy Name</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold text-center">Priority</th>
                <th className="py-3 px-4 font-semibold text-center">First Response</th>
                <th className="py-3 px-4 font-semibold text-center">Resolution SLA</th>
                <th className="py-3 px-4 font-semibold text-center">Pre-Breach Alert Threshold</th>
                <th className="py-3 px-4 font-semibold text-center">Auto-Escalation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockSLAPolicies.map((pol) => (
                <tr key={pol.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{pol.name}</td>
                  <td className="py-3 px-4 text-slate-700">{pol.department}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-slate-900">{pol.priority}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-700">{pol.firstResponseMinutes}m</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-indigo-600">{pol.resolutionMinutes}m</td>
                  <td className="py-3 px-4 text-center font-mono text-amber-600 font-bold">
                    &ge; {pol.preventiveAlertThresholdPercent}% breach risk
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        pol.autoEscalationEnabled
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {pol.autoEscalationEnabled ? 'ENABLED' : 'MANUAL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Grid: Global Model Preferences & Phase 3 API Contracts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Preferences */}
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-900 font-bold">Predictive Engine Configuration</span>
              </div>
            }
            subtitle="Threshold tuning for autonomous pre-breach alerts"
          />
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Automated Pre-Breach Escalation</span>
                <span className="text-slate-500 text-[11px] block">Trigger Tier 2 escalation automatically when threshold breached</span>
              </div>
              <button
                onClick={() => setAutoEscalate(!autoEscalate)}
                className="text-indigo-600 hover:text-indigo-700"
              >
                {autoEscalate ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">Global Breach Probability Alert Threshold</span>
                <span className="font-mono font-bold text-indigo-600">{threshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">Recommended default: 75% breach risk</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Default AI Copilot Response Tone</span>
                <span className="text-slate-500 text-[11px] block">Baseline persona for automated first-response generation</span>
              </div>
              <select
                value={copilotTone}
                onChange={(e) => setCopilotTone(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 text-xs shadow-xs"
              >
                <option value="Empathetic">Empathetic</option>
                <option value="Technical">Technical</option>
                <option value="Executive">Executive</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Phase 3 API Contracts & Architecture Preview */}
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-600" />
                <span className="text-slate-900 font-bold">Phase 3 Integration Architecture Contract</span>
              </div>
            }
            subtitle="Prepared interface contracts for seamless backend swap in Phase 3"
          />
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-1">
              <span className="text-[10px] font-mono text-cyan-700 font-bold block">CURRENT ADAPTER</span>
              <p className="text-slate-900 font-semibold">LocalDemoAdapter (In-Memory State)</p>
              <p className="text-[11px] text-slate-600">Zero backend dependency. 100% self-contained for Phase 1 frontend evaluation.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono text-slate-500 font-bold block">PHASE 3 REST API TARGET (DISABLED IN PHASE 1)</span>
              <input
                type="text"
                disabled
                value="http://localhost:8000/api/v1 (FastAPI Target)"
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-slate-500 font-mono text-[11px]"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono text-slate-500 font-bold block">PHASE 3 WEBSOCKET TELEMETRY TARGET (DISABLED IN PHASE 1)</span>
              <input
                type="text"
                disabled
                value="ws://localhost:8000/ws/live-queue"
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-slate-500 font-mono text-[11px]"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono text-slate-500 font-bold block">PHASE 3 GEMINI LLM COPILOT ENDPOINT (DISABLED IN PHASE 1)</span>
              <input
                type="text"
                disabled
                value="google-genai://gemini-2.5-flash (Phase 3 Backend)"
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-slate-500 font-mono text-[11px]"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
