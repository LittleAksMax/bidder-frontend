import { FC } from 'react';
import { Badge } from 'react-bootstrap';
import { RULE_TYPES, RuleType } from '../../api/types';

interface PolicyPillProps {
  ruleType: RuleType;
  fontSize?: string | number;
  colour?: string; // Bootstrap colour: 'info', 'success', etc.
}

const PolicyPill: FC<PolicyPillProps> = ({ ruleType, fontSize, colour = 'info' }) => (
  <Badge
    bg={colour}
    pill
    className="ms-2"
    style={{
      padding: '0.1em 0.3em',
      lineHeight: 1,
      verticalAlign: 'middle',
      width: '7em',
      fontSize,
    }}
  >
    {RULE_TYPES.find((r) => r.value === ruleType)?.label}
  </Badge>
);

export default PolicyPill;
