import {
  Campaign,
  Adgroup,
  Product,
  Policy,
  ChangeLogEntry,
  ChangeLogResult,
  ChangeLogQuery,
} from './types';
import sampleData from './sampleData.json';

class ApiClient {
  private _isAuthenticated = false;

  async getCampaigns(): Promise<Campaign[]> {
    return sampleData.campaigns as Campaign[];
  }

  async getAdgroups(campaignId: number): Promise<Adgroup[]> {
    const campaigns = await this.getCampaigns();
    const campaign = campaigns.find((c) => c.id === campaignId);
    return campaign ? campaign.adgroups : [];
  }

  async getProducts(adgroupId: number): Promise<Product[]> {
    const campaigns = await this.getCampaigns();
    for (const campaign of campaigns) {
      const adgroup = campaign.adgroups.find((a) => a.id === adgroupId);
      if (adgroup) return adgroup.products;
    }
    return [];
  }

  async getPolicies(): Promise<Policy[]> {
    return sampleData.policies as Policy[];
  }

  async createPolicy(policy: { name: string }): Promise<Policy> {
    // This only returns a new policy object, does not persist to JSON
    return { id: Math.floor(Math.random() * 10000), ...policy };
  }

  async getChangeLogs(query: ChangeLogQuery): Promise<ChangeLogResult> {
    const { startTime, endTime, page = 1, pageSize = 5 } = query;
    const all = (sampleData.changeLogs as ChangeLogEntry[]).filter((e) => {
      return e.timestamp >= startTime && e.timestamp <= endTime;
    });
    const total = all.length;
    const startIdx = (page - 1) * pageSize;
    const entries = all.slice(startIdx, startIdx + pageSize);
    return { entries, total };
  }

  setAuthenticated(authenticated: boolean) {
    this._isAuthenticated = authenticated;
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  ensureAuthenticated(): boolean {
    return this.isAuthenticated();
  }
}

export const apiClient = new ApiClient();
