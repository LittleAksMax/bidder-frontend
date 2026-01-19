import { FC } from 'react';
import { Badge } from 'react-bootstrap';

interface PolicyPillProps {
  policyName: string;
  fontSize?: string | number;
  color?: string; // Bootstrap color: 'info', 'success', etc.
}

const PolicyPill: FC<PolicyPillProps> = ({ policyName, fontSize, color = 'info' }) => (
  <Badge
    bg={color}
    pill
    className="ms-2"
    style={{
      padding: '0.1em 0.3em',
      lineHeight: 1,
      verticalAlign: 'middle',
      fontSize,
    }}
  >
    {policyName}
  </Badge>
);

export default PolicyPill;
