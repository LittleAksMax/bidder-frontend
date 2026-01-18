import { FC } from 'react';
import { Badge } from 'react-bootstrap';
import { Policy } from '../api/types';

interface PolicyPillProps {
  policy: Policy;
  fontSize?: string | number;
}

const PolicyPill: FC<PolicyPillProps> = ({ policy, fontSize }) => (
  <Badge
    bg="info"
    pill
    className="ms-2"
    style={{
      padding: '0.2em 0.6em',
      lineHeight: 1,
      verticalAlign: 'middle',
      fontSize,
    }}
  >
    {policy.name}
  </Badge>
);

export default PolicyPill;
