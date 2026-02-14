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

class ApiClient {
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

  async getPolicies(): Promise<Policy[]> {
    console.log('[apiClient] getPolicies called');
    return sampleData.policies as Policy[];
  }

  async createPolicy(
    name: string,
    type: RuleType,
    marketplace: Marketplace,
    rule: RuleNode,
  ): Promise<Policy> {
    console.log('[apiClient] createPolicy called with:', { name, type, marketplace, rule });
    // This only returns a new policy object, does not persist to JSON
    return {
      id: Math.floor(Math.random() * 10000),
      name,
      type,
      marketplace,
      rule,
    };
  }

  async getPolicyByID(policyID: number): Promise<Policy | null> {
    const policies = await this.getPolicies();
    return policies.find((policy) => policy.id === policyID) || null;
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
