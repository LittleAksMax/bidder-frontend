export const RULE_TYPES = [
  { label: 'Nested Policy Rules', value: 'nested' },
  { label: 'Policy Script', value: 'script' },
] as const;

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
  if: TerminalRuleNode | ConditionRuleNode | null;
  else: TerminalRuleNode | ConditionRuleNode | null;
};

export type RuleNode = TerminalRuleNode | ConditionRuleNode;
