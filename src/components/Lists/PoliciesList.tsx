import { FC } from 'react';
import { ListGroup } from 'react-bootstrap';
import EditButton from '../buttons/EditButton';
import DeleteButton from '../buttons/DeleteButton';
import { Policy } from '../../api/types';
import PolicyPill from '../Policies/PolicyPill';
import MarketplacePill from '../Policies/MarketplacePill';
import PolicyName from '../Policies/PolicyName';
import './PoliciesList.css';

interface PoliciesListProps {
  policies: Policy[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const PoliciesList: FC<PoliciesListProps> = ({ policies, onEdit, onDelete }) => (
  <ListGroup className="mb-3">
    {policies.map((policy) => (
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
          <EditButton onClick={() => onEdit(policy.id)} />
          <DeleteButton onClick={() => onDelete(policy.id)} />
        </span>
      </ListGroup.Item>
    ))}
  </ListGroup>
);

export default PoliciesList;
