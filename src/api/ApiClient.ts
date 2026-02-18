import {
  Campaign,
  Adgroup,
  Product,
  Policy,
  ChangeLogEntry,
  ChangeLogResult,
  ChangeLogQuery,
  RuleNode,
  Marketplace,
  RuleType,
} from './types';
import sampleData from './sampleData.json';
import { createApiRequest } from './client';
import { authClient } from './AuthClient';

const getAuthKeyParam = () =>
  authClient.isAuthenticated() && authClient.getAccessToken()
    ? { authKey: authClient.getAccessToken()! }
    : {};

class ApiClient {
  private cachedPolicies: Policy[] | null = null;

  async getActiveMarketplaces(): Promise<string[]> {
    // Hardcoded for now
    return ['UK', 'US', 'DE', 'ES', 'IT'];
  }

  async getCampaigns(): Promise<Campaign[]> {
    console.log('[apiClient] getCampaigns called');
    return sampleData.campaigns as Campaign[];
  }

  async getAdgroups(campaignId: number): Promise<Adgroup[]> {
    console.log('[apiClient] getAdgroups called with campaignId:', campaignId);
    const campaigns = await this.getCampaigns();
    const campaign = campaigns.find((c) => c.id === campaignId);
    return campaign ? campaign.adgroups : [];
  }

  async getProducts(adgroupId: number): Promise<Product[]> {
    console.log('[apiClient] getProducts called with adgroupId:', adgroupId);
    const campaigns = await this.getCampaigns();
    for (const campaign of campaigns) {
      const adgroup = campaign.adgroups.find((a) => a.id === adgroupId);
      if (adgroup) return adgroup.products;
    }
    return [];
  }

  async getPolicies(marketplace?: Marketplace): Promise<Policy[]> {
    console.log('[apiClient] getPolicies called');

    if (!this.cachedPolicies) {
      const [_, data, err] = await createApiRequest({
        method: 'GET',
        endpoint: '/policies',
        ...getAuthKeyParam(),
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
    marketplace: Marketplace,
    rules: RuleNode,
  ): Promise<Policy> {
    console.log('[apiClient] createPolicy called with:', { name, type, marketplace, rules });
    // This only returns a new policy object, does not persist to JSON
    return {
      id: Math.floor(Math.random() * 10000).toString(16),
      name,
      type,
      marketplace,
      rules,
    };
  }

  async getPolicyByID(policyID: string): Promise<Policy | null> {
    const policies = await this.getPolicies();
    return policies.find((policy) => policy.id === policyID) || null;
  }

  async deletePolicyByID(policyID: string): Promise<boolean> {
    const [succ, _, err] = await createApiRequest({
      method: 'DELETE',
      endpoint: `/policies/${policyID}`,
      ...getAuthKeyParam(),
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
}

export const apiClient = new ApiClient();
