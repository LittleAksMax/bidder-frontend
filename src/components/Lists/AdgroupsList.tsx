import { FC } from 'react';
import { ListGroup } from 'react-bootstrap';
import CampaignsListItem from './CampaignsListItem';
import { Adgroup } from '../../api/types';

interface AdgroupsListProps {
  adgroups: Adgroup[];
}

const AdgroupsList: FC<AdgroupsListProps> = ({ adgroups }) => {
  return (
    <ListGroup className="ms-4">
      {adgroups.map((adgroup) => (
        <CampaignsListItem key={adgroup.id}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span style={{ width: '8em', display: 'inline-block' }}>{adgroup.name}</span>
            <code style={{ width: '3.5em', display: 'inline-block' }}>{adgroup.defaultBid}</code>
            <code style={{ width: '3em', display: 'inline-block' }}>{adgroup.currencyCode}</code>
          </span>
        </CampaignsListItem>
      ))}
    </ListGroup>
  );
};

export default AdgroupsList;
