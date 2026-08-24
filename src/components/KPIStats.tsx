import React from 'react';
import {
  Inbox,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Gauge,
  Timer
} from 'lucide-react';
import type { TriageStats } from '../engine/types';

interface KPIStatsProps {
  stats: TriageStats;
}

export const KPIStats: React.FC<KPIStatsProps> = ({ stats }) => {
  const total = stats.totalProcessed;
  const autoRate = total > 0 ? ((stats.automatedCount / total) * 100).toFixed(1) : '0.0';
  const avgConf = (stats.averageConfidence * 100).toFixed(1);

  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-title">
          <span>Total Ingested</span>
          <Inbox size={16} color="var(--accent-indigo)" />
        </div>
        <div className="kpi-value">{total}</div>
        <div className="kpi-subtitle">Customer messages triaged</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title">
          <span>Autonomous Rate</span>
          <CheckCircle2 size={16} color="var(--accent-emerald)" />
        </div>
        <div className="kpi-value" style={{ color: '#34d399' }}>
          {autoRate}%
        </div>
        <div className="kpi-subtitle">
          {stats.automatedCount} routed without human assist
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title">
          <span>P0 Emergencies</span>
          <Flame size={16} color="var(--p0-text)" />
        </div>
        <div className="kpi-value" style={{ color: 'var(--p0-text)' }}>
          {stats.priorityCounts.P0 || 0}
        </div>
        <div className="kpi-subtitle">Immediate PagerDuty triggers</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title">
          <span>Human Review Queue</span>
          <AlertTriangle size={16} color="var(--p1-text)" />
        </div>
        <div className="kpi-value" style={{ color: '#fbbf24' }}>
          {stats.needsHumanCount}
        </div>
        <div className="kpi-subtitle">Adversarial, P0, or low confidence</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title">
          <span>Avg Confidence</span>
          <Gauge size={16} color="var(--accent-cyan)" />
        </div>
        <div className="kpi-value">{avgConf}%</div>
        <div className="kpi-subtitle">Decision certainty score</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title">
          <span>Avg Triage Latency</span>
          <Timer size={16} color="var(--accent-purple)" />
        </div>
        <div className="kpi-value">{stats.averageLatencyMs}ms</div>
        <div className="kpi-subtitle">Real-time frontline speed</div>
      </div>
    </div>
  );
};
