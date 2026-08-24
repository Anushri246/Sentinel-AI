export interface DatasetSourceInfo {
  id: string;
  name: string;
  platform: 'Hugging Face' | 'Kaggle' | 'Academic / Public' | 'Synthetic Generator';
  description: string;
  size: string;
  categories: string[];
  url: string;
  format: string;
  tags: string[];
  pros: string[];
  cons: string[];
  loadingSnippet: string;
}

export const DATASET_SOURCES: DatasetSourceInfo[] = [
  {
    id: 'hf-banking77',
    name: 'Banking77 (Hugging Face)',
    platform: 'Hugging Face',
    description: 'Gold-standard benchmark with 13,082 real customer queries across 77 fine-grained intents in the banking/fintech domain (transfers, card loss, chargebacks, fees, verification).',
    size: '13,082 queries (10,003 train / 3,080 test)',
    categories: ['Fintech', 'Banking', 'Intent Classification', 'Chargebacks'],
    url: 'https://huggingface.co/datasets/PolyAI/banking77',
    format: 'JSON / Parquet / CSV',
    tags: ['Gold Standard', 'High Quality', 'Intent Taxonomy'],
    pros: [
      'Extremely clean, labeled by conversational AI experts at PolyAI',
      '77 specific intents make it ideal for fine-grained routing',
      'Available directly via `datasets.load_dataset("banking77")`'
    ],
    cons: [
      'Focused solely on banking/fintech domain',
      'Lacks adversarial prompt injection edge cases out-of-the-box'
    ],
    loadingSnippet: `from datasets import load_dataset\n\ndataset = load_dataset("PolyAI/banking77")\nprint(dataset['train'][0])\n# {'text': 'I am still waiting on my card?', 'label': 11}`
  },
  {
    id: 'kaggle-twitter-support',
    name: 'Customer Support on Twitter (Kaggle)',
    platform: 'Kaggle',
    description: 'Massive dataset containing over 2.8 million tweets and replies from support handles of 20+ top global brands (AppleSupport, AmazonHelp, Uber_Support, SpotifyCares, Delta, etc.).',
    size: '2,811,774 tweets across 20+ global brands (~700 MB)',
    categories: ['E-Commerce', 'Tech Support', 'Airlines', 'Streaming', 'Real-world Noise'],
    url: 'https://www.kaggle.com/datasets/thoughtvector/customer-support-on-twitter',
    format: 'CSV (twcs.csv)',
    tags: ['Massive Scale', 'Sarcasm & Slang', 'Multi-turn Dialogues'],
    pros: [
      'Captures raw customer emotions, slang, typos, sarcasm, and urgent escalations',
      'Contains real multi-turn conversation threads between customer & tier-1 agent',
      'Includes response timestamps for SLA modeling'
    ],
    cons: [
      'Unstructured: requires cleaning Twitter @mentions and private info',
      'Needs custom labeling for P0-P3 priorities'
    ],
    loadingSnippet: `import pandas as pd\n\ndf = pd.read_csv("twcs.csv")\n# Filter inbound customer queries\ninbound = df[df['inbound'] == True][['author_id', 'text', 'created_at']]\nprint(inbound.head())`
  },
  {
    id: 'hf-tweet-eval',
    name: 'TweetEval: Emotion, Sentiment & Irony (Hugging Face)',
    platform: 'Hugging Face',
    description: 'Unified benchmark suite for 7 NLP classification tasks including Irony/Sarcasm detection, Sentiment, Offensive Language, and Emotion.',
    size: '100,000+ tweets across 7 sub-tasks',
    categories: ['Sentiment Analysis', 'Sarcasm Detection', 'Toxicity & Tone'],
    url: 'https://huggingface.co/datasets/cardiffnlp/tweet_eval',
    format: 'JSON / Parquet',
    tags: ['Sarcasm Benchmark', 'Emotion', 'Safety'],
    pros: [
      'Dedicated `irony` subset specifically tests sarcasm recognition',
      'Essential for calibrating the sarcasm/passive-aggressive guardrail layer',
      'Standardized academic evaluation splits'
    ],
    cons: [
      'Generic social tweets rather than dedicated IT tickets'
    ],
    loadingSnippet: `from datasets import load_dataset\n\nirony_dataset = load_dataset("cardiffnlp/tweet_eval", "irony")\nprint(irony_dataset['test'][0])`
  },
  {
    id: 'kaggle-ecommerce-tickets',
    name: 'Customer Support Ticket Dataset (Kaggle)',
    platform: 'Kaggle',
    description: 'Structured enterprise helpdesk dataset with Ticket Type, Ticket Priority (Critical, High, Medium, Low), Customer Gender/Age, and Resolution Status.',
    size: '8,469 customer tickets with pre-assigned priorities',
    categories: ['IT Helpdesk', 'Enterprise Support', 'SLA Tracking', 'Priority Mapping'],
    url: 'https://www.kaggle.com/datasets/suraj520/customer-support-ticket-dataset',
    format: 'CSV',
    tags: ['Priority Labels', 'Helpdesk Metadata', 'SLA Targets'],
    pros: [
      'Includes pre-labeled `Priority` column (Critical, High, Medium, Low) for direct benchmark comparison',
      'Contains Ticket Channel (Email, Chat, Phone, Social Media)',
      'Ready-to-use tabular schema'
    ],
    cons: [
      'Synthetic-leaning distribution in ticket text descriptions'
    ],
    loadingSnippet: `import pandas as pd\n\ndf = pd.read_csv("customer_support_tickets.csv")\nprint(df[['Ticket Subject', 'Ticket Description', 'Ticket Priority', 'Ticket Type']].head())`
  },
  {
    id: 'hf-polyglot-support',
    name: 'Multilingual Customer Queries (CLINC150 / MASSIVE)',
    platform: 'Hugging Face',
    description: 'Amazon MASSIVE & CLINC-150 datasets offering intent classification across 51+ languages including Spanish, German, Japanese, Hindi, French, and Arabic.',
    size: '1M+ multilingual utterances across 51+ languages',
    categories: ['Multilingual', 'Global Support', 'Language Detection'],
    url: 'https://huggingface.co/datasets/AmazonScience/massive',
    format: 'JSON / Parquet',
    tags: ['51 Languages', 'Intent Routing', 'Global Triage'],
    pros: [
      'Covers 51 global languages and dialects with exact intent matches',
      'Perfect for testing cross-lingual customer routing without translation degradation'
    ],
    cons: [
      'Short utterance formats (voice assistant style)'
    ],
    loadingSnippet: `from datasets import load_dataset\n\nes_dataset = load_dataset("AmazonScience/massive", "es-ES")\nprint(es_dataset['train'][0])`
  },
  {
    id: 'synthetic-llm-pipeline',
    name: 'Domain-Specific Synthetic Generator (LLM Augmentation)',
    platform: 'Synthetic Generator',
    description: 'Self-hosted LLM recipe using seed taxonomies, noise injection (typos, rage caps, emoji spam), prompt injection payloads, and multilingual expansion to generate 10,000+ realistic tickets.',
    size: 'Infinite / On-Demand (Configurable 100 - 50,000 tickets)',
    categories: ['Adversarial Testing', 'Custom Taxonomies', 'Edge Case Stressing'],
    url: 'Built-in Tooling & Custom Script',
    format: 'JSON / JSONL / CSV',
    tags: ['Customizable', 'Adversarial Jailbreaks', 'Noisy Text'],
    pros: [
      'Allows tailored edge-case ratios (e.g. 10% prompt injections, 15% angry/churn, 20% multilingual)',
      'Zero licensing restrictions for enterprise deployments',
      'Simulates brand-specific products, API endpoints, and pricing tiers'
    ],
    cons: [
      'Requires careful prompt curation to avoid repetitive synthetic phrasing'
    ],
    loadingSnippet: `// Example Synthetic Generator Recipe in TypeScript\nconst generateSyntheticBatch = async (count = 100) => {\n  // Generates diverse customer tickets with injected adversarial probes & sarcasm\n};`
  }
];
