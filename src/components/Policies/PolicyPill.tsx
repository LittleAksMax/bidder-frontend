import { FC } from 'react';
import { Badge } from 'react-bootstrap';
import { RULE_TYPES, RuleType } from '../../api/types';
import './Pills.css';

interface PolicyPillProps {
  ruleType?: RuleType;
  label?: string;
  fontSize?: string | number;
  colour?: string; // Bootstrap colour: 'info', 'success', etc.
}

const getPolicyPillSizeClass = (fontSize?: string | number): string => {
  if (fontSize === 18 || fontSize === '18' || fontSize === '18px') {
    return 'policy-pill-size-large';
  }
  return 'policy-pill-size-default';
};

const PolicyPill: FC<PolicyPillProps> = ({ ruleType, label, fontSize, colour = 'info' }) => {
  const displayText =
    label ?? (ruleType ? RULE_TYPES.find((r) => r.value === ruleType)?.label ?? ruleType : 'Policy');

  return (
    <Badge
      bg={colour}
      pill
      className={`ms-2 policy-pill ${getPolicyPillSizeClass(fontSize)}`}
      aria-label={displayText}
      title={displayText}
    >
      {displayText}
    </Badge>
  );
};

export default PolicyPill;
