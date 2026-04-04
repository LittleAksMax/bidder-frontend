export type Adgroup = {
  id: string;
  name: string;
  defaultBid: number;
  currencyCode: string;
  policyId: string | null;
  isPolicyLive: boolean;
};

export type Campaign = {
  id: string;
  name: string;
  adgroups: Adgroup[];
  policyId: string | null;
  isPolicyLive: boolean;
  marketplace: string; // marketplace code (e.g., 'UK', 'US', etc.)
};

export type CampaignGroup = {
  profileId: number;
  region: string;
  campaigns: Campaign[];
};

export type CampaignCache = Record<string, Record<number, CampaignGroup>>;
