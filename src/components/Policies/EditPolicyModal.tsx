import { FC } from 'react';
import Modal from '../Modal';
import { RULE_TYPES, RuleType } from '../../api/types';
import NestedPolicyRules from '../Rules/NestedPolicyRules';

interface EditPolicyModalProps {
  show: boolean;
  onClose: () => void;
  ruleType?: RuleType; // default/fixed rule type
}

const EditPolicyModal: FC<EditPolicyModalProps> = ({ show, onClose, ruleType = 'range' }) => {
  let RuleComponent = null;
  if (ruleType === 'nested') RuleComponent = <NestedPolicyRules />;
  const ruleLabel = RULE_TYPES.find((rt) => rt.value === ruleType)?.label || ruleType;

  return (
    <Modal show={show} onClose={onClose}>
      <div className="modal-titlebar">
        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{ruleLabel}</span>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="modal-body">{RuleComponent}</div>
    </Modal>
  );
};

export default EditPolicyModal;
