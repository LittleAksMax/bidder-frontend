import { FC } from 'react';
import { ListGroup } from 'react-bootstrap';
import EditButton from '../buttons/EditButton';
import DeleteButton from '../buttons/DeleteButton';
import { Policy } from '../../api/types';
import PolicyPill from '../Policies/PolicyPill';
// import './PoliciesList.css';

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
              {policy.name}
              <PolicyPill policyName="Range Update Rules" color="success" fontSize={18} />
            </div>
          </div>
        </div>
        <span>
          <EditButton onClick={() => onEdit(policy.id)} />
          <DeleteButton onClick={() => onDelete(policy.id)} />
        </span>
      </ListGroup.Item>
    ))}
  </ListGroup>
);

export default PoliciesList;
