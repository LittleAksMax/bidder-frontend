import {
  Profile,
  Campaign,
  Adgroup,
  Policy,
  ChangeLogEntry,
  ChangeLogResult,
  ChangeLogQuery,
  RuleNode,
  RuleType,
  ProfileGroup,
  CampaignGroup,
} from './types';
import sampleData from './sampleData.json';
import { createApiRequest } from './client';
import { authClient } from './AuthClient';

const getAuthKeyParam = async () => {
  if (!authClient.isAuthenticated()) {
    return {};
  }
  const token = await authClient.getAccessToken();
  return token ? { authKey: token } : {};
};

class ApiClient {
  private cachedPolicies: Policy[] | null = null;
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

    const campaigns: Campaign[] = (data as any[]).map((c) => ({
      id: c.id,
      name: c.name,
      policyId: c.policy_id ?? c.policyId ?? null,
      marketplace: c.marketplace,
      adgroups: ((c.adgroups as any[]) || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        defaultBid: a.default_bid ?? a.defaultBid,
        currencyCode: a.currency_code ?? a.currencyCode,
      })),
    }));

    const group: CampaignGroup = {
      profileId,
      region,
      campaigns,
    };

    if (!this.cachedCampaigns[region]) {
      this.cachedCampaigns[region] = {};
    }
    this.cachedCampaigns[region][profileId] = group;

    console.log(group);
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
    console.log('[apiClient] getPolicies called');

    if (!this.cachedPolicies) {
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
      this.cachedPolicies = data as Policy[];
    }
    return this.cachedPolicies;
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

    // Add to cache only after successful creation
    if (this.cachedPolicies) {
      this.cachedPolicies.push(realPolicy);
    }

    return realPolicy;
  }

  async getPolicyByID(policyID: string): Promise<Policy | null> {
    const policies = await this.getPolicies();
    return policies.find((policy) => policy.id === policyID) || null;
  }

  async updatePolicy(policyID: string, name: string, rules: RuleNode): Promise<Policy | null> {
    console.log('[apiClient] updatePolicy called with:', { policyID, name, rules });

    const [succ, data, err] = await createApiRequest({
      method: 'PUT',
      endpoint: `/policies/${policyID}`,
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
    if (this.cachedPolicies) {
      const index = this.cachedPolicies.findIndex((p) => p.id === policyID);
      if (index !== -1) {
        this.cachedPolicies[index] = updatedPolicy;
      }
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

  async getChangeLogs(query: ChangeLogQuery): Promise<ChangeLogResult> {
    console.log('[apiClient] getChangeLogs called with query:', query);
    const { startTime, endTime, page = 1, pageSize = 5 } = query;
    const all = (sampleData.changeLogs as ChangeLogEntry[]).filter((e) => {
      return e.timestamp >= startTime && e.timestamp <= endTime;
    });
    const total = all.length;
    const startIdx = (page - 1) * pageSize;
    const entries = all.slice(startIdx, startIdx + pageSize);
    return { entries, total };
  }

  async getRedirectUrl(region: string): Promise<string | null> {
    console.log('[apiClient] getRedirectUrl called with region:', region);

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
