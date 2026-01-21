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
  policy?: Policy; // Attach policy to campaign
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
  { label: 'Range Update Rules', value: 'range' },
  // Future rule types can be added here
];

export type RuleType = (typeof RULE_TYPES)[number]['value'];

export type Policy = {
  id: number;
  name: string;
  type: RuleType;
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
