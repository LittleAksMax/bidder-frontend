import { FC, useState, useEffect } from 'react';
import { Card, ListGroup, FormControl, Button } from 'react-bootstrap';
import Page from './Page';
import { apiClient } from '../api/ApiClient';
import { useNavigate } from 'react-router-dom';
import { EditIcon, CreateIcon, DeleteIcon } from '../components/icons/Icon';

const Policies: FC = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [newPolicyName, setNewPolicyName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.getPolicies().then(setPolicies);
  }, []);

  const handleCreatePolicy = async () => {
    if (!newPolicyName) return;
    await apiClient.createPolicy({ name: newPolicyName });
    setNewPolicyName('');
    const updated = await apiClient.getPolicies();
    setPolicies(updated);
  };

  const handleDelete = async (id: number) => {
    // TODO: Implement delete logic
    setPolicies((prev) => prev.filter((p) => p.id !== id));
  };
  const handleUpdate = (id: number) => {
    // TODO: Implement update logic (show update form or modal)
    alert('Update policy ' + id);
  };

  return (
    <Page showSettings>
      <div className="w-100 d-flex justify-content-end mb-3">
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
        <Card.Body className="p-0 flex-grow-1 d-flex flex-column">
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <ListGroup className="mb-3">
              {policies.map((policy) => (
                <ListGroup.Item
                  key={policy.id}
                  className="d-flex align-items-center justify-content-between"
                >
                  <span>{policy.name}</span>
                  <span>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      className="ms-2"
                      onClick={() => handleUpdate(policy.id)}
                    >
                      <EditIcon size={18} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="ms-2"
                      onClick={() => handleDelete(policy.id)}
                    >
                      <DeleteIcon size={18} />
                    </Button>
                  </span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
          <div className="p-3 d-flex align-items-center">
            <Button
              variant="primary"
              onClick={() => setShowAddForm((v) => !v)}
              style={{
                borderRadius: '50%',
                width: 36,
                height: 36,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CreateIcon size={22} />
            </Button>
            {showAddForm && (
              <form
                className="ms-3 flex-grow-1 d-flex align-items-center"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreatePolicy();
                }}
              >
                <FormControl
                  type="text"
                  value={newPolicyName}
                  onChange={(e) => setNewPolicyName(e.target.value)}
                  placeholder="New policy name"
                  className="me-2"
                />
                <Button type="submit" variant="success">
                  Add
                </Button>
              </form>
            )}
          </div>
        </Card.Body>
      </Card>
    </Page>
  );
};

export default Policies;
