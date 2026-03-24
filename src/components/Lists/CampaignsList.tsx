import { FC, MouseEvent, useEffect, useState } from 'react';
import { Form, ListGroup, Spinner } from 'react-bootstrap';
import { apiClient } from '../../api/ApiClient';
import { Campaign, Policy, Profile } from '../../api/types';
import AdgroupsList from './AdgroupsList';
import ExpandButton from './ExpandButton';
import AssignPolicyModal from './AssignPolicyModal';
import CreateButton from '../buttons/CreateButton';
import DeleteButton from '../buttons/DeleteButton';
import './CampaignsList.css';
import ChangeLogModal, { ChangeLogScope } from './ChangeLogModal';
import CampaignsListItem from './CampaignsListItem';
import CampaignsListRowSections from './CampaignsListRowSections';

const POLICY_PILL_FONT_SIZE = '1em';

interface CampaignsListProps {
  region: string | null;
  sellerId: string | null;
  profile: Profile | null;
  selectionPending: boolean;
}

type ChangeLogContext = {
  scope: ChangeLogScope;
  campaignId?: number;
  adgroupId?: number;
};

type AssignPolicyContext =
  | {
      level: 'campaign';
      campaignId: number;
      campaignMarketplace: string;
    }
  | {
      level: 'adgroup';
      campaignId: number;
      adgroupId: number;
      campaignMarketplace: string;
    };

const defaultProfileFields = { profileId: null, countryCode: '' };

const CampaignsList: FC<CampaignsListProps> = ({ region, sellerId, profile, selectionPending }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [assignPolicyContext, setAssignPolicyContext] = useState<AssignPolicyContext | null>(null);
  const [changeLogContext, setChangeLogContext] = useState<ChangeLogContext | null>(null);
  const [policies, setPolicies] = useState<Record<string, Policy>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const { profileId, countryCode } = profile ?? defaultProfileFields;

  useEffect(() => {
    let isCancelled = false;

    if (region && profileId) {
      setLoading(true);
      void apiClient
        .getCampaigns(region, profileId)
        .then((data) => {
          if (isCancelled) {
            return;
          }
          setCampaigns(data);
          setExpanded([]);
        })
        .finally(() => {
          if (!isCancelled) {
            setLoading(false);
          }
        });
    } else {
      setCampaigns([]);
      setExpanded([]);
      setPolicies({});
      setLoading(false);
    }

    return () => {
      isCancelled = true;
    };
  }, [region, profileId]);

  useEffect(() => {
    let isCancelled = false;

    if (campaigns.length === 0) {
      setPolicies({});
      return;
    }

    const fetchPolicies = async () => {
      const policyMap: Record<string, Policy> = {};
      const policyIds = new Set<string>();

      campaigns.forEach((campaign) => {
        if (campaign.policyId) {
          policyIds.add(campaign.policyId);
        }
        campaign.adgroups.forEach((adgroup) => {
          if (adgroup.policyId) {
            policyIds.add(adgroup.policyId);
          }
        });
      });

      for (const policyId of policyIds) {
        const policy = await apiClient.getPolicyByID(policyId);
        if (policy) {
          policyMap[policyId] = policy;
        }
      }

      if (!isCancelled) {
        setPolicies(policyMap);
      }
    };

    void fetchPolicies();

    return () => {
      isCancelled = true;
    };
  }, [campaigns]);

  const filteredCampaigns = campaigns;

  const getCampaignById = (campaignId: number): Campaign | null =>
    campaigns.find((campaign) => campaign.id === campaignId) ?? null;

  const getAdgroupById = (campaignId: number, adgroupId: number) => {
    const campaign = getCampaignById(campaignId);
    if (!campaign) {
      return null;
    }
    return campaign.adgroups.find((adgroup) => adgroup.id === adgroupId) ?? null;
  };

  const handleToggle = (id: number) => {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleCampaignRowClick = (campaignId: number, event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('.campaign-row-action')) {
      return;
    }
    handleToggle(campaignId);
  };

  const handleRemoveCampaignPolicy = (campaignId: number) => {
    const campaign = getCampaignById(campaignId);
    if (campaign) {
      campaign.adgroups.forEach((adgroup) => {
        if (adgroup.policyId) {
          void apiClient.detachPolicyFromAdgroup(adgroup);
        }
      });
    }

    setCampaigns((prev) =>
      prev.map((campaign) =>
        campaign.id === campaignId
          ? {
              ...campaign,
              policyId: null,
              isPolicyLive: false,
              adgroups: campaign.adgroups.map((adgroup) => ({
                ...adgroup,
                policyId: null,
                isPolicyLive: false,
              })),
            }
          : campaign,
      ),
    );
  };

  const handleToggleCampaignPolicyLive = (campaignId: number, isLive: boolean) => {
    const campaign = getCampaignById(campaignId);
    if (campaign && profileId !== null) {
      campaign.adgroups.forEach((adgroup) => {
        if (adgroup.policyId) {
          void apiClient.attachPolicyToAdgroup(profileId, adgroup, adgroup.policyId, isLive);
        }
      });
    }

    setCampaigns((prev) =>
      prev.map((campaign) =>
        campaign.id === campaignId
          ? {
              ...campaign,
              isPolicyLive: isLive,
              adgroups: campaign.adgroups.map((adgroup) => ({ ...adgroup, isPolicyLive: isLive })),
            }
          : campaign,
      ),
    );
  };

  const handleRemoveAdgroupPolicy = (campaignId: number, adgroupId: number) => {
    const adgroup = getAdgroupById(campaignId, adgroupId);
    if (adgroup) {
      void apiClient.detachPolicyFromAdgroup(adgroup);
    }

    setCampaigns((prev) =>
      prev.map((campaign) =>
        campaign.id === campaignId
          ? {
              ...campaign,
              adgroups: campaign.adgroups.map((adgroup) =>
                adgroup.id === adgroupId
                  ? { ...adgroup, policyId: null, isPolicyLive: false }
                  : adgroup,
              ),
            }
          : campaign,
      ),
    );
  };

  const handleToggleAdgroupPolicyLive = (
    campaignId: number,
    adgroupId: number,
    isLive: boolean,
  ) => {
    const adgroup = getAdgroupById(campaignId, adgroupId);
    if (adgroup?.policyId && profileId !== null) {
      void apiClient.attachPolicyToAdgroup(profileId, adgroup, adgroup.policyId, isLive);
    }

    setCampaigns((prev) =>
      prev.map((campaign) =>
        campaign.id === campaignId
          ? {
              ...campaign,
              adgroups: campaign.adgroups.map((adgroup) =>
                adgroup.id === adgroupId ? { ...adgroup, isPolicyLive: isLive } : adgroup,
              ),
            }
          : campaign,
      ),
    );
  };

  const handleAssignPolicy = (policyId: string) => {
    if (!assignPolicyContext) {
      return;
    }

    if (assignPolicyContext.level === 'campaign') {
      const campaign = getCampaignById(assignPolicyContext.campaignId);
      if (campaign && profileId !== null) {
        campaign.adgroups.forEach((adgroup) => {
          void apiClient.attachPolicyToAdgroup(profileId, adgroup, policyId, true);
        });
      }

      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === assignPolicyContext.campaignId
            ? {
                ...campaign,
                policyId,
                isPolicyLive: true,
                adgroups: campaign.adgroups.map((adgroup) => ({
                  ...adgroup,
                  policyId,
                  isPolicyLive: true,
                })),
              }
            : campaign,
        ),
      );
      return;
    }

    const adgroup = getAdgroupById(assignPolicyContext.campaignId, assignPolicyContext.adgroupId);
    if (adgroup && profileId !== null) {
      void apiClient.attachPolicyToAdgroup(profileId, adgroup, policyId, true);
    }

    setCampaigns((prev) =>
      prev.map((campaign) =>
        campaign.id === assignPolicyContext.campaignId
          ? {
              ...campaign,
              adgroups: campaign.adgroups.map((adgroup) =>
                adgroup.id === assignPolicyContext.adgroupId
                  ? { ...adgroup, policyId, isPolicyLive: true }
                  : adgroup,
              ),
            }
          : campaign,
      ),
    );
  };

  const hasSellerAndProfile = sellerId !== null && profileId !== null;

  return loading || selectionPending ? (
    <div className="d-flex justify-content-center align-items-center assign-policy-loading">
      <Spinner animation="border" />
    </div>
  ) : (
    <>
      <ListGroup>
        {filteredCampaigns.length === 0 && <p>No enabled campaigns in this configuration.</p>}
        {filteredCampaigns.map((campaign) => {
          const campaignHasAnyPolicy = campaign.adgroups.some(
            (adgroup) => adgroup.policyId !== null,
          );
          const areAllAdgroupsLive =
            campaign.adgroups.length > 0 &&
            campaign.adgroups.every((adgroup) => adgroup.isPolicyLive);

          return (
            <CampaignsListItem key={campaign.id}>
              <div
                className="campaign-row-click-area"
                onClick={(event) => handleCampaignRowClick(campaign.id, event)}
              >
                <CampaignsListRowSections
                  nameSection={
                    <>
                      <ExpandButton
                        expanded={expanded.includes(campaign.id)}
                        onToggle={() => handleToggle(campaign.id)}
                        ariaLabel={
                          expanded.includes(campaign.id) ? 'Collapse campaign' : 'Expand campaign'
                        }
                        className="me-1 campaign-row-action"
                      />
                      <span className="campaign-row-name-wrap">
                        <button
                          type="button"
                          className="changelog-name-btn campaign-row-action campaign-name-button"
                          onClick={() =>
                            setChangeLogContext({
                              scope: 'campaign',
                              campaignId: campaign.id,
                            })
                          }
                          disabled={!hasSellerAndProfile}
                          aria-label={`View change log for campaign ${campaign.name}`}
                          title={`View change log for campaign ${campaign.name}`}
                        >
                          {campaign.name}
                        </button>
                      </span>
                    </>
                  }
                  policySection={
                    <div className="d-flex align-items-center campaign-row-action">
                      <Form.Check
                        id={`campaign-live-${campaign.id}`}
                        type="checkbox"
                        label="Toggle All"
                        checked={areAllAdgroupsLive}
                        onChange={(event) =>
                          handleToggleCampaignPolicyLive(campaign.id, event.target.checked)
                        }
                        className="ms-2 policy-live-toggle"
                        disabled={!campaignHasAnyPolicy}
                      />
                    </div>
                  }
                  buttonsSection={
                    <>
                      <CreateButton
                        onClick={() =>
                          setAssignPolicyContext({
                            level: 'campaign',
                            campaignId: campaign.id,
                            campaignMarketplace: countryCode,
                          })
                        }
                        className="campaign-row-action"
                      />
                      <DeleteButton
                        onClick={() => handleRemoveCampaignPolicy(campaign.id)}
                        className="campaign-row-action"
                      />
                    </>
                  }
                />
              </div>
              {expanded.includes(campaign.id) && (
                <div className="mt-2">
                  <AdgroupsList
                    adgroups={campaign.adgroups}
                    policies={policies}
                    policyPillFontSize={POLICY_PILL_FONT_SIZE}
                    canViewChangeLog={hasSellerAndProfile}
                    onViewChangeLog={(adgroup) =>
                      setChangeLogContext({
                        scope: 'adgroup',
                        campaignId: campaign.id,
                        adgroupId: adgroup.id,
                      })
                    }
                    onAttachPolicy={(adgroupId) =>
                      setAssignPolicyContext({
                        level: 'adgroup',
                        campaignId: campaign.id,
                        adgroupId,
                        campaignMarketplace: countryCode,
                      })
                    }
                    onEditPolicy={(adgroupId) =>
                      setAssignPolicyContext({
                        level: 'adgroup',
                        campaignId: campaign.id,
                        adgroupId,
                        campaignMarketplace: countryCode,
                      })
                    }
                    onRemovePolicy={(adgroupId) =>
                      handleRemoveAdgroupPolicy(campaign.id, adgroupId)
                    }
                    onTogglePolicyLive={(adgroupId, isLive) =>
                      handleToggleAdgroupPolicyLive(campaign.id, adgroupId, isLive)
                    }
                  />
                </div>
              )}
            </CampaignsListItem>
          );
        })}
      </ListGroup>
      <AssignPolicyModal
        show={assignPolicyContext !== null}
        onHide={() => setAssignPolicyContext(null)}
        onAssign={(policyId: string) => {
          handleAssignPolicy(policyId);
          setAssignPolicyContext(null);
        }}
        campaignMarketplace={assignPolicyContext?.campaignMarketplace ?? ''}
      />
      <ChangeLogModal
        show={changeLogContext !== null}
        onHide={() => setChangeLogContext(null)}
        scope={changeLogContext?.scope ?? 'campaign'}
        sellerId={sellerId}
        profileId={profileId ?? null}
        campaignId={changeLogContext?.campaignId ?? null}
        adgroupId={changeLogContext?.adgroupId ?? null}
      />
    </>
  );
};

export default CampaignsList;
