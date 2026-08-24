import React, { useState } from 'react';
import {
  Database,
  ExternalLink,
  Code,
  Check,
  Copy,
  Upload,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { DATASET_SOURCES } from '../data/datasetSources';
import type { DatasetSourceInfo } from '../data/datasetSources';
import { BENCHMARK_DATASET } from '../data/benchmarkDataset';
import type { BenchmarkItem } from '../data/benchmarkDataset';

interface DatasetHubTabProps {
  onImportCustomDataset: (items: BenchmarkItem[]) => void;
}

export const DatasetHubTab: React.FC<DatasetHubTabProps> = ({ onImportCustomDataset }) => {
  const [selectedSource, setSelectedSource] = useState<DatasetSourceInfo>(DATASET_SOURCES[0]);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<'sources' | 'benchmark_viewer' | 'upload'>('sources');
  const [benchmarkFilter, setBenchmarkFilter] = useState<string>('all');
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            const formatted: BenchmarkItem[] = parsed.map((item, idx) => ({
              id: item.id || `CUSTOM-${idx + 1}`,
              source: item.source || 'custom_upload',
              category_type: item.category_type || 'standard',
              raw_message: item.raw_message || item.message || item.text || String(item),
              customer_name: item.customer_name || 'Customer',
              account_tier: item.account_tier || 'Pro',
              difficulty_notes: item.difficulty_notes || 'Custom ingested dataset item'
            }));
            onImportCustomDataset(formatted);
            setUploadStatus(`Successfully loaded ${formatted.length} custom customer messages from JSON!`);
          } else {
            setUploadStatus('JSON must be an array of objects.');
          }
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length > 1) {
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
            const textIdx = headers.findIndex(h => h.includes('message') || h.includes('text') || h.includes('description') || h.includes('body'));
            const finalIdx = textIdx !== -1 ? textIdx : 0;

            const items: BenchmarkItem[] = lines.slice(1).map((line, idx) => {
              const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
              return {
                id: `CSV-${idx + 1}`,
                source: 'csv_upload',
                category_type: 'standard',
                raw_message: cols[finalIdx] || line,
                customer_name: `Customer_${idx + 1}`,
                account_tier: 'Pro',
                difficulty_notes: 'Custom CSV row'
              };
            });

            onImportCustomDataset(items);
            setUploadStatus(`Successfully loaded ${items.length} custom customer messages from CSV!`);
          }
        }
      } catch (err) {
        setUploadStatus(`Error parsing file: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
  };

  const filteredBenchmark = BENCHMARK_DATASET.filter(item => {
    if (benchmarkFilter === 'all') return true;
    return item.category_type === benchmarkFilter;
  });

  return (
    <div>
      {/* Sub navigation buttons */}
      <div className="glass-card" style={{ marginBottom: '24px', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={20} color="var(--accent-cyan)" />
              Dataset Sourcing & Benchmark Directory
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Where to get real-world customer support data at scale + explore the 42 benchmark edge cases.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`nav-tab-btn ${activeSection === 'sources' ? 'active' : ''}`}
              onClick={() => setActiveSection('sources')}
            >
              <ExternalLink size={14} /> Public Sourcing Guide (HuggingFace/Kaggle)
            </button>
            <button
              className={`nav-tab-btn ${activeSection === 'benchmark_viewer' ? 'active' : ''}`}
              onClick={() => setActiveSection('benchmark_viewer')}
            >
              <Layers size={14} /> 42 Embedded Edge Cases
            </button>
            <button
              className={`nav-tab-btn ${activeSection === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveSection('upload')}
            >
              <Upload size={14} /> Upload Custom CSV/JSON
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: Public Sourcing Guide */}
      {activeSection === 'sources' && (
        <div className="grid-2col">
          {/* Left list of sources */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Curated Production Datasets
            </h3>
            {DATASET_SOURCES.map(source => {
              const isSelected = selectedSource.id === source.id;
              return (
                <div
                  key={source.id}
                  className="glass-card"
                  onClick={() => setSelectedSource(source)}
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)',
                    borderColor: isSelected ? 'rgba(99, 102, 241, 0.5)' : 'var(--border-subtle)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                      {source.name}
                    </h4>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', color: 'var(--accent-cyan)' }}>
                      {source.platform}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: '1.4' }}>
                    {source.description}
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {source.tags.map((t, idx) => (
                      <span key={idx} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right detail view of selected source */}
          <div>
            <div className="glass-card" style={{ position: 'sticky', top: '90px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    {selectedSource.platform}
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                    {selectedSource.name}
                  </h3>
                </div>
                <a
                  href={selectedSource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  <ExternalLink size={13} /> Visit Dataset
                </a>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dataset Volume</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginTop: '2px' }}>{selectedSource.size}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Format</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginTop: '2px' }}>{selectedSource.format}</div>
                </div>
              </div>

              {/* Pros & Cons */}
              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-emerald)', marginBottom: '6px' }}>
                  ✅ Key Strengths for Triage:
                </h5>
                <ul style={{ paddingLeft: '18px', fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {selectedSource.pros.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <h5 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--p1-text)', marginBottom: '6px' }}>
                  ⚠️ Considerations / Edge Cases Needed:
                </h5>
                <ul style={{ paddingLeft: '18px', fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {selectedSource.cons.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>

              {/* Ingestion Code Snippet */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Code size={13} /> Quick Ingestion Script
                  </span>
                  <button
                    className="btn-secondary"
                    style={{ padding: '3px 8px', fontSize: '11px' }}
                    onClick={() => copyCode(selectedSource.loadingSnippet)}
                  >
                    {copiedSnippet ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    {copiedSnippet ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="json-viewer" style={{ fontSize: '11px', maxHeight: '180px' }}>
                  {selectedSource.loadingSnippet}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: 42 Embedded Benchmark Cases */}
      {activeSection === 'benchmark_viewer' && (
        <div>
          <div className="glass-card" style={{ padding: '14px 18px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Filter by Scenario:</span>
              {[
                { id: 'all', label: 'All 42 Cases' },
                { id: 'adversarial_injection', label: '🛡️ Adversarial Probes' },
                { id: 'critical_p0', label: '🔥 P0 Emergency' },
                { id: 'sarcastic', label: '😏 Sarcastic' },
                { id: 'multi_issue', label: '🔀 Multi-Issue' },
                { id: 'non_english', label: '🌐 Multilingual' },
                { id: 'angry_churn', label: '⚡ Angry/Churn' },
                { id: 'vague', label: '❓ Vague' },
                { id: 'out_of_scope', label: '🚫 Out of Scope' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setBenchmarkFilter(f.id)}
                  style={{
                    background: benchmarkFilter === f.id ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${benchmarkFilter === f.id ? 'rgba(99, 102, 241, 0.5)' : 'transparent'}`,
                    color: benchmarkFilter === f.id ? '#ffffff' : 'var(--text-secondary)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '14px' }}>
            {filteredBenchmark.map(item => (
              <div key={item.id} className="glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-indigo)' }}>
                    {item.id}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="badge-category">
                      {item.category_type}
                    </span>
                    {item.expected_priority_range && (
                      <span className="badge-priority p2" style={{ fontSize: '10px', padding: '1px 6px' }}>
                        Expected: {item.expected_priority_range.join('/')}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: '#fff', fontStyle: 'italic', marginBottom: '10px', background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '6px' }}>
                  "{item.raw_message}"
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  <strong style={{ color: 'var(--accent-cyan)' }}>Challenge: </strong>
                  {item.difficulty_notes}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Custom Upload */}
      {activeSection === 'upload' && (
        <div className="glass-card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '40px 24px' }}>
          <FileSpreadsheet size={48} color="var(--accent-indigo)" style={{ margin: '0 auto 16px auto', display: 'block' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
            Upload Custom Customer Tickets
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
            Ingest custom CSV or JSON files with hundreds of customer messages to run batch frontline triage evaluations on your company's proprietary data.
          </p>

          <label
            htmlFor="dataset-upload-input"
            className="btn-primary"
            style={{ cursor: 'pointer', display: 'inline-flex', padding: '12px 24px' }}
          >
            <Upload size={16} /> Select CSV or JSON File
          </label>
          <input
            id="dataset-upload-input"
            type="file"
            accept=".json,.csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          {uploadStatus && (
            <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '13px' }}>
              {uploadStatus}
            </div>
          )}

          <div style={{ marginTop: '28px', textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <strong>Supported Schema:</strong>
            <ul style={{ paddingLeft: '18px', marginTop: '6px', lineHeight: '1.5' }}>
              <li><strong>JSON:</strong> Array of objects: <code>[&#123; "raw_message": "...", "customer_name": "...", "account_tier": "Enterprise" &#125;]</code></li>
              <li><strong>CSV:</strong> Must include a column named <code>message</code>, <code>text</code>, <code>description</code>, or <code>body</code>.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
