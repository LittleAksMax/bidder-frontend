import { FC } from 'react';

interface PolicyNameProps {
  name: string;
}

const PolicyName: FC<PolicyNameProps> = ({ name }) => (
  <span style={{ width: '10em', display: 'inline-block' }}>{name}</span>
);

export default PolicyName;
