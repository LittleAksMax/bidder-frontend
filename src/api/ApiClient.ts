import {
  Profile,
  Campaign,
  Adgroup,
  Policy,
  BidResponse,
  UserLogResponse,
  UserLogsPageResponse,
  ProfileGroup,
  CampaignGroup,
  AttachedPolicyDTO,
  ScheduledJob,
} from './types';
import { createApiRequest } from './client';
import { authClient } from './AuthClient';
import { AttachPolicyRequest, DetachPolicyRequest } from './requests';

const getAuthKeyParam = async () => {
  if (!authClient.isAuthenticated()) {
    return {};
  }
  const token = await authClient.getAccessToken();
  return token ? { authKey: token } : {};
};

type PolicyAssignmentInput = {
  profileId: number;
  campaignId: string;
  adgroupId: string;
  policyId: string;
  isLive: boolean;
};

class ApiClient {
  private cachedPolicyMap: Record<string, Policy> | null = null;
  private cachedProfiles: ProfileGroup[] | null = null;
  private cachedCampaigns: Record<string, Record<number, CampaignGroup>> = {
    EU: {},
    US: {},
    FE: {},
  };
  private cachedAuthenticatedRegions: string[] | null = null;

  private clearCampaignCache(): void {
    this.cachedCampaigns = {
      EU: {},
      US: {},
      FE: {},
    };
  }

  private parseAttachedPolicies(data: any[]): AttachedPolicyDTO[] {
    return data
      .map((item) => ({
        campaignId: item.campaign_id as string,
        adgroupId: item.adgroup_id as string,
        policyId: item.policy_id as string,
        isLive: item.is_live ?? false,
      }))
      .filter(
        (item) =>
          item.policyId.length > 0 && (item.campaignId.length > 0 || item.adgroupId.length > 0),
      );
  }

  async getAttachedPolicies(profileId: number): Promise<AttachedPolicyDTO[]> {
    const [succ, data, err] = await createApiRequest({
      endpoint: `/user/attach/${profileId}`,
      method: 'GET',
      ...(await getAuthKeyParam()),
    });

    if (err || !succ || !data) {
      if (err) {
        console.error('[apiClient] Failed to fetch attached policies', err);
      }
      return [];
    }

    return this.parseAttachedPolicies(data as any[]);
  }

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

  async getScheduledJobs(): Promise<ScheduledJob[]> {
    await this.getSellerProfiles();

    const [succ, data, err] = await createApiRequest({
      endpoint: '/user/schedules',
      method: 'GET',
      ...(await getAuthKeyParam()),
    });

    if (err || !succ || !data) {
      if (err) {
        console.error('[apiClient] Failed to fetch scheduled jobs', err);
      }
      return [];
    }

    const activeSellers = await this.getActiveSellers();
    for (const seller of activeSellers) {
      await this.getProfilesForSeller(seller);
    }

    const profilesById = Object.fromEntries(
      this.cachedProfiles!.flatMap(({ profiles }) =>
        profiles.map((p) => [p.profileId, p] as const),
      ),
    ) as Record<number, Profile>;

    return (data as any[]).map((s) => {
      const resolvedProfileId = Number.parseInt(s.profile_id as string);

      return {
        profile: profilesById[resolvedProfileId]!,
        sellerName: s.seller_name as string,
        dueAt: new Date(s.due_at),
        interval: Number.parseInt(s.interval_minutes),
        state: s.state as string,
      };
    });
  }

  async createSchedule(
    profileId: number,
    intervalMinutes: number,
    sellerName: string,
  ): Promise<ScheduledJob | null> {
    await this.getSellerProfiles();

    const [succ, data, err] = await createApiRequest({
      endpoint: '/user/schedules',
      method: 'POST',
      ...(await getAuthKeyParam()),
      body: {
        profile_id: profileId,
        interval_minutes: intervalMinutes,
        seller_name: sellerName,
      },
    });

    if (err || !succ) {
      if (err) {
        console.error('[apiClient] Failed to create schedule', err);
      }
      return null;
    }

    if (!data) {
      console.error('No data returned');
      return null;
    }

    const profilesById = Object.fromEntries(
      this.cachedProfiles!.flatMap(({ profiles }) =>
        profiles.map((profile) => [profile.profileId, profile] as const),
      ),
    ) as Record<number, Profile>;

    const resolvedProfileId = Number.parseInt(data.profile_id as string);
    const resolvedInterval = Number.parseInt(data.interval_minutes as string);
    const dueAtValue = data.due_at as string;

    if (!profilesById[resolvedProfileId]) {
      return null;
    }

    return {
      profile: profilesById[resolvedProfileId],
      sellerName: data.seller_name as string,
      dueAt: new Date(dueAtValue as string),
      interval: resolvedInterval,
      state: data.state as string,
    };
  }

  async deleteSchedule(profileId: number): Promise<boolean> {
    const [succ, _, err] = await createApiRequest({
      endpoint: '/user/schedules',
      method: 'DELETE',
      ...(await getAuthKeyParam()),
      body: {
        profile_id: profileId,
      },
    });

    if (err || !succ) {
      if (err) {
        console.error('[apiClient] Failed to delete schedule', err);
      }
      return false;
    }

    return true;
  }

  async prioritiseSchedule(profileId: number): Promise<Date | null> {
    const [succ, data, err] = await createApiRequest({
      endpoint: `/user/schedules/prioritise/${profileId}`,
      method: 'POST',
      ...(await getAuthKeyParam()),
    });

    if (err || !succ || !data) {
      if (err) {
        console.error('[apiClient] Failed to prioritise schedule', err);
      }
      return null;
    }

    return new Date(data.due_at as string);
  }

  async getCampaigns(region: string, profileId: number): Promise<Campaign[]> {
    const regionCache = this.cachedCampaigns[region];
    if (regionCache && regionCache[profileId]) {
      return regionCache[profileId].campaigns;
    }

    const attachedPoliciesPromise = this.getAttachedPolicies(profileId);
    const [succ, data, err] = await createApiRequest({
      endpoint: `/user/profiles/${region}/${profileId}/campaigns`,
      method: 'GET',
      ...(await getAuthKeyParam()),
    });

    if (err || !succ || !data) {
      console.error(err);
      return [];
    }

    const attachedPolicies = await attachedPoliciesPromise;
    const attachmentByAdgroupId = new Map<string, { policyId: string; isLive: boolean }>();
    const attachmentByCampaignId = new Map<string, { policyId: string; isLive: boolean }>();

    attachedPolicies.forEach((attachment) => {
      if (attachment.adgroupId.length > 0) {
        attachmentByAdgroupId.set(attachment.adgroupId, {
          policyId: attachment.policyId,
          isLive: attachment.isLive,
        });
      } else if (attachment.campaignId.length > 0) {
        attachmentByCampaignId.set(attachment.campaignId, {
          policyId: attachment.policyId,
          isLive: attachment.isLive,
        });
      }
    });

    const campaigns: Campaign[] = (data as any[]).map((c) => {
      const campaignPolicyId = (c.policy_id ?? c.policyId ?? null) as string | null;
      const campaignIsPolicyLive = (c.policy_is_live ??
        c.policyIsLive ??
        campaignPolicyId !== null) as boolean;
      const campaignAttachment = attachmentByCampaignId.get(String(c.id));

      const adgroups: Adgroup[] = ((c.adgroups as any[]) || []).map((a: any) => {
        const adgroupPolicyId = (a.policy_id ?? a.policyId ?? campaignPolicyId ?? null) as
          | string
          | null;
        const adgroupAttachment = attachmentByAdgroupId.get(String(a.id));
        const resolvedPolicyId =
          adgroupAttachment?.policyId ?? campaignAttachment?.policyId ?? adgroupPolicyId;
        const resolvedIsLive =
          adgroupAttachment?.isLive ??
          campaignAttachment?.isLive ??
          ((a.policy_is_live ??
            a.policyIsLive ??
            (resolvedPolicyId !== null ? campaignIsPolicyLive : false)) as boolean);

        return {
          id: a.id as string,
          name: a.name,
          defaultBid: a.default_bid ?? a.defaultBid,
          currencyCode: a.currency_code ?? a.currencyCode,
          policyId: resolvedPolicyId,
          isPolicyLive: resolvedIsLive,
        };
      });

      const nonNullAdgroupPolicyIds = adgroups
        .map((adgroup) => adgroup.policyId)
        .filter((policyId): policyId is string => policyId !== null);
      const uniqueAdgroupPolicyIds = new Set(nonNullAdgroupPolicyIds);
      const derivedCampaignPolicyId =
        uniqueAdgroupPolicyIds.size === 1 ? (nonNullAdgroupPolicyIds[0] ?? null) : null;
      const derivedCampaignIsLive =
        adgroups.length > 0
          ? adgroups.every((adgroup) => adgroup.isPolicyLive)
          : (campaignAttachment?.isLive ?? campaignIsPolicyLive);

      return {
        id: c.id as string,
        name: c.name,
        policyId: campaignAttachment?.policyId ?? derivedCampaignPolicyId ?? campaignPolicyId,
        isPolicyLive: derivedCampaignIsLive,
        marketplace: c.marketplace,
        adgroups,
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

  getAdgroups(campaignId: string): Adgroup[] {
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

  async createPolicy(name: string, marketplace: string, script: string): Promise<Policy | null> {
    const [succ, data, err] = await createApiRequest({
      method: 'POST',
      endpoint: '/policies',
      ...(await getAuthKeyParam()),
      body: {
        name,
        marketplace,
        script,
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
      script: data.script,
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

  async updatePolicy(policyId: string, name: string, script: string): Promise<Policy | null> {
    const [succ, data, err] = await createApiRequest({
      method: 'PUT',
      endpoint: `/policies/${policyId}`,
      ...(await getAuthKeyParam()),
      body: {
        name,
        script,
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
      script: data.script,
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

  private buildAttachPolicyRequest(
    profileId: number,
    campaignId: string,
    adgroupId: string,
    policyId: string,
    isLive: boolean,
  ): AttachPolicyRequest {
    return {
      adgroup_id: adgroupId,
      campaign_id: campaignId,
      policy_id: policyId,
      profile_id: profileId,
      is_live: isLive,
    };
  }

  private buildDetachPolicyRequest(
    profileId: number,
    campaignId: string,
    adgroupId: string,
  ): DetachPolicyRequest {
    return {
      adgroup_id: adgroupId,
      campaign_id: campaignId,
      profile_id: profileId,
    };
  }

  private async syncPolicyAssignments(requests: AttachPolicyRequest[]): Promise<boolean> {
    if (requests.length === 0) {
      return true;
    }

    const [succ, _, err] = await createApiRequest({
      method: 'PUT',
      endpoint: '/user/attach',
      ...(await getAuthKeyParam()),
      body: requests,
    });

    if (err || !succ) {
      console.error('[apiClient] Failed to attach policy batch', { body: requests });
      return false;
    }

    this.clearCampaignCache();
    return true;
  }

  private async removePolicyAssignments(requests: DetachPolicyRequest[]): Promise<boolean> {
    if (requests.length === 0) {
      return true;
    }

    const [succ, _, err] = await createApiRequest({
      method: 'DELETE',
      endpoint: '/user/attach',
      ...(await getAuthKeyParam()),
      body: requests,
    });

    if (err || !succ) {
      console.error('[apiClient] Failed to detach policy batch', { body: requests });
      return false;
    }

    this.clearCampaignCache();
    return true;
  }

  async attachPolicyToCampaign(
    profileId: number,
    campaignId: string,
    adgroupIds: string[],
    policyId: string,
    isLive: boolean,
  ): Promise<boolean> {
    const requests = adgroupIds.map((adgroupId) =>
      this.buildAttachPolicyRequest(profileId, campaignId, adgroupId, policyId, isLive),
    );

    return this.syncPolicyAssignments(requests);
  }

  async attachPoliciesBatch(assignments: PolicyAssignmentInput[]): Promise<boolean> {
    const requests = assignments.map((assignment) =>
      this.buildAttachPolicyRequest(
        assignment.profileId,
        assignment.campaignId,
        assignment.adgroupId,
        assignment.policyId,
        assignment.isLive,
      ),
    );

    return this.syncPolicyAssignments(requests);
  }

  async attachPolicyToAdgroup(
    profileId: number,
    campaignId: string,
    adgroupId: string,
    policyId: string,
    isLive: boolean,
  ): Promise<boolean> {
    return this.syncPolicyAssignments([
      this.buildAttachPolicyRequest(profileId, campaignId, adgroupId, policyId, isLive),
    ]);
  }

  async detachPolicyFromCampaign(
    profileId: number,
    campaignId: string,
    adgroupIds: string[],
  ): Promise<boolean> {
    const requests = adgroupIds.map((adgroupId) =>
      this.buildDetachPolicyRequest(profileId, campaignId, adgroupId),
    );

    return this.removePolicyAssignments(requests);
  }

  async detachPolicyFromAdgroup(
    profileId: number,
    campaignId: string,
    adgroupId: string,
  ): Promise<boolean> {
    return this.removePolicyAssignments([
      this.buildDetachPolicyRequest(profileId, campaignId, adgroupId),
    ]);
  }

  private getBidsEndpoint(profileId: number, campaignId?: string, adgroupId?: string): string {
    let endpoint = `/user/bids/${profileId}`;

    if (campaignId !== undefined) {
      endpoint += `/${campaignId}`;
    }

    if (campaignId !== undefined && adgroupId !== undefined) {
      endpoint += `/${adgroupId}`;
    }

    return endpoint;
  }

  private async fetchBids(
    profileId: number,
    days: number,
    campaignId?: string,
    adgroupId?: string,
  ): Promise<BidResponse[]> {
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

    return (data as any[])
      .map(
        (entry): BidResponse => ({
          adgroupId: entry.adgroup_id as string,
          oldPrice: entry.from_bid as number,
          newPrice: entry.to_bid as number,
          changeDate: new Date(entry.change_date as string),
          isLive: entry.is_live as boolean,
        }),
      )
      .sort((a, b) => a.changeDate.getTime() - b.changeDate.getTime());
  }

  private async getBidChangeLogs(
    profileId: number,
    days: number,
    campaignId?: string,
    adgroupId?: string,
  ): Promise<BidResponse[]> {
    return this.fetchBids(profileId, days, campaignId, adgroupId);
  }

  async getProfileChangeLogs(profileId: number, days: number): Promise<BidResponse[]> {
    return this.getBidChangeLogs(profileId, days);
  }

  async getCampaignChangeLogs(
    profileId: number,
    campaignId: string,
    days: number,
  ): Promise<BidResponse[]> {
    return this.getBidChangeLogs(profileId, days, campaignId);
  }

  async getAdgroupChangeLogs(
    profileId: number,
    campaignId: string,
    adgroupId: string,
    days: number,
  ): Promise<BidResponse[]> {
    return this.getBidChangeLogs(profileId, days, campaignId, adgroupId);
  }

  async getUserLogs(profileId: number, pageNum: number): Promise<UserLogsPageResponse> {
    const [succ, data, err] = await createApiRequest({
      method: 'GET',
      endpoint: `/user/logs/${profileId}`,
      ...(await getAuthKeyParam()),
      args: {
        pageNum: pageNum.toString(),
      },
    });

    if (err || !succ || !data) {
      if (err) {
        console.error('[apiClient] Failed to fetch user logs', err);
      }
      return {
        logs: [],
        totalPages: 0,
      };
    }

    const parsedLogs = ((data.logs as any[]) ?? []).map(
      (entry): UserLogResponse => ({
        log: entry.log as string,
        timestamp: new Date(entry.timestamp as string),
      }),
    );

    return {
      logs: parsedLogs,
      totalPages: data.total_pages as number,
    };
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

  async getAuthenticatedRegions(): Promise<string[]> {
    if (this.cachedAuthenticatedRegions) {
      return this.cachedAuthenticatedRegions;
    }

    const [succ, data, err] = await createApiRequest({
      endpoint: '/user/tokens',
      method: 'GET',
      ...(await getAuthKeyParam()),
    });
    if (!succ || err || !data) {
      console.error('Something went wrong while fetching authenticated regions');
      return [];
    }

    this.cachedAuthenticatedRegions = data as string[];
    return this.cachedAuthenticatedRegions;
  }
}

export const apiClient = new ApiClient();
