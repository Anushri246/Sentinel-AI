import type { TriageResult } from './types';

export interface DispatchSimulation {
  channel: 'PagerDuty' | 'Zendesk' | 'Slack' | 'Jira' | 'CustomWebhook';
  status: 'Dispatched' | 'Queued' | 'Simulated';
  target: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export function simulateWebhookDispatch(result: TriageResult): DispatchSimulation[] {
  const dispatches: DispatchSimulation[] = [];
  const now = new Date().toISOString();

  // 1. P0 PagerDuty dispatch
  if (result.decision.priority === 'P0') {
    dispatches.push({
      channel: 'PagerDuty',
      status: 'Dispatched',
      target: 'PD-SERVICE-CRITICAL-ONCALL',
      payload: {
        event_action: 'trigger',
        routing_key: 'pd-key-prod-outages-sec',
        payload: {
          summary: `[P0 EMERGENCY] ${result.decision.category} - ${result.customer_name || 'Customer'} (${result.account_tier || 'Standard'})`,
          severity: 'critical',
          source: result.source,
          custom_details: {
            ticket_id: result.id,
            triage_summary: result.decision.summary,
            suggested_action: result.decision.suggested_action,
            confidence: result.decision.confidence,
            raw_message_preview: result.raw_message.slice(0, 200)
          }
        }
      },
      timestamp: now
    });
  }

  // 2. Slack Notification
  dispatches.push({
    channel: 'Slack',
    status: 'Dispatched',
    target: result.decision.priority === 'P0' ? '#war-room-critical' : '#support-triage-stream',
    payload: {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🎯 AI Triage: [${result.decision.priority}] ${result.decision.category}`
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Customer:* ${result.customer_name || 'Anonymous'}` },
            { type: 'mrkdwn', text: `*Tier:* ${result.account_tier || 'Unknown'}` },
            { type: 'mrkdwn', text: `*Needs Human:* ${result.decision.needs_human ? '⚠️ YES' : '✅ Automated'}` },
            { type: 'mrkdwn', text: `*Confidence:* ${(result.decision.confidence * 100).toFixed(1)}%` }
          ]
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*Summary:* ${result.decision.summary}\n*Action:* ${result.decision.suggested_action}` }
        }
      ]
    },
    timestamp: now
  });

  // 3. Zendesk Ticket Routing
  dispatches.push({
    channel: 'Zendesk',
    status: 'Queued',
    target: result.decision.needs_human ? 'Human Agent Escalation Queue' : 'Automated Response Macro',
    payload: {
      ticket: {
        external_id: result.id,
        subject: `[${result.decision.priority}] ${result.decision.category}`,
        comment: { body: result.raw_message },
        priority: result.decision.priority.toLowerCase(),
        tags: [
          'ai-triaged',
          result.decision.priority.toLowerCase(),
          result.decision.category.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          ...(result.metadata.risk_tags || [])
        ],
        custom_fields: {
          triage_confidence: result.decision.confidence,
          suggested_action: result.decision.suggested_action,
          detected_language: result.metadata.detected_language
        }
      }
    },
    timestamp: now
  });

  return dispatches;
}
