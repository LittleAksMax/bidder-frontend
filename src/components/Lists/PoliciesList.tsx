import { FC } from 'react';
import { Badge, ListGroup } from 'react-bootstrap';
import EditButton from '../buttons/EditButton';
import DeleteButton from '../buttons/DeleteButton';
import { Policy } from '../../api/policy.types';
import MarketplacePill from '../Policies/MarketplacePill';
import PolicyName from '../Policies/PolicyName';
import './PoliciesList.css';

interface PoliciesListProps {
  policies: Policy[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  undeletablePolicyIds: Set<string>;
  hasLoadedDeleteConstraints: boolean;
}

const PoliciesList: FC<PoliciesListProps> = ({
  policies,
  onEdit,
  onDelete,
  undeletablePolicyIds,
  hasLoadedDeleteConstraints,
}) => (
  <ListGroup className="mb-3">
    {policies.map((policy) => {
      const isInUse = undeletablePolicyIds.has(policy.id);

      return (
        <ListGroup.Item
          key={policy.id}
          className="d-flex align-items-center justify-content-between policies-list-item"
        >
          <div className="d-flex align-items-center policies-list-content">
            <div className="d-flex flex-column">
              <div className="policies-list-header">
                <PolicyName name={policy.name} />
                <MarketplacePill marketplace={policy.marketplace} fontSize={18} />
              </div>
            </div>
          </div>
          <span className="d-inline-flex policies-list-actions">
            {isInUse ? (
              <Badge bg="danger" pill className="policies-list-in-use-pill" title="Policy in use">
                IN USE
              </Badge>
            ) : null}
            <EditButton onClick={() => onEdit(policy.id)} />
            <DeleteButton
              onClick={() => onDelete(policy.id)}
              disabled={!hasLoadedDeleteConstraints || isInUse}
              confirmation={{
                title: 'Delete policy?',
                body: `This will permanently delete "${policy.name}".`,
                confirmLabel: 'Delete Policy',
              }}
            />
          </span>
        </ListGroup.Item>
      );
    })}
  </ListGroup>
);

export default PoliciesList;
