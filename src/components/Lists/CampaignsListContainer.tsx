import { FC } from 'react';
import { Card } from 'react-bootstrap';
import CampaignsList from './CampaignsList';

interface CampaignsListContainerProps {
  selectedMarketplace?: string | null;
}

const CampaignsListContainer: FC<CampaignsListContainerProps> = ({ selectedMarketplace }) => (
  <Card style={{ height: '100%', width: '100%' }}>
    <Card.Header className="bg-primary text-white">
      <h2 className="mb-0">Campaigns</h2>
    </Card.Header>
    <Card.Body style={{ flex: 1, width: '100%' }}>
      <CampaignsList selectedMarketplace={selectedMarketplace} />
    </Card.Body>
  </Card>
);

export default CampaignsListContainer;
