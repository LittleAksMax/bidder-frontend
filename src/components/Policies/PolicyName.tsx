import { FC } from 'react';
import './Pills.css';

interface PolicyNameProps {
  name: string;
}

const PolicyName: FC<PolicyNameProps> = ({ name }) => (
  <span className="policy-name" aria-label={name} title={name}>
    {name}
  </span>
);

export default PolicyName;
