import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Send,
  Edit3,
  Bot,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { Ticket } from '../../types/ticket';
import { Card, CardHeader, CardContent, CardFooter } from '../common/Card';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { demoAdapter } from '../../services/demoAdapter';

interface AICopilotProps {
  ticket: Ticket;
}

export const AICopilotDrawer: React.FC<AICopilotProps> = ({ ticket }) => {
  const { addToast } = useApp();
  const [tone, setTone] = useState<'Empathetic' | 'Technical' | 'Executive' | 'Urgent'>('Empathetic');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reasoning, setReasoning] = useState('');
  const [confidence, setConfidence] = useState(96);

  const fetchDraft = async (selectedTone = tone) => {
    setIsGenerating(true);
    try {
      const res = await demoAdapter.generateCopilotResponse(ticket, selectedTone);
      setSubject(res.subject);
      setContent(res.content);
      setReasoning(res.reasoning);
      setConfidence(res.confidence);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (ticket.aiDraft) {
      setSubject(ticket.aiDraft.subject);
      setContent(ticket.aiDraft.content);
      setConfidence(ticket.aiDraft.confidence);
      setReasoning(`Automated draft synthesized for category: ${ticket.category}`);
    } else {
      fetchDraft(tone);
    }
  }, [ticket.id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${content}`);
    setCopied(true);
    addToast({
      type: 'success',
      title: 'Copied to Clipboard',
      message: 'Draft response text copied successfully.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToneChange = (newTone: 'Empathetic' | 'Technical' | 'Executive' | 'Urgent') => {
    setTone(newTone);
    fetchDraft(newTone);
  };

  const handleApproveAndSend = () => {
    addToast({
      type: 'success',
      title: 'Response Approved & Dispatched',
      message: `First-response delivered to ${ticket.customer.email}. SLA first-response metric fulfilled.`,
    });
  };

  return (
    <Card className="border-indigo-100 bg-white shadow-sm">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-slate-900">AI RESPONSE COPILOT</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold uppercase">
              Auto-Drafted First Response
            </span>
          </div>
        }
        subtitle="Context-aware resolution draft tailored to ticket category & customer tier"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Tone:</span>
            {(['Empathetic', 'Technical', 'Executive', 'Urgent'] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleToneChange(t)}
                className={`text-[11px] px-2.5 py-1 rounded-md transition-all ${
                  tone === t
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        }
      />

      <CardContent className="space-y-4">
        {/* Subject Header */}
        <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Subject:</span>
            <strong className="text-slate-900 font-semibold">{subject}</strong>
          </div>
          <div className="flex items-center gap-2 font-mono text-indigo-600 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{confidence}% Confidence Match</span>
          </div>
        </div>

        {/* Response Body or Editor */}
        <div className="relative">
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full bg-white border border-indigo-300 rounded-xl p-4 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
            />
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
              {content || 'Generating response draft...'}
            </div>
          )}

          {isGenerating && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center rounded-xl">
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing category-specific response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Reasoning Note */}
        {reasoning && (
          <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-[11px] text-slate-700 leading-relaxed">
            <strong className="text-indigo-800">Copilot Rationale:</strong> {reasoning}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDraft(tone)}
            loading={isGenerating}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Regenerate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            icon={<Edit3 className="w-3.5 h-3.5" />}
          >
            {isEditing ? 'Preview' : 'Edit Draft'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="success"
            size="sm"
            onClick={handleApproveAndSend}
            icon={<Send className="w-3.5 h-3.5" />}
            className="font-bold"
          >
            Approve & Send First Response
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
