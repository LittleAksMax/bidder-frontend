import { FC } from 'react';
import { ListGroup } from 'react-bootstrap';
import EditButton from '../buttons/EditButton';
import DeleteButton from '../buttons/DeleteButton';
import { Policy } from '../../api/types';
import PolicyPill from '../Policies/PolicyPill';
import MarketplacePill from '../Policies/MarketplacePill';
import PolicyName from '../Policies/PolicyName';

interface PoliciesListProps {
  policies: Policy[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const PoliciesList: FC<PoliciesListProps> = ({ policies, onEdit, onDelete }) => (
  <ListGroup className="mb-3">
    {policies.map((policy) => (
      <ListGroup.Item
        key={policy.id}
        className="d-flex align-items-center justify-content-between policies-list-item"
      >
        <div className="d-flex align-items-center" style={{ gap: '1.5rem' }}>
          <div className="d-flex flex-column">
            <div style={{ display: 'flex', alignItems: 'center', fontWeight: 500, gap: '0.5em' }}>
              <PolicyName name={policy.name} />
              <PolicyPill ruleType={policy.type} colour="success" fontSize={18} />
              <MarketplacePill marketplace={policy.marketplace} fontSize={18} />
            </div>
          </div>
        </div>
        <span className="d-inline-flex" style={{ gap: '0.5rem' }}>
          <EditButton onClick={() => onEdit(policy.id)} />
          <DeleteButton onClick={() => onDelete(policy.id)} />
        </span>
      </ListGroup.Item>
    ))}
  </ListGroup>
);

export default PoliciesList;
