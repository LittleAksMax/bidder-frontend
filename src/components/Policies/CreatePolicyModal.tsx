import { FC, useState } from 'react';
import Modal from '../Modal';
import { Marketplace, MARKETPLACES, Policy, RULE_TYPES, RuleNode, RuleType } from '../../api/types';
import NestedPolicyRules from '../Rules/NestedPolicyRules';
import { EditorProvider } from '../Rules/EditorContext';
import './CreatePolicyModal.css';
import HelpButton from './HelpButton';

interface CreatePolicyModalProps {
  show: boolean;
  handleCreate: (p: Policy) => Promise<boolean>;
  onClose: () => void;
}

const CreatePolicyModal: FC<CreatePolicyModalProps> = ({ show, handleCreate, onClose }) => {
  const [policyName, setPolicyName] = useState<string>('');
  const [ruleType, setRuleType] = useState<RuleType>('nested');
  const [marketplace, setMarketplace] = useState<Marketplace>('UK');
  const [allSlotsFilled, setAllSlotsFilled] = useState<boolean>(false);
  const [rules, setRules] = useState<RuleNode | null>(null);

  let RuleComponent = null;
  if (ruleType === RULE_TYPES[0]?.value) {
    RuleComponent = (
      <EditorProvider>
        <NestedPolicyRules
          onSlotsFilledChange={setAllSlotsFilled}
          onRuleChange={setRules}
          rule={null}
        />
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
            backgroundColor: allSlotsFilled && policyName.trim() ? 'green' : '#a9d3a9',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: allSlotsFilled && policyName.trim() ? 'pointer' : 'not-allowed',
          }}
          disabled={!allSlotsFilled || !rules || !policyName.trim()}
          onClick={() =>
            handleCreate({
              id: null!,
              name: policyName,
              marketplace,
              type: ruleType,
              rules: rules!,
            })
          }
        >
          Create Policy
        </button>
      </div>
    </Modal>
  );
};

export default CreatePolicyModal;
