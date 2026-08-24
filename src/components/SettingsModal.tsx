import React, { useState } from 'react';
import {
  Sliders,
  X,
  Key,
  Check
} from 'lucide-react';
import type { EngineConfig } from '../engine/types';

interface SettingsModalProps {
  config: EngineConfig;
  isOpen: boolean;
  onClose: () => void;
  onSaveConfig: (config: EngineConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  isOpen,
  onClose,
  onSaveConfig
}) => {
  const [localConfig, setLocalConfig] = useState<EngineConfig>({ ...config });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig(localConfig);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-indigo)' }}>
              <Sliders size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                Triage Engine Configuration
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Customize model backend, escalation rules, and guardrail sensitivity
              </p>
            </div>
          </div>

          <button className="btn-secondary" style={{ padding: '6px', borderRadius: '8px' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Engine Provider Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
            Inference Provider
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {[
              {
                id: 'hybrid_local',
                name: 'Local Resilient Engine',
                badge: 'Recommended',
                desc: 'Zero-API Key, Instant Heuristic & Semantic NLP'
              },
              {
                id: 'gemini',
                name: 'Google Gemini',
                badge: 'Gemini 1.5 Flash',
                desc: 'Structured JSON via Google Generative AI'
              },
              {
                id: 'openai',
                name: 'OpenAI GPT',
                badge: 'GPT-4o / Mini',
                desc: 'JSON Mode via OpenAI Chat Completions'
              }
            ].map(p => {
              const isSelected = localConfig.provider === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setLocalConfig(prev => ({ ...prev, provider: p.id as any }))}
                  style={{
                    background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isSelected ? 'rgba(99, 102, 241, 0.6)' : 'var(--border-subtle)'}`,
                    borderRadius: '10px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{p.name}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '4px' }}>
                    {p.badge}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                    {p.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* API Key input if LLM selected */}
        {localConfig.provider !== 'hybrid_local' && (
          <div style={{ marginBottom: '20px', background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Key size={14} color="var(--accent-cyan)" />
              {localConfig.provider === 'gemini' ? 'Google Gemini API Key' : 'OpenAI API Key'}
            </label>
            <input
              type="password"
              className="input-text"
              placeholder={localConfig.provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
              value={localConfig.apiKey || ''}
              onChange={e => setLocalConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              style={{ marginBottom: '10px' }}
            />

            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Model Identifier (Optional override)
            </label>
            <input
              type="text"
              className="input-text"
              placeholder={localConfig.provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini'}
              value={localConfig.modelName || ''}
              onChange={e => setLocalConfig(prev => ({ ...prev, modelName: e.target.value }))}
            />
          </div>
        )}

        {/* Confidence Threshold Slider */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Human Escalation Confidence Threshold
            </label>
            <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              {(localConfig.confidenceThreshold * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="0.95"
            step="0.05"
            value={localConfig.confidenceThreshold}
            onChange={e => setLocalConfig(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))}
            style={{ width: '100%', accentColor: 'var(--accent-indigo)' }}
          />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Any triage decision with confidence lower than {(localConfig.confidenceThreshold * 100).toFixed(0)}% will automatically set <code>needs_human = true</code>.
          </div>
        </div>

        {/* Safety Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#fff' }}>
            <input
              type="checkbox"
              checked={localConfig.autoEscalateP0}
              onChange={e => setLocalConfig(prev => ({ ...prev, autoEscalateP0: e.target.checked }))}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent-indigo)' }}
            />
            <span><strong>Enforce P0 Human Escalation Policy:</strong> All P0 critical emergencies strictly require human confirmation.</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#fff' }}>
            <input
              type="checkbox"
              checked={localConfig.strictAdversarialBlock}
              onChange={e => setLocalConfig(prev => ({ ...prev, strictAdversarialBlock: e.target.checked }))}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent-indigo)' }}
            />
            <span><strong>Strict Adversarial Quarantine:</strong> Force prompt injection attempts to human security review.</span>
          </label>
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            {saveSuccess ? <><Check size={14} /> Saved!</> : 'Save Engine Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};
