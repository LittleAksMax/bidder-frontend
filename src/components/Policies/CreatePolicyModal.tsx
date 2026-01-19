import { FC, useState } from 'react';
import Modal from '../Modal';
import RangeUpdateRules from './RangeUpdateRules';
import { RULE_TYPES } from '../../api/types';

interface CreatePolicyModalProps {
  show: boolean;
  onClose: () => void;
}

const CreatePolicyModal: FC<CreatePolicyModalProps> = ({ show, onClose }) => {
  const [ruleType, setRuleType] = useState('range');

  let RuleComponent = null;
  if (ruleType === 'range') RuleComponent = <RangeUpdateRules />;

  return (
    <Modal show={show} onClose={onClose}>
      <div className="modal-titlebar">
        <select
          value={ruleType}
          onChange={(e) => setRuleType(e.target.value)}
          style={{ fontWeight: 'bold', fontSize: '1.1rem' }}
        >
          {RULE_TYPES.map((rt) => (
            <option key={rt.value} value={rt.value}>
              {rt.label}
            </option>
          ))}
        </select>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="modal-body">{RuleComponent}</div>
    </Modal>
  );
};

export default CreatePolicyModal;
