import React, { useState } from 'react';
import {
  UserCheck,
  Check,
  Edit3,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import type { TriageResult, Priority, TriageDecision } from '../engine/types';

interface HumanReviewQueueTabProps {
  results: TriageResult[];
  onUpdateResult: (updatedResult: TriageResult) => void;
  onSelectResult?: (result: TriageResult) => void;
}

export const HumanReviewQueueTab: React.FC<HumanReviewQueueTabProps> = ({
  results,
  onUpdateResult
}) => {
  const reviewItems = results.filter(r => r.decision.needs_human);

  const [filterReason, setFilterReason] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<TriageResult | null>(null);
  const [overridePriority, setOverridePriority] = useState<Priority>('P1');
  const [overrideAction, setOverrideAction] = useState<string>('');
  const [overrideNotes, setOverrideNotes] = useState<string>('');

  const filteredItems = reviewItems.filter(item => {
    if (filterReason === 'p0') return item.decision.priority === 'P0';
    if (filterReason === 'adversarial') return item.metadata.adversarial_detected;
    if (filterReason === 'low_conf') return item.decision.confidence < 0.75;
    if (filterReason === 'multi_issue') return item.metadata.multi_issue_detected;
    return true;
  });

  const handleOpenOverride = (item: TriageResult) => {
    setSelectedTicket(item);
    setOverridePriority(item.decision.priority);
    setOverrideAction(item.decision.suggested_action);
    setOverrideNotes('');
  };

  const handleApprove = (item: TriageResult) => {
    const updated: TriageResult = {
      ...item,
      decision: {
        ...item.decision,
        needs_human: false
      },
      human_override: {
        overridden_at: new Date().toISOString(),
        override_notes: 'Human Agent approved AI triage action without modifications.',
        original_decision: { ...item.decision },
        new_decision: { ...item.decision, needs_human: false }
      }
    };
    onUpdateResult(updated);
  };

  const handleSaveOverride = () => {
    if (!selectedTicket) return;

    const newDecision: TriageDecision = {
      ...selectedTicket.decision,
      priority: overridePriority,
      suggested_action: overrideAction,
      needs_human: false
    };

    const updated: TriageResult = {
      ...selectedTicket,
      decision: newDecision,
      human_override: {
        overridden_at: new Date().toISOString(),
        override_notes: overrideNotes || 'Modified priority and/or suggested action.',
        original_decision: { ...selectedTicket.decision },
        new_decision: newDecision
      }
    };

    onUpdateResult(updated);
    setSelectedTicket(null);
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={20} color="var(--p1-text)" />
              Human-in-the-Loop Review Queue
              <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}>
                {reviewItems.length} Pending Actions
              </span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Tickets automatically escalated due to critical P0 severity, adversarial jailbreak attempts, low confidence, or multi-issue ambiguity.
            </p>
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All (${reviewItems.length})` },
              { id: 'p0', label: '🔥 P0 Emergency' },
              { id: 'adversarial', label: '🛡️ Adversarial Probe' },
              { id: 'low_conf', label: '❓ Low Confidence' },
              { id: 'multi_issue', label: '🔀 Multi-Issue' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterReason(tab.id)}
                style={{
                  background: filterReason === tab.id ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${filterReason === tab.id ? 'rgba(245, 158, 11, 0.5)' : 'transparent'}`,
                  color: filterReason === tab.id ? '#ffffff' : 'var(--text-secondary)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Queue List */}
      {filteredItems.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Check size={40} color="var(--accent-emerald)" style={{ margin: '0 auto 16px auto', display: 'block' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Queue is Clear!</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            No tickets currently require human escalation under the active filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredItems.map(item => {
            const prio = item.decision.priority.toLowerCase();
            return (
              <div
                key={item.id}
                className="glass-card"
                style={{
                  padding: '20px',
                  borderLeft: `4px solid ${
                    item.decision.priority === 'P0'
                      ? 'var(--p0-text)'
                      : item.metadata.adversarial_detected
                      ? '#f87171'
                      : 'var(--p1-text)'
                  }`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge-priority ${prio}`}>
                      {item.decision.priority}
                    </span>
                    <span className="badge-category">
                      {item.decision.category}
                    </span>
                    {item.metadata.adversarial_detected && (
                      <span className="badge-risk">
                        <ShieldAlert size={12} /> PROMPT INJECTION
                      </span>
                    )}
                    {item.metadata.multi_issue_detected && (
                      <span className="badge-category" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc' }}>
                        🔀 Multi-Issue
                      </span>
                    )}
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Ticket #{item.id} • {item.customer_name || 'Anonymous'} ({item.account_tier || 'Standard'})
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => handleOpenOverride(item)}
                    >
                      <Edit3 size={13} /> Override / Edit
                    </button>
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '12px', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                      onClick={() => handleApprove(item)}
                    >
                      <Check size={14} /> Approve Action
                    </button>
                  </div>
                </div>

                {/* Raw message block */}
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '12px', fontStyle: 'italic', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                  "{item.raw_message}"
                </div>

                {/* Structured triage breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '14px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>STRUCTURED SUMMARY</div>
                    <div style={{ fontSize: '12px', color: '#e2e8f0', marginTop: '2px' }}>{item.decision.summary}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>PROPOSED ACTION</div>
                    <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 500, marginTop: '2px' }}>
                      → {item.decision.suggested_action}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>CONFIDENCE</div>
                    <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: item.decision.confidence >= 0.75 ? '#34d399' : '#fbbf24', marginTop: '2px' }}>
                      {(item.decision.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Escalation reason footnote */}
                <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={12} color="#fbbf24" />
                  <span><strong>Reason for Escalation:</strong> {item.metadata.reasoning}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Override Modal */}
      {selectedTicket && (
        <div className="modal-backdrop" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit3 size={18} color="var(--accent-indigo)" />
              Human Agent Decision Override
            </h3>

            <div style={{ marginBottom: '14px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Original Message:</div>
              <div style={{ fontSize: '13px', color: '#fff' }}>"{selectedTicket.raw_message}"</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Priority Level
                </label>
                <select
                  className="select-input"
                  value={overridePriority}
                  onChange={e => setOverridePriority(e.target.value as Priority)}
                >
                  <option value="P0">P0 - Critical Emergency</option>
                  <option value="P1">P1 - High Severity</option>
                  <option value="P2">P2 - Moderate Issue</option>
                  <option value="P3">P3 - Routine / Low</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Override Suggested Action
                </label>
                <input
                  type="text"
                  className="input-text"
                  value={overrideAction}
                  onChange={e => setOverrideAction(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Audit Override Notes
              </label>
              <textarea
                className="input-textarea"
                rows={3}
                placeholder="Explain why priority or action was changed for audit compliance..."
                value={overrideNotes}
                onChange={e => setOverrideNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setSelectedTicket(null)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveOverride}>
                <Check size={14} /> Commit Human Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
