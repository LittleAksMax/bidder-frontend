import { FC, useState, useEffect } from 'react';
import { apiClient } from '../../api/ApiClient';
import { ListGroup, Button } from 'react-bootstrap';
import { Campaign } from '../../api/types';
import AdgroupsList from './AdgroupsList';
import ExpandButton from './ExpandButton';
import PolicyPill from '../PolicyPill';
import AssignPolicyModal from './AssignPolicyModal';
import { CreateIcon, EditIcon, DeleteIcon } from '../icons/Icon';
import ChangeLogModal from './ChangeLogModal';
import CampaignsListItem from './CampaignsListItem';
import CampaignsListRowSections from './CampaignsListRowSections';

const POLICY_PILL_FONT_SIZE = '1em'; // Adjust as needed
const VIEW_CHANGE_LOG_FONT_SIZE = '1em'; // Adjust as needed

const CampaignsList: FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [showAssignModal, setShowAssignModal] = useState<number | null>(null);
  const [showChangeLog, setShowChangeLog] = useState<number | null>(null);

  useEffect(() => {
    apiClient.getCampaigns().then((data) => {
      setCampaigns(data);
      setExpanded(data.map((c) => c.id)); // Expand all campaigns by default
    });
  }, []);

  const handleToggle = (id: number) => {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleRemovePolicy = (campaignId: number) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === campaignId) {
          const { policy, ...rest } = c;
          return { ...rest };
        }
        return c;
      }),
    );
  };

  return (
    <ListGroup>
      {campaigns.map((campaign) => (
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
              campaign.policy ? (
                <PolicyPill policy={campaign.policy} fontSize={POLICY_PILL_FONT_SIZE} />
              ) : null
            }
            buttonsSection={
              campaign.policy ? (
                <>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemovePolicy(campaign.id)}
                    title="Remove Policy"
                    style={{
                      transition: 'background 0.2s',
                      boxShadow: 'none',
                      padding: '0.1rem 0.3rem',
                      minWidth: 0,
                      minHeight: 0,
                      lineHeight: 1,
                    }}
                  >
                    <DeleteIcon size={20} />
                  </Button>
                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={() => setShowAssignModal(campaign.id)}
                    title="Edit Policy"
                    style={{
                      transition: 'background 0.2s',
                      boxShadow: 'none',
                      padding: '0.1rem 0.3rem',
                      minWidth: 0,
                      minHeight: 0,
                      lineHeight: 1,
                    }}
                  >
                    <EditIcon size={20} />
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => setShowAssignModal(campaign.id)}
                  title="Assign Policy"
                  style={{
                    transition: 'background 0.2s',
                    boxShadow: 'none',
                    padding: '0.1rem 0.3rem',
                    minWidth: 0,
                    minHeight: 0,
                    lineHeight: 1,
                  }}
                >
                  <CreateIcon size={20} />
                </Button>
              )
            }
            changeLogSection={
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowChangeLog(campaign.id)}
                style={{
                  transition: 'background 0.2s',
                  boxShadow: 'none',
                  padding: '2px 0.3rem',
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
            onAssign={(policy) => {
              setShowAssignModal(null);
              setCampaigns((prev) =>
                prev.map((c) => (c.id === campaign.id ? { ...c, policy } : c)),
              );
            }}
          />
          <ChangeLogModal
            show={showChangeLog === campaign.id}
            onHide={() => setShowChangeLog(null)}
            adgroups={campaign.adgroups}
          />
        </CampaignsListItem>
      ))}
    </ListGroup>
  );
};

export default CampaignsList;
