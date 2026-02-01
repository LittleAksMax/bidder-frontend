import { FC, useEffect, useState } from 'react';
import { Modal, Button, ListGroup, Spinner } from 'react-bootstrap';
import { apiClient } from '../../api/ApiClient';
import { Policy } from '../../api/types';
import './policy-modal.css';

interface AssignPolicyModalProps {
  show: boolean;
  onHide: () => void;
  onAssign: (policyId: number) => void;
  campaignMarketplace: string; // Add marketplace prop
}

const AssignPolicyModal: FC<AssignPolicyModalProps> = ({
  show,
  onHide,
  onAssign,
  campaignMarketplace,
}) => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setLoading(true);
      apiClient.getPolicies().then((data) => {
        // Filter policies by marketplace
        const filteredPolicies = data.filter(
          (policy) => policy.marketplace === campaignMarketplace,
        );
        setPolicies(filteredPolicies);
        setLoading(false);
      });
    }
  }, [show, campaignMarketplace]);

  return (
    <Modal show={show} onHide={onHide} scrollable centered>
      <Modal.Header closeButton>
        <Modal.Title>Assign Policy</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: 400, overflowY: 'auto' }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: 200 }}>
            <Spinner animation="border" />
          </div>
        ) : (
          <ListGroup>
            {policies.map((policy) => (
              <ListGroup.Item
                key={policy.id}
                action
                onClick={() => {
                  onAssign(policy.id); // Return only the policyID
                  onHide();
                }}
                style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                className="policy-select-item"
              >
                {policy.name}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AssignPolicyModal;
