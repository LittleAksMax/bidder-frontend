import { FC, useState } from 'react';
import Modal from '../Modal';
import { Policy } from '../../api/policy.types';
import './CreatePolicyModal.css';
import PolicyModalTitlebar from './PolicyModalTitlebar';
import PolicyRuleEditor from './PolicyRuleEditor';
import useGuardedEditorClose from './useGuardedEditorClose';
import usePolicyRuleEditor from './usePolicyRuleEditor';

interface EditPolicyModalProps {
  show: boolean;
  onClose: () => void;
  policy: Policy | null;
  handleUpdate: (id: string, name: string, script: string) => Promise<boolean>;
}

type EditPolicyModalBodyProps = Omit<EditPolicyModalProps, 'show' | 'onClose'>;
type EditPolicyModalFocusProps = {
  onGuardedClose: () => void;
  onEditorFocusCapture: () => void;
  onEditorBlurCapture: () => void;
};

const EditPolicyModalBody: FC<EditPolicyModalBodyProps & EditPolicyModalFocusProps> = ({
  policy,
  handleUpdate,
  onGuardedClose,
  onEditorFocusCapture,
  onEditorBlurCapture,
}) => {
  const [policyName, setPolicyName] = useState<string>(policy?.name ?? '');
  const [marketplace] = useState<string>(policy?.marketplace ?? 'EU');
  const {
    ruleType,
    scriptProgram,
    nestedProgram,
    isConverting,
    conversionError,
    isRuleComplete,
    setNestedSlotsFilled,
    handleScriptChange,
    handleNestedChange,
    handleRuleTypeChange,
    ensureScriptProgram,
  } = usePolicyRuleEditor({
    initialScript: policy?.script ?? '',
  });
  const isUpdateEnabled =
    Boolean(policy) && Boolean(policyName.trim()) && isRuleComplete && !isConverting;

  const handleUpdatePolicy = async (): Promise<void> => {
    if (!policy || !isUpdateEnabled) {
      return;
    }

    const nextScript = await ensureScriptProgram('Complete the rule before updating the policy.');
    if (nextScript === null) {
      return;
    }

    await handleUpdate(policy.id, policyName, nextScript);
  };

  return (
    <>
      <PolicyModalTitlebar
        ruleType={ruleType}
        marketplace={marketplace}
        marketplaces={[marketplace]}
        policyName={policyName}
        isConverting={isConverting}
        onRuleTypeChange={(nextRuleType) => void handleRuleTypeChange(nextRuleType)}
        onPolicyNameChange={setPolicyName}
        onClose={onGuardedClose}
      />
      <PolicyRuleEditor
        ruleType={ruleType}
        scriptProgram={scriptProgram}
        nestedProgram={nestedProgram}
        errorMessage={conversionError}
        onScriptChange={handleScriptChange}
        onNestedChange={handleNestedChange}
        onNestedSlotsFilledChange={setNestedSlotsFilled}
        onFocusCapture={onEditorFocusCapture}
        onBlurCapture={onEditorBlurCapture}
      />
      <div className="policy-modal-footer">
        <button
          className={`policy-modal-submit-btn ${isUpdateEnabled ? 'is-enabled' : 'is-disabled'}`}
          disabled={!isUpdateEnabled}
          onClick={() => void handleUpdatePolicy()}
        >
          Update Policy
        </button>
      </div>
    </>
  );
};

const EditPolicyModal: FC<EditPolicyModalProps> = ({ show, onClose, policy, handleUpdate }) => {
  const { handleEditorFocusCapture, handleEditorBlurCapture, handleGuardedClose } =
    useGuardedEditorClose(show, onClose);

  return (
    <Modal show={show} onClose={handleGuardedClose}>
      <EditPolicyModalBody
        key={policy?.id ?? 'no-policy-selected'}
        policy={policy}
        handleUpdate={handleUpdate}
        onGuardedClose={handleGuardedClose}
        onEditorFocusCapture={handleEditorFocusCapture}
        onEditorBlurCapture={handleEditorBlurCapture}
      />
    </Modal>
  );
};

export default EditPolicyModal;
