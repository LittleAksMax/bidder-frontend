import { FC, useState } from 'react';
import Modal from '../Modal';
import { MARKETPLACES, RULE_TYPES } from '../../api/types';
import NestedPolicyRules from '../Rules/NestedPolicyRules';
import { useNavigate } from 'react-router-dom';
import { EditorProvider } from '../Rules/EditorContext';

interface CreatePolicyModalProps {
  show: boolean;
  onClose: () => void;
}

const CreatePolicyModal: FC<CreatePolicyModalProps> = ({ show, onClose }) => {
  const [ruleType, setRuleType] = useState('nested');
  const [marketplace, setMarketplace] = useState('UK');
  const [allSlotsFilled, setAllSlotsFilled] = useState(false); // State for all slots filled
  const navigate = useNavigate();

  let RuleComponent = null;
  if (ruleType === RULE_TYPES[0]?.value) {
    RuleComponent = (
      <EditorProvider>
        <NestedPolicyRules
          onSlotsFilledChange={setAllSlotsFilled} // Pass callback to update state
        />
      </EditorProvider>
    );
  }

  const openHelpPage = () => {
    navigate(`/help#${ruleType}`);
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div className="modal-titlebar">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
          <select
            value={marketplace}
            onChange={(e) => setMarketplace(e.target.value)}
            style={{ fontWeight: 'bold', fontSize: '1.1rem' }}
          >
            {MARKETPLACES.map((mp) => (
              <option key={mp} value={mp}>
                {mp}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={openHelpPage}
          style={{
            backgroundColor: '#87CEEB', // Slightly darker blue
            color: 'white',
            border: '2px solid #87CEEB',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          ?
        </button>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="modal-body">{RuleComponent}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem' }}>
        <button
          style={{
            backgroundColor: allSlotsFilled ? 'green' : '#a9d3a9', // Grey-green when disabled
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
