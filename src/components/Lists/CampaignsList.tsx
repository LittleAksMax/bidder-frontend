import { FC, useState, useEffect } from 'react';
import { apiClient } from '../../api/ApiClient';
import { ListGroup, Button } from 'react-bootstrap';
import { Campaign, Policy } from '../../api/types';
import AdgroupsList from './AdgroupsList';
import ExpandButton from './ExpandButton';
import PolicyPill from '../Policies/PolicyPill';
import AssignPolicyModal from './AssignPolicyModal';
import CreateButton from '../buttons/CreateButton';
import EditButton from '../buttons/EditButton';
import DeleteButton from '../buttons/DeleteButton';
import './CampaignsList.css';
import ChangeLogModal from './ChangeLogModal';
import CampaignsListItem from './CampaignsListItem';
import CampaignsListRowSections from './CampaignsListRowSections';

const POLICY_PILL_FONT_SIZE = '1em'; // Adjust as needed
const VIEW_CHANGE_LOG_FONT_SIZE = '1em'; // Adjust as needed

interface CampaignsListProps {
  selectedMarketplace: string | null;
}

const CampaignsList: FC<CampaignsListProps> = ({ selectedMarketplace }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [showAssignModal, setShowAssignModal] = useState<number | null>(null);
  const [showChangeLog, setShowChangeLog] = useState<number | null>(null);
  const [policies, setPolicies] = useState<Record<number, Policy>>({});

  useEffect(() => {
    apiClient.getCampaigns().then((data) => {
      setCampaigns(data);
      setExpanded(data.map((c) => c.id)); // Expand all campaigns by default
    });
  }, []);

  useEffect(() => {
    if (campaigns.length > 0) {
      const fetchPolicies = async () => {
        const policyMap: Record<number, Policy> = {};
        for (const campaign of campaigns) {
          if (campaign.policyId) {
            const policy = await apiClient.getPolicyByID(campaign.policyId);
            if (policy) {
              policyMap[campaign.policyId] = policy;
            }
          }
        }
        setPolicies(policyMap);
      };

      fetchPolicies();
    }
  }, [campaigns]);

  const filteredCampaigns = selectedMarketplace
    ? campaigns.filter((c) => c.marketplace === selectedMarketplace)
    : campaigns;

  const handleToggle = (id: number) => {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleRemovePolicy = (campaignId: number) => {
    setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? { ...c, policyId: null } : c)));
  };

  return (
    <ListGroup>
      {filteredCampaigns.map((campaign) => {
        const policy = campaign.policyId ? policies[campaign.policyId] : null;
        return (
          <CampaignsListItem key={campaign.id}>
            <CampaignsListRowSections
              nameSection={
                <>
                  <ExpandButton
                    expanded={expanded.includes(campaign.id)}
                    onToggle={() => handleToggle(campaign.id)}
                    ariaLabel={
                      expanded.includes(campaign.id) ? 'Collapse campaign' : 'Expand campaign'
                    }
                    className="me-1"
                  />
                  <span
                    style={{
                      verticalAlign: 'middle',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {campaign.name}
                  </span>
                </>
              }
              policySection={
                policy ? (
                  <PolicyPill ruleType={policy.type} fontSize={POLICY_PILL_FONT_SIZE} />
                ) : null
              }
              buttonsSection={
                policy ? (
                  <>
                    <DeleteButton onClick={() => handleRemovePolicy(campaign.id)} />
                    <EditButton onClick={() => setShowAssignModal(campaign.id)} />
                  </>
                ) : (
                  <CreateButton onClick={() => setShowAssignModal(campaign.id)} />
                )
              }
              changeLogSection={
                <Button
                  className="btn-changelog"
                  size="sm"
                  onClick={() => setShowChangeLog(campaign.id)}
                  style={{
                    padding: '2px 0.6rem',
                    minWidth: 0,
                    minHeight: 0,
                    lineHeight: 1,
                    fontSize: VIEW_CHANGE_LOG_FONT_SIZE,
                  }}
                >
                  View Change Log
                </Button>
              }
            />
            {expanded.includes(campaign.id) && (
              <div className="mt-2">
                <AdgroupsList adgroups={campaign.adgroups} />
              </div>
            )}
            <AssignPolicyModal
              show={showAssignModal === campaign.id}
              onHide={() => setShowAssignModal(null)}
              onAssign={(policyId: number) => {
                setShowAssignModal(null);
                setCampaigns((prevCampaigns) =>
                  prevCampaigns.map((campaign) =>
                    campaign.id === campaign.id ? { ...campaign, policyId } : campaign,
                  ),
                );
              }}
              campaignMarketplace={campaign.marketplace} // Pass marketplace for filtering
            />
            <ChangeLogModal
              show={showChangeLog === campaign.id}
              onHide={() => setShowChangeLog(null)}
              adgroups={campaign.adgroups}
            />
          </CampaignsListItem>
        );
      })}
    </ListGroup>
  );
};

export default CampaignsList;
