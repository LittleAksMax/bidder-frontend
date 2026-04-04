import { FC } from 'react';
import { RULE_TYPES, RuleType } from '../../api/nestedpolicy.types';
import HelpButton from './HelpButton';

interface PolicyModalTitlebarProps {
  ruleType: RuleType;
  marketplace: string;
  marketplaces: string[];
  policyName: string;
  isConverting: boolean;
  onRuleTypeChange: (ruleType: RuleType) => void;
  onMarketplaceChange?: (marketplace: string) => void;
  onPolicyNameChange: (name: string) => void;
  onClose: () => void;
}

const PolicyModalTitlebar: FC<PolicyModalTitlebarProps> = ({
  ruleType,
  marketplace,
  marketplaces,
  policyName,
  isConverting,
  onRuleTypeChange,
  onMarketplaceChange,
  onPolicyNameChange,
  onClose,
}) => (
  <div className="modal-titlebar">
    <div className="dropdown-container">
      <select
        value={ruleType}
        onChange={(event) => onRuleTypeChange(event.target.value as RuleType)}
        className="dropdown"
        disabled={isConverting}
      >
        {RULE_TYPES.map((rule) => (
          <option key={rule.value} value={rule.value}>
            {rule.label}
          </option>
        ))}
      </select>
      <select
        value={marketplace}
        onChange={
          onMarketplaceChange ? (event) => onMarketplaceChange(event.target.value) : undefined
        }
        className="dropdown"
        disabled={isConverting || !onMarketplaceChange}
      >
        {marketplaces.map((marketplaceOption) => (
          <option key={marketplaceOption} value={marketplaceOption}>
            {marketplaceOption}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={policyName}
        onChange={(event) => onPolicyNameChange(event.target.value)}
        placeholder="Enter policy name"
        className="input-field"
        disabled={isConverting}
      />
    </div>
    <HelpButton section={ruleType} />
    <button className="modal-close" onClick={onClose}>
      &times;
    </button>
  </div>
);

export default PolicyModalTitlebar;
