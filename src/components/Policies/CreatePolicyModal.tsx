import { FC, useEffect, useState } from 'react';
import { apiClient } from '../../api/ApiClient';
import Modal from '../Modal';
import { Policy } from '../../api/policy.types';
import './CreatePolicyModal.css';
import PolicyModalTitlebar from './PolicyModalTitlebar';
import PolicyRuleEditor from './PolicyRuleEditor';
import useGuardedEditorClose from './useGuardedEditorClose';
import usePolicyRuleEditor from './usePolicyRuleEditor';

interface CreatePolicyModalProps {
  show: boolean;
  handleCreate: (p: Policy) => Promise<boolean>;
  onClose: () => void;
}

const CreatePolicyModal: FC<CreatePolicyModalProps> = ({ show, handleCreate, onClose }) => {
  const [policyName, setPolicyName] = useState<string>('');
  const [marketplace, setMarketplace] = useState<string>('EU');
  const [marketplaces, setMarketplaces] = useState<string[]>(['EU']);
  const {
    ruleType,
    scriptProgram,
    nestedProgram,
    isConverting,
    conversionError,
    isRuleComplete,
    clearConversionError,
    setNestedSlotsFilled,
    handleScriptChange,
    handleNestedChange,
    handleRuleTypeChange,
    ensureScriptProgram,
  } = usePolicyRuleEditor({ initialScript: '' });
  const { handleEditorFocusCapture, handleEditorBlurCapture, handleGuardedClose } =
    useGuardedEditorClose(show, onClose);
  const isCreateEnabled = Boolean(policyName.trim()) && isRuleComplete && !isConverting;

  useEffect(() => {
    if (!show) {
      clearConversionError();
      return;
    }

    let isMounted = true;

    void apiClient.getSellerProfiles().then((sellerProfiles) => {
      if (!isMounted) {
        return;
      }

      const nextMarketplaces = Array.from(
        new Set(
          sellerProfiles.flatMap((seller) =>
            seller.profiles.map((profile) => profile.countryCode).filter(Boolean),
          ),
        ),
      );

      if (nextMarketplaces.length === 0) {
        return;
      }

      setMarketplaces(nextMarketplaces);
      setMarketplace((currentMarketplace) =>
        nextMarketplaces.includes(currentMarketplace) ? currentMarketplace : nextMarketplaces[0]!,
      );
    });

    return () => {
      isMounted = false;
    };
  }, [show]);

  const handleCreatePolicy = async (): Promise<void> => {
    if (!isCreateEnabled) {
      return;
    }

    const nextScript = await ensureScriptProgram('Complete the rule before creating the policy.');
    if (nextScript === null) {
      return;
    }

    await handleCreate({
      id: null!,
      name: policyName,
      marketplace,
      script: nextScript,
    });
  };

  return (
    <Modal show={show} onClose={handleGuardedClose}>
      <PolicyModalTitlebar
        ruleType={ruleType}
        marketplace={marketplace}
        marketplaces={marketplaces}
        policyName={policyName}
        isConverting={isConverting}
        onRuleTypeChange={(nextRuleType) => void handleRuleTypeChange(nextRuleType)}
        onMarketplaceChange={setMarketplace}
        onPolicyNameChange={setPolicyName}
        onClose={handleGuardedClose}
      />
      <PolicyRuleEditor
        ruleType={ruleType}
        scriptProgram={scriptProgram}
        nestedProgram={nestedProgram}
        errorMessage={conversionError}
        onScriptChange={handleScriptChange}
        onNestedChange={handleNestedChange}
        onNestedSlotsFilledChange={setNestedSlotsFilled}
        onFocusCapture={handleEditorFocusCapture}
        onBlurCapture={handleEditorBlurCapture}
      />
      <div className="policy-modal-footer">
        <button
          className={`policy-modal-submit-btn ${isCreateEnabled ? 'is-enabled' : 'is-disabled'}`}
          disabled={!isCreateEnabled}
          onClick={() => void handleCreatePolicy()}
        >
          Create Policy
        </button>
      </div>
    </Modal>
  );
};

export default CreatePolicyModal;
