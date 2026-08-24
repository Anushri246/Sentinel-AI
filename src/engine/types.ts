export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

export type Sentiment =
  | 'Positive'
  | 'Neutral'
  | 'Frustrated / Urgent'
  | 'Sarcastic / Passive-Aggressive'
  | 'Hostile / Churn Risk'
  | 'Critical Emergency';

export interface TriageDecision {
  category: string;
  priority: Priority;
  summary: string;
  suggested_action: string;
  needs_human: boolean;
  confidence: number; // 0.0 to 1.0
}

export interface TriageMetadata {
  detected_language: string;
  sentiment: Sentiment;
  adversarial_detected: boolean;
  adversarial_details?: string;
  multi_issue_detected: boolean;
  detected_issues?: string[];
  risk_tags: string[];
  reasoning: string;
  processing_time_ms: number;
  sla_target: string;
  engine_used: 'hybrid_local' | 'gemini' | 'openai';
}

export interface TriageResult {
  id: string;
  source: string;
  raw_message: string;
  customer_name?: string;
  account_tier?: string;
  category_type?: string;
  decision: TriageDecision;
  metadata: TriageMetadata;
  timestamp: string;
  human_override?: {
    overridden_at: string;
    override_notes?: string;
    original_decision: TriageDecision;
    new_decision: TriageDecision;
  };
}

export interface EngineConfig {
  provider: 'hybrid_local' | 'gemini' | 'openai';
  apiKey?: string;
  modelName?: string;
  confidenceThreshold: number; // default 0.75
  autoEscalateP0: boolean; // default true
  strictAdversarialBlock: boolean; // default true
  simulateLatency: boolean;
}

export interface TriageStats {
  totalProcessed: number;
  priorityCounts: Record<Priority, number>;
  needsHumanCount: number;
  automatedCount: number;
  adversarialCount: number;
  averageConfidence: number;
  averageLatencyMs: number;
  categoryCounts: Record<string, number>;
  sentimentCounts: Record<Sentiment, number>;
}
