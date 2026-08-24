import { BENCHMARK_DATASET } from '../data/benchmarkDataset.js';
import { runBatchTriage } from '../engine/triageEngine.js';

console.log('🚀 Starting Sentriq AI Frontline Customer Support Triage Engine...');
console.log(`📊 Ingesting benchmark dataset (${BENCHMARK_DATASET.length} raw customer messages)...\n`);

const startTime = performance.now();
const results = await runBatchTriage(BENCHMARK_DATASET, {
  provider: 'hybrid_local',
  simulateLatency: false
});

const duration = ((performance.now() - startTime) / 1000).toFixed(2);

console.log('='.repeat(80));
console.log(`✅ TRIAGE COMPLETE: Processed ${results.length} tickets in ${duration}s`);
console.log('='.repeat(80));

let p0Count = 0;
let p1Count = 0;
let p2Count = 0;
let p3Count = 0;
let needsHumanCount = 0;
let adversarialCount = 0;

results.forEach((r, idx) => {
  if (r.decision.priority === 'P0') p0Count++;
  if (r.decision.priority === 'P1') p1Count++;
  if (r.decision.priority === 'P2') p2Count++;
  if (r.decision.priority === 'P3') p3Count++;
  if (r.decision.needs_human) needsHumanCount++;
  if (r.metadata.adversarial_detected) adversarialCount++;

  console.log(`\n[#${idx + 1}] [${r.decision.priority}] [${r.decision.needs_human ? 'NEEDS HUMAN' : 'AUTOMATED'}] ${r.decision.category}`);
  console.log(`   Customer: ${r.customer_name || 'Anonymous'} (${r.account_tier || 'Standard'})`);
  console.log(`   Raw: "${r.raw_message.length > 90 ? r.raw_message.slice(0, 88) + '...' : r.raw_message}"`);
  console.log(`   Summary: ${r.decision.summary}`);
  console.log(`   Action: ${r.decision.suggested_action}`);
  console.log(`   Confidence: ${(r.decision.confidence * 100).toFixed(1)}% | Lang: ${r.metadata.detected_language} | Sentiment: ${r.metadata.sentiment}`);
});

console.log('\n' + '='.repeat(80));
console.log('📈 EXECUTIVE METRICS:');
console.log(`   • Total Tickets Triaged:   ${results.length}`);
console.log(`   • Automated (Autonomous):  ${results.length - needsHumanCount} (${(((results.length - needsHumanCount) / results.length) * 100).toFixed(1)}%)`);
console.log(`   • Human Review Queue:      ${needsHumanCount} (${((needsHumanCount / results.length) * 100).toFixed(1)}%)`);
console.log(`   • P0 Critical Emergencies: ${p0Count}`);
console.log(`   • P1 High Severity:        ${p1Count}`);
console.log(`   • P2 Moderate Issues:      ${p2Count}`);
console.log(`   • P3 Routine / Out-of-Scope: ${p3Count}`);
console.log(`   • Adversarial Probes Defended: ${adversarialCount}`);
console.log('='.repeat(80));
