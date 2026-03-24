import { FC } from 'react';
import { Card } from 'react-bootstrap';
import CampaignsList from './CampaignsList';
import './CampaignsListContainer.css';
import { Profile } from '../../api/types';

interface CampaignsListContainerProps {
  region: string | null;
  sellerId: string | null;
  profile: Profile | null;
  selectionPending: boolean;
}

const CampaignsListContainer: FC<CampaignsListContainerProps> = ({
  region,
  sellerId,
  profile,
  selectionPending,
}) => (
  <Card className="campaigns-list-container-card">
    <Card.Header className="bg-primary text-white">
      <h2 className="mb-0">Campaigns</h2>
    </Card.Header>
    <Card.Body className="campaigns-list-container-body">
      <CampaignsList
        region={region}
        sellerId={sellerId}
        profile={profile}
        selectionPending={selectionPending}
      />
    </Card.Body>
  </Card>
);

export default CampaignsListContainer;
