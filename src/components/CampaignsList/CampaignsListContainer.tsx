import { FC } from 'react';
import { Card } from 'react-bootstrap';
import CampaignsList from './CampaignsList';

interface CampaignsListContainerProps {
  listHeight?: string;
}

const CampaignsListContainer: FC<CampaignsListContainerProps> = ({ listHeight }) => (
  <Card style={{ marginTop: '1.5rem', marginBottom: '1.5rem', height: '100%', width: '100%' }}>
    <Card.Header className="bg-primary text-white">
      <h2 className="mb-0">Campaigns</h2>
    </Card.Header>
    <Card.Body style={{ flex: 1, width: '100%' }}>
      <CampaignsList />
    </Card.Body>
  </Card>
);

export default CampaignsListContainer;
