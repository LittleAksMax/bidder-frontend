import { FC } from 'react';
import { RULE_TYPES, RuleType } from '../../api/types';
import './PolicyPill.css';

interface PolicyPillProps {
  type: RuleType;
}

const PolicyPill: FC<PolicyPillProps> = ({ type }) => {
  const label = RULE_TYPES.find((rt) => rt.value === type)?.label || type;
  return (
    <span
      className="policy-pill-green"
      style={{
        marginLeft: 8,
        padding: '2px 10px',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '0.95em',
        background: '#198754',
        color: '#fff',
        display: 'inline-block',
      }}
    >
      {label}
    </span>
  );
};

export default PolicyPill;
