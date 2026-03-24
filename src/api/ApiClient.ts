import {
  Profile,
  Campaign,
  Adgroup,
  Policy,
  ChangeLogEntry,
  RuleNode,
  RuleType,
  ProfileGroup,
  CampaignGroup,
} from './types';
import { createApiRequest } from './client';
import { authClient } from './AuthClient';

const getAuthKeyParam = async () => {
  if (!authClient.isAuthenticated()) {
    return {};
  }
  const token = await authClient.getAccessToken();
  return token ? { authKey: token } : {};
};

type PolicyScopeTarget = { campaignId: number } | { adgroupId: number };

class ApiClient {
  private cachedPolicyMap: Record<string, Policy> | null = null;
  private cachedProfiles: ProfileGroup[] | null = null;
  private cachedCampaigns: Record<string, Record<number, CampaignGroup>> = {
    EU: {},
    US: {},
    FE: {},
  };

  async getActiveSellers(): Promise<string[]> {
    if (!this.cachedProfiles) {
      const [succ, data, err] = await createApiRequest({
        endpoint: '/user/profiles',
        method: 'GET',
        ...(await getAuthKeyParam()),
      });
      if (err || !succ) {
        console.error(err);
        return [];
      }

      this.cachedProfiles = (data as any[]).map((seller) => ({
        id: seller.id,
        name: seller.name,
        profiles: (seller.profiles as any[]).map((p) => ({
          profileId: p.profile_id,
          countryCode: p.country_code,
          region: p.region,
          accountId: p.account_id,
          accountName: p.account_name,
          accountType: p.account_type,
        })),
      }));
    }

    return this.cachedProfiles.map((x) => x.name);
  }

  async getSellerProfiles(): Promise<ProfileGroup[]> {
    await this.getActiveSellers();
    return this.cachedProfiles ?? [];
  }

  async getProfilesForSeller(sellerName: string): Promise<Profile[]> {
    await this.getActiveSellers();
    if (!this.cachedProfiles) {
      console.error('Something went wrong while fetching seller profiles');
      return [];
    }
    const sellerProfiles = this.cachedProfiles.filter((seller) => seller.name == sellerName);
    if (sellerProfiles.length !== 1) {
      console.error('No profile found for seller');
      return [];
    }
    return sellerProfiles[0]!.profiles;
  }

  async getCampaigns(region: string, profileId: number): Promise<Campaign[]> {
    const regionCache = this.cachedCampaigns[region];
    if (regionCache && regionCache[profileId]) {
      return regionCache[profileId].campaigns;
    }

    const [succ, data, err] = await createApiRequest({
      endpoint: `/user/profiles/${region}/${profileId}/campaigns`,
      method: 'GET',
      ...(await getAuthKeyParam()),
    });

    if (err || !succ || !data) {
      console.error(err);
      return [];
    }

    const campaigns: Campaign[] = (data as any[]).map((c) => {
      const campaignPolicyId = (c.policy_id ?? c.policyId ?? null) as string | null;
      const campaignIsPolicyLive = (c.policy_is_live ??
        c.policyIsLive ??
        campaignPolicyId !== null) as boolean;

      return {
        id: c.id,
        name: c.name,
        policyId: campaignPolicyId,
        isPolicyLive: campaignIsPolicyLive,
        marketplace: c.marketplace,
        adgroups: ((c.adgroups as any[]) || []).map((a: any) => {
          const adgroupPolicyId = (a.policy_id ?? a.policyId ?? campaignPolicyId ?? null) as
            | string
            | null;
          return {
            id: a.id,
            name: a.name,
            defaultBid: a.default_bid ?? a.defaultBid,
            currencyCode: a.currency_code ?? a.currencyCode,
            policyId: adgroupPolicyId,
            isPolicyLive: (a.policy_is_live ??
              a.policyIsLive ??
              (adgroupPolicyId !== null ? campaignIsPolicyLive : false)) as boolean,
          };
        }),
      };
    });

    const group: CampaignGroup = {
      profileId,
      region,
      campaigns,
    };

    if (!this.cachedCampaigns[region]) {
      this.cachedCampaigns[region] = {};
    }
    this.cachedCampaigns[region][profileId] = group;

    return group.campaigns;
  }

  getAdgroups(campaignId: number): Adgroup[] {
    for (const region of Object.values(this.cachedCampaigns)) {
      for (const group of Object.values(region)) {
        const campaign = group.campaigns.find((c) => c.id === campaignId);
        if (campaign) return campaign.adgroups;
      }
    }
    console.error('[apiClient] getAdgroups: campaign not found in cache for id:', campaignId);
    return [];
  }

  async getPolicies(): Promise<Policy[]> {
    if (!this.cachedPolicyMap) {
      const [_, data, err] = await createApiRequest({
        method: 'GET',
        endpoint: '/policies',
        ...(await getAuthKeyParam()),
      });
      if (err) {
        return [];
      }
      if (!data) {
        return [];
      }

      const policies = data as Policy[];

      // Reset policy Map
      this.cachedPolicyMap = {};
      policies.forEach((p) => {
        this.cachedPolicyMap![p.id] = p;
      });
    }
    return Object.values(this.cachedPolicyMap);
  }

  async createPolicy(
    name: string,
    type: RuleType,
    marketplace: string,
    rules: RuleNode,
  ): Promise<Policy | null> {
    console.log('[apiClient] createPolicy called with:', { name, type, marketplace, rules });

    const [succ, data, err] = await createApiRequest({
      method: 'POST',
      endpoint: '/policies',
      ...(await getAuthKeyParam()),
      body: {
        name,
        marketplace,
        type,
        rules,
      },
    });

    if (err || !succ || !data) {
      return null;
    }

    // Create policy object from response
    const realPolicy = {
      id: data.id,
      name: data.name,
      marketplace: data.marketplace,
      type: data.type,
      rules: data.rules,
    };

    // Create empty cache (if somehow not already created), and add to cache
    if (!this.cachedPolicyMap) {
      this.cachedPolicyMap = {};
    }
    this.cachedPolicyMap[realPolicy.id] = realPolicy;

    return realPolicy;
  }

  async getPolicyByID(policyID: string): Promise<Policy | null> {
    const policies = await this.getPolicies();
    return policies.find((policy) => policy.id === policyID) || null;
  }

  async updatePolicy(policyId: string, name: string, rules: RuleNode): Promise<Policy | null> {
    console.log('[apiClient] updatePolicy called with:', { policyID: policyId, name, rules });

    const [succ, data, err] = await createApiRequest({
      method: 'PUT',
      endpoint: `/policies/${policyId}`,
      ...(await getAuthKeyParam()),
      body: {
        name,
        rules,
      },
    });

    if (err || !succ || !data) {
      return null;
    }

    // Create updated policy object from response
    const updatedPolicy = {
      id: data.id,
      name: data.name,
      marketplace: data.marketplace,
      type: data.type,
      rules: data.rules,
    };

    // Update in cache if it exists
    if (this.cachedPolicyMap) {
      this.cachedPolicyMap[policyId] = updatedPolicy;
    }

    return updatedPolicy;
  }

  async deletePolicyByID(policyID: string): Promise<boolean> {
    const [succ, _, err] = await createApiRequest({
      method: 'DELETE',
      endpoint: `/policies/${policyID}`,
      ...(await getAuthKeyParam()),
    });
    if (err) {
      return false;
    }
    return succ;
  }

  private buildPolicyScopeBody(target: PolicyScopeTarget): Record<string, string> {
    if ('campaignId' in target) {
      return { campaign_id: target.campaignId.toString() };
    }

    return { adgroup_id: target.adgroupId.toString() };
  }

  private async syncPolicyAssignment(
    target: PolicyScopeTarget,
    profileId: number,
    policyId: string,
    isLive: boolean,
  ): Promise<boolean> {
    const [succ, _, err] = await createApiRequest({
      method: 'PUT',
      endpoint: '/user/attach',
      ...(await getAuthKeyParam()),
      body: {
        ...this.buildPolicyScopeBody(target),
        policy_id: policyId,
        profile_id: profileId,
        is_live: isLive,
      },
    });

    if (err || !succ) {
      console.error('[apiClient] Failed to attach policy', { target, profileId, policyId, isLive });
      return false;
    }

    return true;
  }

  private async removePolicyAssignment(target: PolicyScopeTarget): Promise<boolean> {
    const [succ, _, err] = await createApiRequest({
      method: 'DELETE',
      endpoint: '/user/attach',
      ...(await getAuthKeyParam()),
      body: this.buildPolicyScopeBody(target),
    });

    if (err || !succ) {
      console.error('[apiClient] Failed to detach policy', { target });
      return false;
    }

    return true;
  }

  async attachPolicyToCampaign(
    profileId: number,
    campaign: Pick<Campaign, 'id'>,
    policyId: string,
    isLive: boolean,
  ): Promise<boolean> {
    return this.syncPolicyAssignment({ campaignId: campaign.id }, profileId, policyId, isLive);
  }

  async attachPolicyToAdgroup(
    profileId: number,
    adgroup: Pick<Adgroup, 'id'>,
    policyId: string,
    isLive: boolean,
  ): Promise<boolean> {
    return this.syncPolicyAssignment({ adgroupId: adgroup.id }, profileId, policyId, isLive);
  }

  async detachPolicyFromCampaign(campaign: Pick<Campaign, 'id'>): Promise<boolean> {
    return this.removePolicyAssignment({ campaignId: campaign.id });
  }

  async detachPolicyFromAdgroup(adgroup: Pick<Adgroup, 'id'>): Promise<boolean> {
    return this.removePolicyAssignment({ adgroupId: adgroup.id });
  }

  private getBidsEndpoint(profileId: number, campaignId?: number, adgroupId?: number): string {
    let endpoint = `/user/bids/${profileId}`;

    if (campaignId !== undefined) {
      endpoint += `/${campaignId}`;
    }

    if (campaignId !== undefined && adgroupId !== undefined) {
      endpoint += `/${adgroupId}`;
    }

    return endpoint;
  }

  private async fetchBidChanges(
    profileId: number,
    days: number,
    campaignId?: number,
    adgroupId?: number,
  ): Promise<any[]> {
    const endpoint = this.getBidsEndpoint(profileId, campaignId, adgroupId);
    const [succ, data, err] = await createApiRequest({
      method: 'GET',
      endpoint,
      ...(await getAuthKeyParam()),
      args: {
        days: days.toFixed(2),
      },
    });

    if (err || !succ) {
      alert('Failed to view change logs for profile');
      return [];
    }

    if (!data) {
      alert('Something went wrong');
      return [];
    }

    return data as any[];
  }

  private mapBidChangesToEntries(entries: any[]): ChangeLogEntry[] {
    return entries.map((entry) => ({
      profileId: entry.profile_id as number,
      campaignId: entry.campaign_id as string,
      adgroup: entry.adgroup_id as string,
      policyId: entry.policy_id as string,
      oldPrice: entry.from_bid as number,
      newPrice: entry.to_bid as number,
      timestamp: new Date(entry.timestamp as string),
      policyName: this.cachedPolicyMap?.[entry.policy_id]?.name ?? '???',
    }));
  }

  private async getBidChangeLogs(
    profileId: number,
    days: number,
    campaignId?: number,
    adgroupId?: number,
  ): Promise<ChangeLogEntry[]> {
    const rawEntries = await this.fetchBidChanges(profileId, days, campaignId, adgroupId);
    if (rawEntries.length === 0) {
      return [];
    }

    // Ensure policy map is available for policy names in mapped entries
    await this.getPolicies();

    return this.mapBidChangesToEntries(rawEntries);
  }

  async getProfileChangeLogs(profileId: number, days: number): Promise<ChangeLogEntry[]> {
    return this.getBidChangeLogs(profileId, days);
  }

  async getCampaignChangeLogs(
    profileId: number,
    campaignId: number,
    days: number,
  ): Promise<ChangeLogEntry[]> {
    return this.getBidChangeLogs(profileId, days, campaignId);
  }

  async getAdgroupChangeLogs(
    profileId: number,
    campaignId: number,
    adgroupId: number,
    days: number,
  ): Promise<ChangeLogEntry[]> {
    return this.getBidChangeLogs(profileId, days, campaignId, adgroupId);
  }

  async getRedirectUrl(region: string): Promise<string | null> {
    if (region != 'EU' && region != 'US' && region != 'FE') {
      console.error('Invalid region', region);
      return null;
    }

    const [succ, data, err] = await createApiRequest({
      method: 'GET',
      endpoint: `/lwa/${region}`,
      args: {
        redirect_uri: window.location.origin,
      },
      ...(await getAuthKeyParam()),
    });
    if (err || !succ) {
      return null;
    }
    if (!data) {
      return null;
    }

    const redirectUrl = data.redirectUrl ?? null;
    return redirectUrl;
  }
}

export const apiClient = new ApiClient();
