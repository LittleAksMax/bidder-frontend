import { FC } from 'react';
import { Card } from 'react-bootstrap';
import CampaignsList from './CampaignsList';
import './CampaignsListContainer.css';
import { Profile } from '../../api/profile.types';

interface CampaignsListContainerProps {
  region: string | null;
  sellerId: string | null;
  profile: Profile | null;
  selectionPending: boolean;
  onAdgroupNamesByIdChange?: (adgroupNamesById: Record<string, string>) => void;
}

const CampaignsListContainer: FC<CampaignsListContainerProps> = ({
  region,
  sellerId,
  profile,
  selectionPending,
  onAdgroupNamesByIdChange,
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
        {...(onAdgroupNamesByIdChange ? { onAdgroupNamesByIdChange } : {})}
      />
    </Card.Body>
  </Card>
);

export default CampaignsListContainer;
