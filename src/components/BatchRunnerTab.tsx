import React, { useState } from 'react';
import {
  Play,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Clock,
  Download
} from 'lucide-react';
import type { BenchmarkItem } from '../data/benchmarkDataset';
import type { TriageResult } from '../engine/types';

interface BatchRunnerTabProps {
  benchmarkDataset: BenchmarkItem[];
  results: TriageResult[];
  isRunning: boolean;
  onRunBatch: () => void;
  onSelectResult: (result: TriageResult) => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
}

export const BatchRunnerTab: React.FC<BatchRunnerTabProps> = ({
  benchmarkDataset,
  results,
  isRunning,
  onRunBatch,
  onSelectResult,
  onExportJSON,
  onExportCSV
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredResults = results.filter(r => {
    // Category type filter
    if (filterType !== 'all' && r.category_type !== filterType) {
      return false;
    }
    // Priority filter
    if (filterPriority !== 'all' && r.decision.priority !== filterPriority) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMsg = r.raw_message.toLowerCase().includes(q);
      const matchCat = r.decision.category.toLowerCase().includes(q);
      const matchSummary = r.decision.summary.toLowerCase().includes(q);
      const matchCustomer = (r.customer_name || '').toLowerCase().includes(q);
      if (!matchMsg && !matchCat && !matchSummary && !matchCustomer) {
        return false;
      }
    }
    return true;
  });

  const progressPercent = results.length > 0
    ? Math.round((results.length / benchmarkDataset.length) * 100)
    : 0;

  return (
    <div>
      {/* Control Banner */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Benchmark Suite Evaluation
              <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1' }}>
                {benchmarkDataset.length} Test Cases
              </span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Evaluate autonomous triage resilience against sarcastic complaints, prompt injection attacks, multi-issue paragraphs, and multilingual tickets.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="btn-primary"
              onClick={onRunBatch}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Triaging Benchmark ({results.length}/{benchmarkDataset.length})...
                </>
              ) : (
                <>
                  <Play size={16} />
                  {results.length > 0 ? 'Re-Run Benchmark Suite' : 'Run Full Benchmark (42 Tests)'}
                </>
              )}
            </button>

            {results.length > 0 && (
              <>
                <button className="btn-secondary" onClick={onExportJSON} title="Export Structured Output JSON">
                  <Download size={14} /> JSON
                </button>
                <button className="btn-secondary" onClick={onExportCSV} title="Export Decisions CSV">
                  <Download size={14} /> CSV
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {isRunning && (
          <div style={{ marginTop: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: 'var(--text-secondary)' }}>
              <span>Streaming triage inference...</span>
              <span>{results.length} / {benchmarkDataset.length} completed ({progressPercent}%)</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                  transition: 'width 0.2s ease'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginRight: '4px' }}>
              <Filter size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              Category:
            </span>
            {[
              { id: 'all', label: 'All Cases' },
              { id: 'adversarial_injection', label: '🛡️ Adversarial' },
              { id: 'critical_p0', label: '🔥 P0 Emergency' },
              { id: 'sarcastic', label: '😏 Sarcastic' },
              { id: 'multi_issue', label: '🔀 Multi-Issue' },
              { id: 'non_english', label: '🌐 Multilingual' },
              { id: 'angry_churn', label: '⚡ Angry/Churn' },
              { id: 'vague', label: '❓ Vague' },
              { id: 'out_of_scope', label: '🚫 Out of Scope' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                style={{
                  background: filterType === tab.id ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${filterType === tab.id ? 'rgba(99, 102, 241, 0.5)' : 'transparent'}`,
                  color: filterType === tab.id ? '#ffffff' : 'var(--text-secondary)',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Controls: Priority Selector + Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              className="select-input"
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              style={{ width: '130px', height: '36px', padding: '6px 10px', fontSize: '12px' }}
            >
              <option value="all">All Priorities</option>
              <option value="P0">P0 - Emergency</option>
              <option value="P1">P1 - High</option>
              <option value="P2">P2 - Moderate</option>
              <option value="P3">P3 - Routine</option>
            </select>

            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search messages, user..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-text"
                style={{ paddingLeft: '36px', height: '36px', fontSize: '13px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {results.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Clock size={40} color="var(--accent-indigo)" style={{ margin: '0 auto 16px auto', display: 'block' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Benchmark Suite Not Run Yet</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 20px auto' }}>
            Click the button below to process all 42 real-world edge-case messages through the frontline triage engine.
          </p>
          <button className="btn-primary" onClick={onRunBatch} disabled={isRunning}>
            <Play size={16} /> Run Full Benchmark
          </button>
        </div>
      ) : (
        <div className="triage-table-container">
          <table className="triage-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Priority</th>
                <th style={{ width: '150px' }}>Category</th>
                <th>Raw Customer Message</th>
                <th style={{ width: '240px' }}>Structured Summary & Suggested Action</th>
                <th style={{ width: '130px' }}>Needs Human</th>
                <th style={{ width: '120px' }}>Confidence</th>
                <th style={{ width: '70px', textAlign: 'center' }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map(r => {
                const prio = r.decision.priority.toLowerCase();
                const isNeedsHuman = r.decision.needs_human;
                const confPercent = (r.decision.confidence * 100).toFixed(0);
                const confLevel = r.decision.confidence >= 0.85 ? 'high' : r.decision.confidence >= 0.7 ? 'medium' : 'low';

                return (
                  <tr key={r.id} onClick={() => onSelectResult(r)}>
                    <td>
                      <span className={`badge-priority ${prio}`}>
                        {r.decision.priority}
                      </span>
                    </td>
                    <td>
                      <div className="badge-category" title={r.decision.category}>
                        {r.decision.category.length > 22 ? r.decision.category.slice(0, 20) + '...' : r.decision.category}
                      </div>
                      {r.metadata.adversarial_detected && (
                        <div style={{ marginTop: '4px' }}>
                          <span className="badge-risk">🛡️ INJECTION</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px', fontSize: '13px' }}>
                        {r.raw_message.length > 120 ? r.raw_message.slice(0, 118) + '...' : r.raw_message}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                        <span>👤 {r.customer_name || 'Anonymous'}</span>
                        <span>🏷️ {r.account_tier || 'Standard'}</span>
                        {r.metadata.detected_language !== 'English' && (
                          <span style={{ color: '#67e8f9' }}>🌐 {r.metadata.detected_language}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '3px', lineHeight: '1.4' }}>
                        {r.decision.summary}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 500 }}>
                        → {r.decision.suggested_action}
                      </div>
                    </td>
                    <td>
                      <span className={`badge-human ${isNeedsHuman ? 'needs-human' : 'automated'}`}>
                        {isNeedsHuman ? '⚠️ Human Assist' : '✅ Automated'}
                      </span>
                    </td>
                    <td>
                      <div className="confidence-container">
                        <div className="confidence-track">
                          <div
                            className={`confidence-fill ${confLevel}`}
                            style={{ width: `${confPercent}%` }}
                          />
                        </div>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                          {confPercent}%
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px', borderRadius: '6px' }}
                        onClick={e => {
                          e.stopPropagation();
                          onSelectResult(r);
                        }}
                        title="View Full JSON Schema & Webhook Dispatch"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
