import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  Share2,
  Tag
} from 'lucide-react';
import type { TriageResult } from '../engine/types';
import { simulateWebhookDispatch } from '../engine/webhookSimulator';

interface ItemDetailModalProps {
  result: TriageResult | null;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ result, onClose }) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'telemetry' | 'webhooks'>('schema');
  const [copied, setCopied] = useState<boolean>(false);

  if (!result) return null;

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(result.decision, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dispatches = simulateWebhookDispatch(result);
  const prio = result.decision.priority.toLowerCase();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '780px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span className={`badge-priority ${prio}`}>
                {result.decision.priority}
              </span>
              <span className={`badge-human ${result.decision.needs_human ? 'needs-human' : 'automated'}`}>
                {result.decision.needs_human ? '⚠️ Needs Human' : '✅ 100% Automated'}
              </span>
              <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {result.id}
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
              {result.decision.category}
            </h3>
          </div>

          <button className="btn-secondary" style={{ padding: '6px', borderRadius: '8px' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Customer & Message block */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span>👤 {result.customer_name || 'Anonymous'} • Tier: <strong>{result.account_tier || 'Standard'}</strong></span>
            <span>Channel: {result.source} • SLA: {result.metadata.sla_target}</span>
          </div>
          <div style={{ fontSize: '13px', color: '#f8fafc', fontStyle: 'italic', lineHeight: '1.5' }}>
            "{result.raw_message}"
          </div>
        </div>

        {/* Core Decision Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Structured Summary
            </div>
            <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '4px', lineHeight: '1.4' }}>
              {result.decision.summary}
            </div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 600, textTransform: 'uppercase' }}>
              Suggested Next Action
            </div>
            <div style={{ fontSize: '13px', color: '#34d399', fontWeight: 600, marginTop: '4px', lineHeight: '1.4' }}>
              ⚡ {result.decision.suggested_action}
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '14px' }}>
          <button
            className="nav-tab-btn"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              background: activeTab === 'schema' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              color: activeTab === 'schema' ? '#fff' : 'var(--text-secondary)'
            }}
            onClick={() => setActiveTab('schema')}
          >
            <Terminal size={14} /> Strict JSON Output
          </button>
          <button
            className="nav-tab-btn"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              background: activeTab === 'telemetry' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              color: activeTab === 'telemetry' ? '#fff' : 'var(--text-secondary)'
            }}
            onClick={() => setActiveTab('telemetry')}
          >
            <ShieldCheck size={14} /> Guardrails & Audit Trace
          </button>
          <button
            className="nav-tab-btn"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              background: activeTab === 'webhooks' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              color: activeTab === 'webhooks' ? '#fff' : 'var(--text-secondary)'
            }}
            onClick={() => setActiveTab('webhooks')}
          >
            <Share2 size={14} /> Webhook Dispatches ({dispatches.length})
          </button>
        </div>

        {/* Tab 1: JSON Schema */}
        {activeTab === 'schema' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Exact Decision Object Schema</span>
              <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={copyJSON}>
                {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                {copied ? 'Copied to Clipboard' : 'Copy JSON'}
              </button>
            </div>
            <pre className="json-viewer">
              {JSON.stringify(result.decision, null, 2)}
            </pre>
          </div>
        )}

        {/* Tab 2: Telemetry */}
        {activeTab === 'telemetry' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Language</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#67e8f9', marginTop: '2px' }}>
                  🌐 {result.metadata.detected_language}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sentiment Tone</div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>
                  {result.metadata.sentiment}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Execution Latency</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-purple)', marginTop: '2px' }}>
                  ⚡ {result.metadata.processing_time_ms}ms
                </div>
              </div>
            </div>

            {result.metadata.adversarial_detected && (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={15} /> Prompt Injection Attack Flagged
                </div>
                <div style={{ fontSize: '11px', color: '#fca5a5', marginTop: '4px' }}>
                  {result.metadata.adversarial_details}
                </div>
              </div>
            )}

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Reasoning & Audit Trail</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>
                {result.metadata.reasoning}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {result.metadata.risk_tags.map((t, idx) => (
                <span key={idx} className="badge-risk">
                  <Tag size={10} /> {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Webhooks */}
        {activeTab === 'webhooks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dispatches.map((d, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: d.channel === 'PagerDuty' ? '#f87171' : d.channel === 'Slack' ? '#38bdf8' : '#34d399' }}>
                    🚀 {d.channel} ({d.target})
                  </span>
                  <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)' }}>
                    {d.status}
                  </span>
                </div>
                <pre className="json-viewer" style={{ fontSize: '11px', maxHeight: '140px' }}>
                  {JSON.stringify(d.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
