import React from 'react';
import {
  Brain,
  Sliders,
  Sparkles,
  ShieldAlert,
  Database,
  UserCheck,
  Layers,
  Award
} from 'lucide-react';
import type { EngineConfig } from '../engine/types';

export type ActiveTab = 'batch' | 'playground' | 'human_review' | 'adversarial' | 'datasets' | 'evaluation';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  config: EngineConfig;
  onOpenSettings: () => void;
  needsHumanCount: number;
  totalTriaged?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  config,
  onOpenSettings,
  needsHumanCount
}) => {
  return (
    <header className="header-glass">
      <div className="header-content">
        <div className="logo-group">
          <div className="logo-icon-box">
            <Brain size={24} />
          </div>
          <div>
            <div className="logo-title">
              Sentinel AI
              <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#a5b4fc' }}>
                TRIAGE ENGINE
              </span>
            </div>
            <div className="logo-subtitle">Unsupervised Front-Line Decision Pipeline & Dispatcher</div>
          </div>
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'batch' ? 'active' : ''}`}
            onClick={() => setActiveTab('batch')}
          >
            <Layers size={16} />
            Benchmark Suite
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'evaluation' ? 'active' : ''}`}
            onClick={() => setActiveTab('evaluation')}
          >
            <Award size={16} />
            Level 1-3 Eval
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'playground' ? 'active' : ''}`}
            onClick={() => setActiveTab('playground')}
          >
            <Sparkles size={16} />
            Live Playground
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'human_review' ? 'active' : ''}`}
            onClick={() => setActiveTab('human_review')}
          >
            <UserCheck size={16} />
            Human Review
            {needsHumanCount > 0 && (
              <span style={{
                background: '#f59e0b',
                color: '#000',
                fontSize: '10px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '10px'
              }}>
                {needsHumanCount}
              </span>
            )}
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'adversarial' ? 'active' : ''}`}
            onClick={() => setActiveTab('adversarial')}
          >
            <ShieldAlert size={16} />
            Adversarial Lab
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'datasets' ? 'active' : ''}`}
            onClick={() => setActiveTab('datasets')}
          >
            <Database size={16} />
            Datasets & Sourcing
          </button>
        </nav>

        <div className="header-actions">
          <div
            className={`engine-badge ${config.provider}`}
            title={`Active Engine: ${config.provider}`}
          >
            <span className="pulse-dot" />
            <span>
              {config.provider === 'hybrid_local'
                ? 'Local Resilient Engine'
                : config.provider === 'gemini'
                ? 'Gemini 1.5 Flash'
                : 'OpenAI GPT-4o'}
            </span>
          </div>

          <button
            className="btn-secondary"
            onClick={onOpenSettings}
            style={{ padding: '8px 12px' }}
            title="Configure Engine Settings"
          >
            <Sliders size={16} />
            Settings
          </button>
        </div>
      </div>
    </header>
  );
};
