export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export type Adgroup = {
  id: string;
  name: string;
  defaultBid: number;
  currencyCode: string;
  policyId: string | null;
  isPolicyLive: boolean;
};

export type CampaignGroup = {
  profileId: number;
  region: string;
  campaigns: Campaign[];
};

export type Campaign = {
  id: string;
  name: string;
  adgroups: Adgroup[];
  policyId: string | null;
  isPolicyLive: boolean;
  marketplace: string; // marketplace code (e.g., 'UK', 'US', etc.)
};

export type ProfileGroup = {
  id: string;
  name: string;
  profiles: Profile[];
};

export type Profile = {
  profileId: number;
  countryCode: string;
  region: string;
  accountId: string;
  accountName: string;
  accountType: string;
};

export type AttachedPolicyDTO = {
  campaignId: string;
  adgroupId: string;
  policyId: string;
  isLive: boolean;
};

export type ChangeLogEntry = {
  profileId: number;
  campaignId: string;
  adgroup: string;
  oldPrice: number;
  newPrice: number;
  timestamp: Date;
  policyName: string;
};

export const RULE_TYPES = [
  { label: 'Nested Policy Rules', value: 'nested' },
  { label: 'Policy Script', value: 'script' },
  { label: 'Decision Tree', value: 'tree' },
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

export type Policy = {
  id: string;
  name: string;
  marketplace: string;
  script: string;
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
