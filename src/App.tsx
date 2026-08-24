import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import type { ActiveTab } from './components/Navbar';
import { KPIStats } from './components/KPIStats';
import { BatchRunnerTab } from './components/BatchRunnerTab';
import { PlaygroundTab } from './components/PlaygroundTab';
import { HumanReviewQueueTab } from './components/HumanReviewQueueTab';
import { DatasetHubTab } from './components/DatasetHubTab';
import { AdversarialLabTab } from './components/AdversarialLabTab';
import { LevelEvaluatorTab } from './components/LevelEvaluatorTab';
import { SettingsModal } from './components/SettingsModal';
import { ItemDetailModal } from './components/ItemDetailModal';

import { BENCHMARK_DATASET } from './data/benchmarkDataset';
import type { BenchmarkItem } from './data/benchmarkDataset';
import { runBatchTriage } from './engine/triageEngine';
import type { TriageResult, EngineConfig, TriageStats, Priority, Sentiment } from './engine/types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('batch');
  const [benchmarkDataset, setBenchmarkDataset] = useState<BenchmarkItem[]>(BENCHMARK_DATASET);
  const [results, setResults] = useState<TriageResult[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);
  const [selectedResult, setSelectedResult] = useState<TriageResult | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [engineConfig, setEngineConfig] = useState<EngineConfig>({
    provider: 'hybrid_local',
    confidenceThreshold: 0.75,
    autoEscalateP0: true,
    strictAdversarialBlock: true,
    simulateLatency: true
  });

  // Calculate live statistics
  const computeStats = (): TriageStats => {
    const priorityCounts: Record<Priority, number> = { P0: 0, P1: 0, P2: 0, P3: 0 };
    const categoryCounts: Record<string, number> = {};
    const sentimentCounts: Record<Sentiment, number> = {
      'Positive': 0,
      'Neutral': 0,
      'Frustrated / Urgent': 0,
      'Sarcastic / Passive-Aggressive': 0,
      'Hostile / Churn Risk': 0,
      'Critical Emergency': 0
    };

    let needsHumanCount = 0;
    let adversarialCount = 0;
    let totalConf = 0;
    let totalLatency = 0;

    results.forEach(r => {
      priorityCounts[r.decision.priority] = (priorityCounts[r.decision.priority] || 0) + 1;
      categoryCounts[r.decision.category] = (categoryCounts[r.decision.category] || 0) + 1;
      sentimentCounts[r.metadata.sentiment] = (sentimentCounts[r.metadata.sentiment] || 0) + 1;

      if (r.decision.needs_human) needsHumanCount++;
      if (r.metadata.adversarial_detected) adversarialCount++;

      totalConf += r.decision.confidence;
      totalLatency += r.metadata.processing_time_ms;
    });

    const total = results.length;
    return {
      totalProcessed: total,
      priorityCounts,
      needsHumanCount,
      automatedCount: total - needsHumanCount,
      adversarialCount,
      averageConfidence: total > 0 ? totalConf / total : 0.92,
      averageLatencyMs: total > 0 ? Math.round(totalLatency / total) : 65,
      categoryCounts,
      sentimentCounts
    };
  };

  const stats = computeStats();

  // Run batch triage
  const handleRunBatch = async () => {
    setIsBatchRunning(true);
    setResults([]);
    try {
      const allResults = await runBatchTriage(
        benchmarkDataset,
        engineConfig,
        (_completed, _total, latest) => {
          setResults(prev => [...prev, latest]);
        }
      );
      setResults(allResults);
    } catch (err) {
      console.error('Batch execution error:', err);
    } finally {
      setIsBatchRunning(false);
    }
  };

  // Auto-run on first load so user immediately sees rich data
  useEffect(() => {
    handleRunBatch();
  }, []);

  const handleUpdateResult = (updated: TriageResult) => {
    setResults(prev => prev.map(r => (r.id === updated.id ? updated : r)));
  };

  const handleImportCustomDataset = (items: BenchmarkItem[]) => {
    setBenchmarkDataset(items);
    setActiveTab('batch');
  };

  // Export results to JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(
      results.map(r => ({
        id: r.id,
        raw_message: r.raw_message,
        customer_name: r.customer_name,
        account_tier: r.account_tier,
        decision: r.decision,
        metadata: r.metadata
      })),
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `triage_decisions_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export results to CSV
  const handleExportCSV = () => {
    const headers = [
      'Ticket ID',
      'Customer',
      'Tier',
      'Priority',
      'Category',
      'Needs Human',
      'Confidence',
      'Summary',
      'Suggested Action',
      'Language',
      'Sentiment',
      'Adversarial Flag'
    ];
    const rows = results.map(r => [
      `"${r.id}"`,
      `"${r.customer_name || 'Anonymous'}"`,
      `"${r.account_tier || 'Standard'}"`,
      `"${r.decision.priority}"`,
      `"${r.decision.category.replace(/"/g, '""')}"`,
      `"${r.decision.needs_human ? 'YES' : 'NO'}"`,
      `"${(r.decision.confidence * 100).toFixed(1)}%"`,
      `"${r.decision.summary.replace(/"/g, '""')}"`,
      `"${r.decision.suggested_action.replace(/"/g, '""')}"`,
      `"${r.metadata.detected_language}"`,
      `"${r.metadata.sentiment}"`,
      `"${r.metadata.adversarial_detected ? 'TRUE' : 'FALSE'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `triage_decisions_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={engineConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
        needsHumanCount={stats.needsHumanCount}
        totalTriaged={stats.totalProcessed}
      />

      {/* KPI Analytics Banner */}
      <KPIStats stats={stats} />

      {/* Main Tab Content */}
      <main>
        {activeTab === 'batch' && (
          <BatchRunnerTab
            benchmarkDataset={benchmarkDataset}
            results={results}
            isRunning={isBatchRunning}
            onRunBatch={handleRunBatch}
            onSelectResult={setSelectedResult}
            onExportJSON={handleExportJSON}
            onExportCSV={handleExportCSV}
          />
        )}

        {activeTab === 'evaluation' && (
          <LevelEvaluatorTab config={engineConfig} />
        )}

        {activeTab === 'playground' && (
          <PlaygroundTab
            config={engineConfig}
            onResultTriaged={res => {
              setResults(prev => [res, ...prev.filter(p => p.id !== res.id)]);
            }}
          />
        )}

        {activeTab === 'human_review' && (
          <HumanReviewQueueTab
            results={results}
            onUpdateResult={handleUpdateResult}
            onSelectResult={setSelectedResult}
          />
        )}

        {activeTab === 'adversarial' && (
          <AdversarialLabTab
            config={engineConfig}
            onSelectResult={setSelectedResult}
          />
        )}

        {activeTab === 'datasets' && (
          <DatasetHubTab onImportCustomDataset={handleImportCustomDataset} />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        config={engineConfig}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveConfig={setEngineConfig}
      />

      {/* Item Deep Inspection Drawer */}
      <ItemDetailModal
        result={selectedResult}
        onClose={() => setSelectedResult(null)}
      />
    </div>
  );
};

export default App;
