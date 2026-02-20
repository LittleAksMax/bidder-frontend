import { FC, useState, useEffect } from 'react';
import Modal from '../Modal';
import { Policy, RuleNode } from '../../api/types';
import NestedPolicyRules from '../Rules/NestedPolicyRules';
import { EditorProvider } from '../Rules/EditorContext';
import './PolicyInputs.css';
import './CreatePolicyModal.css';
import HelpButton from './HelpButton';

interface EditPolicyModalProps {
  show: boolean;
  onClose: () => void;
  policy: Policy | null;
  handleUpdate: (id: string, name: string, rules: RuleNode) => Promise<boolean>;
}

const EditPolicyModal: FC<EditPolicyModalProps> = ({ show, onClose, policy, handleUpdate }) => {
  const [policyName, setPolicyName] = useState<string>('');
  const [allSlotsFilled, setAllSlotsFilled] = useState<boolean>(false);
  const [rules, setRules] = useState<RuleNode | null>(null);

  // Update local state when policy changes
  useEffect(() => {
    if (policy) {
      console.log('[EditPolicyModal] Policy received:', policy);
      console.log('[EditPolicyModal] Policy rules:', JSON.stringify(policy.rules, null, 2));
      setPolicyName(policy.name);
      setRules(policy.rules);
    }
  }, [policy]);
  let RuleComponent = null;
  if (policy?.type === 'nested') {
    RuleComponent = (
      <EditorProvider key={policy.id}>
        <NestedPolicyRules
          rule={policy.rules}
          onSlotsFilledChange={setAllSlotsFilled}
          onRuleChange={setRules}
        />
      </EditorProvider>
    );
  }

  return (
    <Modal show={show} onClose={onClose}>
      <div className="modal-titlebar">
        <div className="dropdown-container">
          <select value={policy?.type || 'nested'} className="dropdown" disabled>
            <option>{policy?.type}</option>
          </select>
          <select value={policy?.marketplace || 'UK'} className="dropdown" disabled>
            <option>{policy?.marketplace}</option>
          </select>
          <input
            type="text"
            value={policyName}
            onChange={(e) => setPolicyName(e.target.value)}
            className="input-field"
          />
        </div>
        <HelpButton section={policy?.type || ''} />
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="modal-body">{RuleComponent}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem' }}>
        <button
          style={{
            backgroundColor: allSlotsFilled && policyName.trim() ? 'green' : '#a9d3a9',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: allSlotsFilled && policyName.trim() ? 'pointer' : 'not-allowed',
          }}
          disabled={!allSlotsFilled || !rules || !policy || !policyName.trim()}
          onClick={() => {
            if (policy && rules) {
              handleUpdate(policy.id, policyName, rules);
            }
          }}
        >
          Update Policy
        </button>
      </div>
    </Modal>
  );
};

export default EditPolicyModal;
