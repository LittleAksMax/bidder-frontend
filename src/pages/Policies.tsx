import { FC, useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import Page from './Page';
import { apiClient } from '../api/ApiClient';
import CreateButton from '../components/buttons/CreateButton';
import BackToHomeButton from '../components/buttons/BackToHomeButton';
import CreatePolicyModal from '../components/Policies/CreatePolicyModal';
import EditPolicyModal from '../components/Policies/EditPolicyModal';
import PoliciesList from '../components/Lists/PoliciesList';
import Loading from './Loading';
import PageToolbar from '../components/PageToolbar';
import './Policies.css';
import { Policy } from '../api/policy.types';

const Policies: FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [undeletablePolicyIds, setUndeletablePolicyIds] = useState<Set<string>>(new Set());
  const [hasLoadedDeleteConstraints, setHasLoadedDeleteConstraints] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editPolicyId, setEditPolicyId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPoliciesPageData = async (): Promise<void> => {
      try {
        const attachedPolicyIdsPromise = (async (): Promise<Set<string>> => {
          const sellerProfiles = await apiClient.getSellerProfiles();
          const profileIds = sellerProfiles.flatMap((seller) =>
            seller.profiles.map((profile) => profile.profileId),
          );
          const attachedPoliciesByProfile = await Promise.all(
            profileIds.map((profileId) => apiClient.getAttachedPolicies(profileId)),
          );

          const nextUndeletablePolicyIds = new Set<string>();
          attachedPoliciesByProfile.forEach((attachedPolicies) => {
            attachedPolicies.forEach((attachedPolicy) => {
              if (attachedPolicy.adgroupId.length > 0 && attachedPolicy.policyId.length > 0) {
                nextUndeletablePolicyIds.add(attachedPolicy.policyId);
              }
            });
          });

          return nextUndeletablePolicyIds;
        })();

        const [loadedPolicies, loadedUndeletablePolicyIds] = await Promise.all([
          apiClient.getPolicies(),
          attachedPolicyIdsPromise,
        ]);

        if (!isMounted) {
          return;
        }

        setPolicies(loadedPolicies);
        setUndeletablePolicyIds(loadedUndeletablePolicyIds);
        setHasLoadedDeleteConstraints(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPoliciesPageData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: string): Promise<void> => {
    if (!hasLoadedDeleteConstraints || undeletablePolicyIds.has(id)) {
      return;
    }

    setPolicies((prev) => prev.filter((p) => p.id !== id));
    await apiClient.deletePolicyByID(id);
  };

  const handleEdit = (id: string): void => {
    setEditPolicyId(id);
  };

  const handleUpdatePolicy = async (id: string, name: string, script: string): Promise<boolean> => {
    // Optimistic update: update policy immediately in the list
    setPolicies((prev) =>
      prev.map((policy) => (policy.id === id ? { ...policy, name, script } : policy)),
    );

    const res = await apiClient.updatePolicy(id, name, script);

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

  const handleCreate = async (p: Policy): Promise<string | null> => {
    // Optimistic update: add temp policy immediately
    const tempId = `temp-${Date.now()}`;
    const tempPolicy = { ...p, id: tempId };
    setPolicies((prev) => [...prev, tempPolicy]);

    const { result, errorMessage } = await apiClient.createPolicy(p.name, p.marketplace, p.script);

    if (result) {
      setShowCreateModal(false);
      // Replace temp policy with real one
      setPolicies((prev) => prev.map((policy) => (policy.id === tempId ? result : policy)));
      return null;
    } else {
      // Remove temp policy on failure
      setPolicies((prev) => prev.filter((policy) => policy.id !== tempId));
      return errorMessage ?? 'Unable to create the policy.';
    }
  };

  const policyToEdit = policies.find((policy) => policy.id === editPolicyId) || null; // Find policy by ID
  return (
    <Page showSettings>
      <PageToolbar right={<BackToHomeButton className="me-2" />} className="policies-toolbar" />
      <Card className="policies-card">
        <Card.Header className="bg-success text-white d-flex align-items-center policies-header">
          <h2 className="mb-0">Policies</h2>
        </Card.Header>
        <Card.Body className="p-0 grow d-flex flex-column position-relative policies-body">
          <div className="policies-body-inner">
            <div className="policies-list-scroll">
              {isLoading ? (
                <Loading className="policies-loading-state" />
              ) : (
                <PoliciesList
                  policies={policies}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  undeletablePolicyIds={undeletablePolicyIds}
                  hasLoadedDeleteConstraints={hasLoadedDeleteConstraints}
                />
              )}
            </div>
          </div>

          <EditPolicyModal
            show={editPolicyId !== null}
            policy={policyToEdit}
            handleUpdate={handleUpdatePolicy}
            onClose={() => setEditPolicyId(null)}
          />
        </Card.Body>
        <Card.Footer className="policies-footer">
          <div className="d-flex justify-content-end align-items-center policies-footer-actions">
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
