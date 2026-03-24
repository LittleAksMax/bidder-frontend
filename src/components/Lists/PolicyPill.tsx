import { FC } from 'react';
import { RULE_TYPES, RuleType } from '../../api/types';
import './PolicyPill.css';

interface PolicyPillProps {
  type: RuleType;
}

const PolicyPill: FC<PolicyPillProps> = ({ type }) => {
  const label = RULE_TYPES.find((rt) => rt.value === type)?.label || type;
  return <span className="policy-pill-green policy-pill-green-list">{label}</span>;
};

export default PolicyPill;
