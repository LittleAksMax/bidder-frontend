import { FC } from 'react';
import { Marketplace, RuleType } from '../../api/types';

interface PolicyInputsProps {
  policyName: string;
  onPolicyNameChange: (name: string) => void;
  ruleType: RuleType;
  marketplace: Marketplace;
  isEditable: boolean;
}

const PolicyInputs: FC<PolicyInputsProps> = ({
  policyName,
  onPolicyNameChange,
  ruleType,
  marketplace,
  isEditable,
}) => (
  <div className="policy-inputs">
    <input
      type="text"
      value={policyName}
      onChange={(e) => onPolicyNameChange(e.target.value)}
      className="policy-input"
      disabled={!isEditable}
    />
    <select value={ruleType} className="policy-input" disabled>
      <option>{ruleType}</option>
    </select>
    <select value={marketplace} className="policy-input" disabled>
      <option>{marketplace}</option>
    </select>
  </div>
);

export default PolicyInputs;
