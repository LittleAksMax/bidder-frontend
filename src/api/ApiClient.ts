import { Adgroup, Campaign, CampaignCache, CampaignGroup } from './campaign.types';
import { BidResponse, UserLogsPageResponse } from './logs.types';
import { AttachedPolicyDTO, Policy } from './policy.types';
import { Profile, ProfileGroup } from './profile.types';
import { ScheduledJob } from './schedule.types';
import {
  ConvertScriptToTreeRequest,
  ConvertTreeToScriptRequest,
  Metric,
  MetricType,
  Node as ConvertNode,
  Operator,
} from './convert.types';
import { createApiRequest } from './client';
import { authClient } from './AuthClient';
import {
  AttachPolicyRequest,
  ConvertResponse,
  DetachPolicyRequest,
  PolicyAssignmentInput,
} from './contracts';
import {
  buildPolicyMap,
  buildProfilesById,
  createEmptyCampaignCache,
  mapBidResponse,
  mapPolicy,
  mapProfileGroup,
  mapScheduledJob,
  mapUserLogResponse,
  parseAttachedPolicies,
} from './util';

const getAuthKeyParam = async () => {
  if (!authClient.isAuthenticated()) {
    return {};
  }
  const token = await authClient.getAccessToken();
  return token ? { authKey: token } : {};
};

const VALID_CONVERT_OPERATORS = new Set<Operator>(['+', '-', '=']);

const parseConvertOperator = (value: unknown): Operator | null => {
  if (typeof value === 'string') {
    return VALID_CONVERT_OPERATORS.has(value as Operator) ? (value as Operator) : null;
  }

  if (typeof value === 'number' && Number.isInteger(value)) {
    const operator = String.fromCharCode(value) as Operator;
    return VALID_CONVERT_OPERATORS.has(operator) ? operator : null;
  }

  return null;
};

const normaliseConvertNodeOperators = (node: unknown): ConvertNode | null => {
  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    return null;
  }

  const candidate = node as Record<string, unknown>;
  const nextNode: ConvertNode = {};

  if (
    candidate.terminal &&
    typeof candidate.terminal === 'object' &&
    !Array.isArray(candidate.terminal)
  ) {
    const terminal = candidate.terminal as Record<string, unknown>;
    const operator = parseConvertOperator(terminal.operator);

    if (
      !operator ||
      typeof terminal.amount !== 'number' ||
      typeof terminal.percentage !== 'boolean'
    ) {
      return null;
    }

    nextNode.terminal = {
      operator,
      amount: terminal.amount,
      percentage: terminal.percentage,
    };
  }

  if (
    candidate.condition &&
    typeof candidate.condition === 'object' &&
    !Array.isArray(candidate.condition)
  ) {
    const condition = candidate.condition as Record<string, unknown>;

    if (
      typeof condition.metric !== 'string' ||
      typeof condition.type !== 'string' ||
      !Array.isArray(condition.branches)
    ) {
      return null;
    }

    const normalisedBranches = condition.branches.map((branch) => {
      if (!branch || typeof branch !== 'object' || Array.isArray(branch)) {
        return null;
      }

      const branchRecord = branch as Record<string, unknown>;
      const normalisedNode = normaliseConvertNodeOperators(branchRecord.node);

      if (!normalisedNode) {
        return null;
      }

      return {
        lower:
          typeof branchRecord.lower === 'number' || branchRecord.lower === null
            ? (branchRecord.lower as number | null)
            : null,
        upper:
          typeof branchRecord.upper === 'number' || branchRecord.upper === null
            ? (branchRecord.upper as number | null)
            : null,
        node: normalisedNode,
      };
    });

    if (normalisedBranches.some((branch) => branch === null)) {
      return null;
    }

    const resolvedBranches = normalisedBranches.filter(
      (branch): branch is NonNullable<(typeof normalisedBranches)[number]> => branch !== null,
    );

    const defaultNode =
      condition.default === null || condition.default === undefined
        ? null
        : normaliseConvertNodeOperators(condition.default);

    if (condition.default !== null && condition.default !== undefined && !defaultNode) {
      return null;
    }

    nextNode.condition = {
      metric: condition.metric as Metric,
      type: condition.type as MetricType,
      branches: resolvedBranches,
      default: defaultNode,
    };
  }

  return nextNode;
};

const serialiseConvertNodeOperators = (node: ConvertNode): Record<string, unknown> => {
  const nextNode: Record<string, unknown> = {};

  if (node.terminal) {
    const operator = parseConvertOperator(node.terminal.operator);

    if (!operator) {
      throw new Error('Invalid operator provided for conversion.');
    }

    nextNode.terminal = {
      operator: operator.charCodeAt(0),
      amount: node.terminal.amount,
      percentage: node.terminal.percentage,
    };
  }

  if (node.condition) {
    nextNode.condition = {
      metric: node.condition.metric,
      type: node.condition.type,
      branches: node.condition.branches.map((branch) => ({
        lower: branch.lower ?? null,
        upper: branch.upper ?? null,
        node: serialiseConvertNodeOperators(branch.node),
      })),
      default: node.condition.default
        ? serialiseConvertNodeOperators(node.condition.default)
        : null,
    };
  }

  return nextNode;
};

class ApiClient {
  private cachedPolicyMap: Record<string, Policy> | null = null;
  private cachedProfiles: ProfileGroup[] | null = null;
  private cachedCampaigns: CampaignCache = createEmptyCampaignCache();
  private cachedAuthenticatedRegions: string[] | null = null;

  private clearPolicyCache(): void {
    this.cachedPolicyMap = null;
  }

  private clearCampaignCache(): void {
    this.cachedCampaigns = createEmptyCampaignCache();
  }

  private getCachedProfilesById(): Record<number, Profile> {
    return buildProfilesById(this.cachedProfiles);
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

    return parseAttachedPolicies(data as any[]);
  }

  async getActiveSellers(): Promise<string[]> {
    if (!this.cachedProfiles) {
      const [succ, data, err] = await createApiRequest({
        endpoint: '/user/profiles',
        method: 'GET',
        ...(await getAuthKeyParam()),
      });
      if (err || !succ || !data) {
        console.error(err);
        return [];
      }

      this.cachedProfiles = (data as any[]).map(mapProfileGroup);
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

    const sellerProfileGroup = this.cachedProfiles.find((seller) => seller.name === sellerName);

    if (!sellerProfileGroup) {
      console.error('No profile found for seller');
      return [];
    }

    return sellerProfileGroup.profiles;
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

    const profilesById = this.getCachedProfilesById();

    return (data as any[])
      .map((schedule) => mapScheduledJob(schedule, profilesById))
      .filter((schedule): schedule is ScheduledJob => schedule !== null);
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

    const profilesById = this.getCachedProfilesById();

    return mapScheduledJob(data, profilesById);
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

    const campaigns: Campaign[] = (data as any[]).map((campaign) => {
      const campaignId = String(campaign.id);
      const campaignPolicyId: string | null = campaign.policy_id ?? campaign.policyId ?? null;
      const campaignIsPolicyLive: boolean =
        campaign.policy_is_live ?? campaign.policyIsLive ?? campaignPolicyId !== null;
      const campaignAttachment = attachmentByCampaignId.get(campaignId);
      const rawAdgroups = Array.isArray(campaign.adgroups) ? campaign.adgroups : [];

      const adgroups: Adgroup[] = rawAdgroups.map((adgroup: any) => {
        const adgroupId = String(adgroup.id);
        const adgroupPolicyId: string | null =
          adgroup.policy_id ?? adgroup.policyId ?? campaignPolicyId ?? null;
        const adgroupAttachment = attachmentByAdgroupId.get(adgroupId);
        const resolvedPolicyId =
          adgroupAttachment?.policyId ?? campaignAttachment?.policyId ?? adgroupPolicyId;
        const resolvedIsLive: boolean =
          adgroupAttachment?.isLive ??
          campaignAttachment?.isLive ??
          adgroup.policy_is_live ??
          adgroup.policyIsLive ??
          (resolvedPolicyId !== null ? campaignIsPolicyLive : false);

        return {
          id: adgroupId,
          name: adgroup.name as string,
          defaultBid: (adgroup.default_bid ?? adgroup.defaultBid) as number,
          currencyCode: (adgroup.currency_code ?? adgroup.currencyCode) as string,
          policyId: resolvedPolicyId,
          isPolicyLive: resolvedIsLive,
        };
      });

      const adgroupPolicyIds = adgroups.flatMap((adgroup) =>
        adgroup.policyId === null ? [] : [adgroup.policyId],
      );
      const uniqueAdgroupPolicyIds = new Set(adgroupPolicyIds);
      const derivedCampaignPolicyId =
        uniqueAdgroupPolicyIds.size === 1 ? (adgroupPolicyIds[0] ?? null) : null;
      const derivedCampaignIsLive =
        adgroups.length > 0
          ? adgroups.every((adgroup) => adgroup.isPolicyLive)
          : (campaignAttachment?.isLive ?? campaignIsPolicyLive);

      return {
        id: campaignId,
        name: campaign.name as string,
        policyId: campaignAttachment?.policyId ?? derivedCampaignPolicyId ?? campaignPolicyId,
        isPolicyLive: derivedCampaignIsLive,
        marketplace: campaign.marketplace as string,
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
      const [succ, data, err] = await createApiRequest({
        method: 'GET',
        endpoint: '/policies',
        ...(await getAuthKeyParam()),
      });
      if (err || !succ || !data) {
        return [];
      }

      const policies = (data as any[]).map(mapPolicy);

      this.cachedPolicyMap = buildPolicyMap(policies);
    }
    return Object.values(this.cachedPolicyMap);
  }

  async convertScriptToTree(script: string): Promise<ConvertResponse<ConvertNode>> {
    const body: ConvertScriptToTreeRequest = { script };
    const [succ, data, err] = await createApiRequest({
      method: 'POST',
      endpoint: '/convert/script-to-tree',
      ...(await getAuthKeyParam()),
      body,
    });

    if (err || !succ || data === null || typeof data !== 'object' || !('program' in data)) {
      if (err) {
        console.error('[apiClient] Failed to convert script to tree rules', err);
      }
      return {
        result: null,
        errorMessage: err?.message ?? 'Unable to convert the current script to tree rules.',
      };
    }

    const normalisedProgram = normaliseConvertNodeOperators(data.program);

    if (!normalisedProgram) {
      return {
        result: null,
        errorMessage: 'Received an invalid operator in the converted tree rule.',
      };
    }

    return {
      result: normalisedProgram,
      errorMessage: null,
    };
  }

  async convertTreeToScript(program: ConvertNode): Promise<ConvertResponse<string>> {
    let body: ConvertTreeToScriptRequest;

    try {
      body = {
        program: serialiseConvertNodeOperators(program),
      } as unknown as ConvertTreeToScriptRequest;
    } catch (error) {
      return {
        result: null,
        errorMessage:
          error instanceof Error ? error.message : 'Invalid operator provided for conversion.',
      };
    }

    const [succ, data, err] = await createApiRequest({
      method: 'POST',
      endpoint: '/convert/tree-to-script',
      ...(await getAuthKeyParam()),
      body,
    });

    if (err || !succ || data === null || typeof data.script !== 'string') {
      if (err) {
        console.error('[apiClient] Failed to convert tree rules to script', err);
      }
      return {
        result: null,
        errorMessage: err?.message ?? 'Unable to convert the current tree rule to script.',
      };
    }

    return {
      result: data.script,
      errorMessage: null,
    };
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

    const realPolicy = mapPolicy(data);

    this.clearPolicyCache();

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

    const updatedPolicy = mapPolicy(data);

    this.clearPolicyCache();

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
    if (succ) {
      this.clearPolicyCache();
      this.clearCampaignCache();
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

    return (data as any[]).map(mapBidResponse);
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

    const parsedLogs = ((data.logs as any[]) ?? []).map(mapUserLogResponse);

    return {
      logs: parsedLogs,
      totalPages: data.total_pages as number,
    };
  }

  async getRedirectUrl(region: string): Promise<string | null> {
    if (region !== 'EU' && region !== 'US' && region !== 'FE') {
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

    this.cachedAuthenticatedRegions = (data as any[]).map((value) => String(value));
    return this.cachedAuthenticatedRegions;
  }
}

export const apiClient = new ApiClient();
