import { CampaignCache } from './campaign.types';
import { BidResponse, UserLogResponse } from './logs.types';
import { AttachedPolicyDTO, Policy } from './policy.types';
import { Profile, ProfileGroup } from './profile.types';
import { ScheduledJob } from './schedule.types';

export const createEmptyCampaignCache = (): CampaignCache => ({
  EU: {},
  US: {},
  FE: {},
});

export const parseAttachedPolicies = (data: any[]): AttachedPolicyDTO[] =>
  data
    .map(
      (item): AttachedPolicyDTO => ({
        campaignId: item.campaign_id == null ? '' : String(item.campaign_id),
        adgroupId: item.adgroup_id == null ? '' : String(item.adgroup_id),
        policyId: item.policy_id == null ? '' : String(item.policy_id),
        isLive: item.is_live ?? false,
      }),
    )
    .filter(
      (item) =>
        item.policyId.length > 0 && (item.campaignId.length > 0 || item.adgroupId.length > 0),
    );

export const mapProfile = (profile: any): Profile => ({
  profileId: Number(profile.profile_id),
  countryCode: profile.country_code as string,
  region: profile.region as string,
  accountId: String(profile.account_id),
  accountName: profile.account_name as string,
  accountType: profile.account_type as string,
});

export const mapProfileGroup = (seller: any): ProfileGroup => ({
  id: String(seller.id),
  name: seller.name as string,
  profiles: ((seller.profiles as any[]) ?? []).map(mapProfile),
});

export const buildProfilesById = (
  profileGroups: ProfileGroup[] | null | undefined,
): Record<number, Profile> =>
  Object.fromEntries(
    (profileGroups ?? []).flatMap(({ profiles }) =>
      profiles.map((profile) => [profile.profileId, profile] as const),
    ),
  ) as Record<number, Profile>;

export const mapScheduledJob = (
  schedule: any,
  profilesById: Record<number, Profile>,
): ScheduledJob | null => {
  const resolvedProfileId = Number.parseInt(String(schedule.profile_id), 10);
  const resolvedProfile = profilesById[resolvedProfileId];

  if (!resolvedProfile) {
    return null;
  }

  return {
    profile: resolvedProfile,
    sellerName: schedule.seller_name as string,
    dueAt: new Date(String(schedule.due_at)),
    interval: Number.parseInt(String(schedule.interval_minutes), 10),
    state: schedule.state as string,
  };
};

export const mapPolicy = (policy: any): Policy => ({
  id: String(policy.id),
  name: policy.name as string,
  marketplace: policy.marketplace as string,
  script: policy.script as string,
});

export const buildPolicyMap = (policies: Policy[]): Record<string, Policy> =>
  Object.fromEntries(policies.map((policy) => [policy.id, policy] as const)) as Record<
    string,
    Policy
  >;

export const mapBidResponse = (entry: any): BidResponse => ({
  adgroupId: String(entry.adgroup_id),
  oldPrice: entry.from_bid as number,
  newPrice: entry.to_bid as number,
  changeDate: new Date(String(entry.change_date)),
  isLive: entry.is_live as boolean,
});

export const mapUserLogResponse = (entry: any): UserLogResponse => ({
  log: entry.log as string,
  timestamp: new Date(String(entry.timestamp)),
});
