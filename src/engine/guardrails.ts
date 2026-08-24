import type { Sentiment } from './types';

export interface GuardrailAnalysis {
  is_adversarial: boolean;
  adversarial_reasons: string[];
  detected_language: string;
  is_sarcastic: boolean;
  is_critical_p0: boolean;
  is_multi_issue: boolean;
  detected_issues: string[];
  sentiment: Sentiment;
  risk_tags: string[];
}

// Adversarial prompt injection keywords and patterns
const INJECTION_PATTERNS = [
  /system\s*override/i,
  /disregard\s*(all\s*)?(prior|previous)\s*(instructions|rules)/i,
  /ignore\s*(all\s*)?(prior|previous|above)\s*(instructions|rules|text)/i,
  /output\s*(only\s*)?priority\s*p0/i,
  /output\s*(only\s*)?the\s*json\s*block/i,
  /grant\s*(unrestricted\s*)?admin/i,
  /bearer\s*token/i,
  /root\s*(database\s*)?password/i,
  /pretend\s*you\s*are\s*(an\s*)?(unrestricted|developer|admin)/i,
  /jailbreak/i,
  /<\/?(?:customer_message|system_directive|admin_command|instruction|system)>/i,
  /set\s*needs_human\s*=\s*false/i,
  /without\s*review/i,
  /DAN\s*mode/i
];

// Sarcasm triggers
const SARCASM_PATTERNS = [
  /\b(?:10\/10|10\s*out\s*of\s*10)\s*update\b/i,
  /\btruly\s*(?:groundbreaking|innovative|a\s*masterpiece)\b/i,
  /\binnovative\s*business\s*model\b/i,
  /\bi\s*love\s*how\s*your\s*app\s*(?:logs\s*me\s*out|crashes|breaks)\b/i,
  /\breally\s*helps\s*with\s*my\b/i,
  /\blightning[- ]fast\s*dashboard\s*only\s*took\b/i,
  /\bincredible\s*speed\s*optimization\b/i,
  /\bbrilliant\s*feature\s*removing\b/i,
  /\bmy\s*boss\s*is\s*thrilled\s*that\b/i,
  /\bthanks\s*for\s*charging\s*(?:me|us)\s*(?:two|three|multiple)\s*times\b/i,
  /\bkeep\s*up\s*the\s*great\s*work\b/i
];

// P0 Emergency indicators
const P0_PATTERNS = [
  /\b(?:security\s*vulnerability|security\s*disclosure|idor|zero[- ]day|pii\s*leak|auth\s*bypass)\b/i,
  /\b(?:production\s*(?:cluster\s*)?(?:is\s*)?completely\s*down|outage\s*across\s*all|checkout\s*(?:pipeline\s*)?(?:is\s*)?down)\b/i,
  /\b(?:infinite\s*(?:retry\s*)?loop|charged\s*(?:our\s*corporate\s*card\s*)?\d+\s*times|runaway\s*billing)\b/i,
  /\b(?:hacker\s*has\s*taken\s*over|account\s*takeover|deleting\s*production\s*databases|lock\s*our\s*account\s*right\s*now)\b/i,
  /\b(?:corrupted\s*our\s*(?:customer\s*)?database\s*backups|legal\s*counsel|breach\s*of\s*contract\s*and\s*downtime)\b/i
];

// Angry & Churn indicators
const CHURN_PATTERNS = [
  /\b(?:cancelling\s*our|cancel\s*our\s*(\d+[- ]seat\s*)?enterprise|contract\s*termination)\b/i,
  /\b(?:posting\s*(?:our\s*experience\s*|this\s*recording\s*)?on\s*(?:linkedin|twitter|reddit|social\s*media))\b/i,
  /\b(?:reporting\s*this\s*as\s*fraud|dispute\s*with\s*(?:visa|mastercard|bank)|chargeback)\b/i,
  /\b(?:scammers|stealing\s*money|stolen|fraudulent)\b/i,
  /\b(?:lost\s*a\s*\$\d+[\d,]*\s*client)\b/i,
  /\b(?:on\s*hold\s*for\s*\d+\s*hours)\b/i
];

export function analyzeGuardrails(rawMessage: string): GuardrailAnalysis {
  const text = rawMessage.trim();

  // 1. Check for prompt injection / adversarial manipulation
  const adversarialReasons: string[] = [];
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      adversarialReasons.push(`Matched adversarial rule: ${pattern.toString()}`);
    }
  }

  // Check for fake JSON block intended to poison output
  if (/```json\s*\{[\s\S]*"priority"\s*:[\s\S]*\}\s*```/i.test(text)) {
    adversarialReasons.push('Contains injected JSON schema payload');
  }

  const isAdversarial = adversarialReasons.length > 0;

  // 2. Language Detection
  let detectedLanguage = 'English';
  if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text)) {
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
      detectedLanguage = 'Japanese';
    } else {
      detectedLanguage = 'Mandarin Chinese';
    }
  } else if (/[\u0600-\u06FF]/.test(text)) {
    detectedLanguage = 'Arabic';
  } else if (/\b(?:hola|equipo|acceder|panel|administraci[oó]n|desde|mañana|ventas)\b/i.test(text)) {
    detectedLanguage = 'Spanish';
  } else if (/\b(?:guten\s*tag|unsere|monatliche|rechnung|umsatzsteuer|bitte|korrigieren|buchhaltung)\b/i.test(text)) {
    detectedLanguage = 'German';
  } else if (/\b(?:bonjour|nous\s*souhaitons|mettre\s*[aà]\s*niveau|abonnement|forfait|virement\s*bancaire)\b/i.test(text)) {
    detectedLanguage = 'French';
  } else if (/\b(?:bhai|payment\s*kat\s*gaya|nahi\s*hua|jaldi\s*check\s*karo|urgent\s*hai)\b/i.test(text)) {
    detectedLanguage = 'Hinglish (Hindi/English)';
  }

  // 3. Sarcasm Detection
  let isSarcastic = false;
  for (const pattern of SARCASM_PATTERNS) {
    if (pattern.test(text)) {
      isSarcastic = true;
      break;
    }
  }

  // 4. Critical P0 Emergency Detection
  let isCriticalP0 = false;
  for (const pattern of P0_PATTERNS) {
    if (pattern.test(text)) {
      isCriticalP0 = true;
      break;
    }
  }

  // 5. Angry / Churn / Legal Risk Detection
  let isAngryChurn = false;
  for (const pattern of CHURN_PATTERNS) {
    if (pattern.test(text)) {
      isAngryChurn = true;
      break;
    }
  }

  // 6. Multi-Issue Segmenter
  const detectedIssues: string[] = [];
  if (/(?:1\)|1\.|firstly|issue\s*1)[\s\S]*(?:2\)|2\.|secondly|issue\s*2)/i.test(text)) {
    // Extract numbered parts
    const parts = text.split(/(?:\d+\)|\d+\.)\s*/).filter(p => p.trim().length > 5);
    if (parts.length >= 2) {
      detectedIssues.push(...parts.map(p => p.trim().slice(0, 100)));
    }
  } else {
    // Check for distinct problem conjunctions
    const conjunctions = text.match(/(?:also|plus|and\s*can\s*you\s*also|another\s*thing)\b/gi);
    if (conjunctions && conjunctions.length >= 2 && text.length > 80) {
      detectedIssues.push('Multiple distinct requests detected in message body');
    }
  }
  const isMultiIssue = detectedIssues.length >= 2 || (isAdversarial ? false : text.includes('3 things:') || text.includes('2 things:'));

  // 7. Determine overall Sentiment & Risk Tags
  let sentiment: Sentiment = 'Neutral';
  const riskTags: string[] = [];

  if (isAdversarial) {
    riskTags.push('PROMPT_INJECTION', 'SECURITY_RISK');
    sentiment = 'Hostile / Churn Risk';
  }

  if (isCriticalP0) {
    riskTags.push('P0_CRITICAL', 'OUTAGE_OR_EXPLOIT');
    sentiment = 'Critical Emergency';
  } else if (isAngryChurn) {
    riskTags.push('CHURN_RISK', 'ESCALATED_CUSTOMER');
    sentiment = 'Hostile / Churn Risk';
  } else if (isSarcastic) {
    riskTags.push('SARCASTIC_TONE', 'MASKED_SEVERITY');
    sentiment = 'Sarcastic / Passive-Aggressive';
  } else if (/\b(?:urgent|asap|immediately|cannot\s*work|blocked|emergency)\b/i.test(text)) {
    sentiment = 'Frustrated / Urgent';
    riskTags.push('HIGH_URGENCY');
  } else if (/\b(?:thanks|thank\s*you|please|appreciate|great)\b/i.test(text) && !isSarcastic) {
    sentiment = 'Positive';
  }

  if (isMultiIssue) {
    riskTags.push('MULTI_ISSUE');
  }

  if (detectedLanguage !== 'English') {
    riskTags.push(`MULTILINGUAL_${detectedLanguage.toUpperCase().replace(/\s+/g, '_')}`);
  }

  return {
    is_adversarial: isAdversarial,
    adversarial_reasons: adversarialReasons,
    detected_language: detectedLanguage,
    is_sarcastic: isSarcastic,
    is_critical_p0: isCriticalP0,
    is_multi_issue: isMultiIssue,
    detected_issues: detectedIssues,
    sentiment: sentiment,
    risk_tags: riskTags
  };
}
