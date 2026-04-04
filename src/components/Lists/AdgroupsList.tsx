import { FC } from 'react';
import { Form, ListGroup } from 'react-bootstrap';
import CampaignsListItem from './CampaignsListItem';
import { Adgroup } from '../../api/campaign.types';
import { Policy } from '../../api/policy.types';
import PolicyPill from '../Policies/PolicyPill';
import CreateButton from '../buttons/CreateButton';
import EditButton from '../buttons/EditButton';
import DeleteButton from '../buttons/DeleteButton';
import './CampaignsList.css';

interface AdgroupsListProps {
  adgroups: Adgroup[];
  policies: Record<string, Policy>;
  policyPillFontSize?: string;
  canViewChangeLog: boolean;
  onViewChangeLog: (adgroup: Adgroup) => void;
  onAttachPolicy: (adgroupId: string) => void;
  onEditPolicy: (adgroupId: string) => void;
  onRemovePolicy: (adgroupId: string) => void;
  onTogglePolicyLive: (adgroupId: string, isLive: boolean) => void;
}

const AdgroupsList: FC<AdgroupsListProps> = ({
  adgroups,
  policies,
  policyPillFontSize = '1em',
  canViewChangeLog,
  onViewChangeLog,
  onAttachPolicy,
  onEditPolicy,
  onRemovePolicy,
  onTogglePolicyLive,
}) => {
  return (
    <ListGroup className="ms-4">
      {adgroups.map((adgroup) => {
        const policy = adgroup.policyId ? policies[adgroup.policyId] : null;

        return (
          <CampaignsListItem key={adgroup.id}>
            <div className="d-flex align-items-center adgroup-row">
              <div className="adgroup-name-section">
                <button
                  type="button"
                  className="changelog-name-btn adgroup-name-button"
                  onClick={() => onViewChangeLog(adgroup)}
                  disabled={!canViewChangeLog}
                  aria-label={`View change log for ad group ${adgroup.name}`}
                  title={`View change log for ad group ${adgroup.name}`}
                >
                  {adgroup.name}
                </button>
              </div>
              <div className="adgroup-bid-section">
                <code className="adgroup-bid-value">{adgroup.defaultBid.toFixed(2)}</code>
                <code className="adgroup-currency-value">{adgroup.currencyCode}</code>
              </div>
              <div className="adgroup-policy-section">
                {policy ? (
                  <>
                    <PolicyPill label={policy.name} fontSize={policyPillFontSize} />
                    <Form.Check
                      id={`adgroup-live-${adgroup.id}`}
                      type="checkbox"
                      label="Live"
                      checked={adgroup.isPolicyLive}
                      onChange={(event) => onTogglePolicyLive(adgroup.id, event.target.checked)}
                      className="ms-2 policy-live-toggle"
                    />
                  </>
                ) : null}
              </div>
              <div className="adgroup-actions-section">
                {policy ? (
                  <>
                    <DeleteButton
                      onClick={() => onRemovePolicy(adgroup.id)}
                      confirmation={{
                        title: 'Remove ad group policy?',
                        body: `This will detach the current policy from "${adgroup.name}".`,
                        confirmLabel: 'Remove Policy',
                      }}
                    />
                    <EditButton onClick={() => onEditPolicy(adgroup.id)} />
                  </>
                ) : (
                  <CreateButton onClick={() => onAttachPolicy(adgroup.id)} />
                )}
              </div>
            </div>
          </CampaignsListItem>
        );
      })}
    </ListGroup>
  );
};

export default AdgroupsList;
