export interface User {
  id: string;
  username: string;
  email: string;
  updatedAt: Date;
  createdAt: Date;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export type Product = {
  id: number;
  sku: string;
  name: string;
};

export type Adgroup = {
  id: number;
  name: string;
  products: Product[];
};

export type Campaign = {
  id: number;
  name: string;
  adgroups: Adgroup[];
  policyId: number | null;
  marketplace: string; // Marketplace code (e.g., 'UK', 'US', etc.)
};

export type ChangeLogEntry = {
  id: number;
  product_id: number;
  old_price: number;
  new_price: number;
  timestamp: string; // ISO string
  policy?: {
    id: number;
    name: string;
  };
};

export const RULE_TYPES = [
  { label: 'Nested List', value: 'nested' },
  // NOTE: Future rule types can be added here
];

export const VARIABLE_TYPES = [
  { label: 'Impressions', value: 'impressions' },
  { label: 'Clicks', value: 'clicks' },
  { label: 'Click-Thru-Rate', value: 'ctr' },
  { label: 'Spend', value: 'spend' },
  { label: 'Cost-Per-Click', value: 'cpc' },
  { label: 'Orders', value: 'orders' },
  { label: 'Sales', value: 'sales' },
  { label: 'Advertising Cost of Sales', value: 'acos' },
  { label: 'Return on Ad Spend', value: 'roas' },
] as const;

export type RuleType = (typeof RULE_TYPES)[number]['value'];

export type VariableType = (typeof VARIABLE_TYPES)[number]['value'];

export type TerminalRuleNodeOperationType = {
  type: 'add' | 'mul';
  amount: {
    neg: boolean;
    amount: number;
    perc: boolean;
  };
};

export type TerminalRuleNode = {
  type: 'terminal';
  op: TerminalRuleNodeOperationType;
};

export type ConditionRuleNode = {
  type: 'condition';
  variable: VariableType;
  min: number;
  max: number;

  if: TerminalRuleNode | ConditionRuleNode | null; // NOTE: must make sure is not null
  else: TerminalRuleNode | ConditionRuleNode | null; // NOTE: must make sure is not null
};

export type RuleNode = TerminalRuleNode | ConditionRuleNode;

export type Policy = {
  id: number;
  name: string;
  type: RuleType;
  marketplace: Marketplace;
  rule: RuleNode;
};

export type ChangeLogFilter = {
  startTime: string;
  endTime: string;
};

export type Pagination = {
  page?: number;
  pageSize?: number;
};

export type ChangeLogQuery = ChangeLogFilter & Pagination;

export type ChangeLogResult = {
  entries: ChangeLogEntry[];
  total: number;
};

export const MARKETPLACES = ['US', 'UK', 'DE', 'FR', 'IT', 'ES'] as const;
export type Marketplace = (typeof MARKETPLACES)[number];
