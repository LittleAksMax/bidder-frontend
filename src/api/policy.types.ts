export type AttachedPolicyDTO = {
  campaignId: string;
  adgroupId: string;
  policyId: string;
  isLive: boolean;
};

export type Policy = {
  id: string;
  name: string;
  marketplace: string;
  script: string;
};
