export type MetricType = 'integer' | 'decimal';

export type Operator = '+' | '-' | '=';

export type Metric =
  | 'impressions'
  | 'clicks'
  | 'orders'
  | 'roas'
  | 'acos'
  | 'cpc'
  | 'ctr'
  | 'sales'
  | 'spend';

export type TerminalNode = {
  operator: Operator;
  amount: number;
  percentage: boolean;
};

export type Node = {
  terminal?: TerminalNode | null;
  condition?: ConditionNode | null;
};

export type BranchNode = {
  lower?: number | null;
  upper?: number | null;
  node: Node;
};

export type ConditionNode = {
  metric: Metric;
  type: MetricType;
  branches: BranchNode[];
  default?: Node | null;
};

export type ConvertScriptToTreeRequest = {
  script: string;
};

export type ConvertTreeToScriptRequest = {
  program: Node;
};
