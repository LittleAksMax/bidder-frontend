import { FC, useState } from 'react';
import Modal from '../Modal';
import { Marketplace, MARKETPLACES, RULE_TYPES, RuleType } from '../../api/types';
import NestedPolicyRules from '../Rules/NestedPolicyRules';
import { useNavigate } from 'react-router-dom';
import { EditorProvider } from '../Rules/EditorContext';
import './CreatePolicyModal.css';
import HelpButton from './HelpButton';

interface CreatePolicyModalProps {
  show: boolean;
  onClose: () => void;
}

const CreatePolicyModal: FC<CreatePolicyModalProps> = ({ show, onClose }) => {
  const [policyName, setPolicyName] = useState<string>('');
  const [ruleType, setRuleType] = useState<RuleType>('nested');
  const [marketplace, setMarketplace] = useState<Marketplace>('UK');
  const [allSlotsFilled, setAllSlotsFilled] = useState<boolean>(false);

  let RuleComponent = null;
  if (ruleType === RULE_TYPES[0]?.value) {
    RuleComponent = (
      <EditorProvider>
        <NestedPolicyRules onSlotsFilledChange={setAllSlotsFilled} rule={null} />
      </EditorProvider>
    );
  }

  return (
    <Modal show={show} onClose={onClose}>
      <div className="modal-titlebar">
        <div className="dropdown-container">
          <select
            value={ruleType}
            onChange={(e) => setRuleType(e.target.value as RuleType)}
            className="dropdown"
          >
            {RULE_TYPES.map((rt) => (
              <option key={rt.value} value={rt.value}>
                {rt.label}
              </option>
            ))}
          </select>
          <select
            value={marketplace}
            onChange={(e) => setMarketplace(e.target.value as Marketplace)}
            className="dropdown"
          >
            {MARKETPLACES.map((mp) => (
              <option key={mp} value={mp}>
                {mp}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={policyName}
            onChange={(e) => setPolicyName(e.target.value)}
            placeholder="Enter policy name"
            className="input-field"
          />
        </div>
        <HelpButton section={ruleType} />
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="modal-body">{RuleComponent}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem' }}>
        <button
          style={{
            backgroundColor: allSlotsFilled ? 'green' : '#a9d3a9',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: allSlotsFilled ? 'pointer' : 'not-allowed',
          }}
          disabled={!allSlotsFilled}
          onClick={() => console.log('created policy')}
        >
          Create Policy
        </button>
      </div>
    </Modal>
  );
};

export default CreatePolicyModal;
