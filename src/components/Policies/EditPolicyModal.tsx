import { FC } from 'react';
import Modal from '../Modal';
import { Policy, RULE_TYPES, RuleType } from '../../api/types';
import NestedPolicyRules from '../Rules/NestedPolicyRules';
import { EditorProvider } from '../Rules/EditorContext';
import PolicyInputs from './PolicyInputs';
import './PolicyInputs.css';
import './CreatePolicyModal.css';
import HelpButton from './HelpButton';

interface EditPolicyModalProps {
  show: boolean;
  onClose: () => void;
  policy: Policy | null;
}

const EditPolicyModal: FC<EditPolicyModalProps> = ({ show, onClose, policy }) => {
  let RuleComponent = null;
  if (policy?.type === 'nested') {
    RuleComponent = (
      <EditorProvider>
        <NestedPolicyRules
          rule={policy.rules} // Pass the existing rule to NestedPolicyRules
          onSlotsFilledChange={() => {}}
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
            value={policy?.name || ''}
            onChange={(e) => console.log('Policy name changed:', e.target.value)}
            className="input-field"
          />
        </div>
        <HelpButton section={policy?.type || ''} />
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="modal-body">{RuleComponent}</div>
    </Modal>
  );
};

export default EditPolicyModal;
