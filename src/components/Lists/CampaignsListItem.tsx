import { FC, ReactNode } from 'react';
import { ListGroup } from 'react-bootstrap';

interface CampaignsListItemProps {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const CampaignsListItem: FC<CampaignsListItemProps> = ({ children, style, className }) => (
  <ListGroup.Item
    style={{
      minHeight: 0,
      lineHeight: 1.2,
      marginTop: 2,
      ...style,
    }}
    className={className}
  >
    {children}
  </ListGroup.Item>
);

export default CampaignsListItem;
