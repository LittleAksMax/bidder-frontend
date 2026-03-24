import { FC, ReactNode } from 'react';
import { ListGroup } from 'react-bootstrap';
import './CampaignsListItem.css';

interface CampaignsListItemProps {
  children: ReactNode;
  className?: string;
}

const CampaignsListItem: FC<CampaignsListItemProps> = ({ children, className }) => (
  <ListGroup.Item className={['campaigns-list-item', className].filter(Boolean).join(' ')}>
    {children}
  </ListGroup.Item>
);

export default CampaignsListItem;
