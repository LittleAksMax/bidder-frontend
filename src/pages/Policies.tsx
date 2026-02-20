import { FC, useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import Page from './Page';
import { apiClient } from '../api/ApiClient';
import { useNavigate } from 'react-router-dom';
import CreateButton from '../components/buttons/CreateButton';

import CreatePolicyModal from '../components/Policies/CreatePolicyModal';
import EditPolicyModal from '../components/Policies/EditPolicyModal';
import PoliciesList from '../components/Lists/PoliciesList';
import './Policies.css';
import { Policy } from '../api/types';

const Policies: FC = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editPolicyId, setEditPolicyId] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    apiClient.getPolicies().then(setPolicies);
  }, []);

  const handleDelete = async (id: string) => {
    setPolicies((prev) => prev.filter((p) => p.id !== id));
    await apiClient.deletePolicyByID(id);
  };

  const handleEdit = (id: string) => {
    setEditPolicyId(id);
  };

  const handleUpdatePolicy = async (id: string, name: string, rules: any): Promise<boolean> => {
    // Close modal
    setEditPolicyId(null);

    // Optimistic update: update policy immediately in the list
    setPolicies((prev) =>
      prev.map((policy) => (policy.id === id ? { ...policy, name, rules } : policy)),
    );

    const res = await apiClient.updatePolicy(id, name, rules);

    if (res) {
      // Replace with actual server response
      setPolicies((prev) => prev.map((policy) => (policy.id === id ? res : policy)));
      return true;
    } else {
      // Revert optimistic update by refetching
      const freshPolicies = await apiClient.getPolicies();
      setPolicies(freshPolicies);
      return false;
    }
  };

  const handleCreate = async (p: Policy): Promise<boolean> => {
    // Close modal in any case
    setShowCreateModal(false);

    // Just-in-case avoid null rules
    if (!p.rules) return false;

    // Optimistic update: add temp policy immediately
    const tempId = `temp-${Date.now()}`;
    const tempPolicy = { ...p, id: tempId };
    setPolicies((prev) => [...prev, tempPolicy]);

    const res = await apiClient.createPolicy(p.name, p.type, p.marketplace, p.rules);

    if (res) {
      // Replace temp policy with real one
      setPolicies((prev) => prev.map((policy) => (policy.id === tempId ? res : policy)));
      return true;
    } else {
      // Remove temp policy on failure
      setPolicies((prev) => prev.filter((policy) => policy.id !== tempId));
      return false;
    }
  };

  const policyToEdit = policies.find((policy) => policy.id === editPolicyId) || null; // Find policy by ID
  return (
    <Page showSettings>
      <div className="w-100 d-flex justify-content-end mb-3" style={{ gap: '0.5rem' }}>
        <Button variant="outline-primary" size="sm" onClick={() => navigate('/')} className="me-2">
          Back To Home
        </Button>
      </div>
      <Card
        style={{
          width: '100%',
          height: '93%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Card.Header
          className="bg-success text-white d-flex align-items-center"
          style={{ height: '5%', minHeight: 50 }}
        >
          <h2 className="mb-0">Policies</h2>
        </Card.Header>
        <Card.Body
          className="p-0 grow d-flex flex-column position-relative"
          style={{ flex: '1 1 90%', minHeight: 0 }}
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <PoliciesList policies={policies} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
          </div>

          <EditPolicyModal
            show={editPolicyId !== null}
            policy={policyToEdit}
            handleUpdate={handleUpdatePolicy}
            onClose={() => setEditPolicyId(null)}
          />
        </Card.Body>
        <Card.Footer style={{ height: '5%', minHeight: 50 }}>
          <div
            className="d-flex justify-content-end align-items-center"
            style={{
              background: '#f8f9fa',
            }}
          >
            <CreateButton onClick={() => setShowCreateModal(true)} />
            <CreatePolicyModal
              show={showCreateModal}
              handleCreate={handleCreate}
              onClose={() => setShowCreateModal(false)}
            />
          </div>
        </Card.Footer>
      </Card>
    </Page>
  );
};

export default Policies;
