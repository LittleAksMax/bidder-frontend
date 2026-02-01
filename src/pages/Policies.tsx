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

const Policies: FC = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editPolicyId, setEditPolicyId] = useState<number | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    apiClient.getPolicies().then(setPolicies);
  }, []);

  const handleDelete = async (id: number) => {
    setPolicies((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdate = (id: number) => {
    setEditPolicyId(id);
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
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Card.Header className="bg-success text-white d-flex align-items-center">
          <h2 className="mb-0">Policies</h2>
        </Card.Header>
        <Card.Body className="p-0 grow d-flex flex-column position-relative">
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <PoliciesList policies={policies} onEdit={handleUpdate} onDelete={handleDelete} />
            </div>
          </div>
          <EditPolicyModal
            show={editPolicyId !== null}
            policy={policyToEdit} // Pass the correct policy
            onClose={() => setEditPolicyId(null)}
          />
        </Card.Body>
        <div
          className="policies-taskbar d-flex justify-content-end align-items-center px-3 py-2"
          style={{
            borderTop: '1px solid #e0e0e0',
            background: '#f8f9fa',
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2,
          }}
        >
          <CreateButton onClick={() => setShowCreateModal(true)} />
          <CreatePolicyModal show={showCreateModal} onClose={() => setShowCreateModal(false)} />
        </div>
      </Card>
    </Page>
  );
};

export default Policies;
