import { FC, useState } from 'react';
import { ListGroup } from 'react-bootstrap';
import CampaignsListItem from './CampaignsListItem';
import ExpandButton from './ExpandButton';
import { Adgroup } from '../../api/types';
import ProductsList from '../ProductsList';

interface AdgroupsListProps {
  adgroups: Adgroup[];
}

const AdgroupsList: FC<AdgroupsListProps> = ({ adgroups }) => {
  const [expanded, setExpanded] = useState<number[]>([]);
  const handleToggle = (id: number) => {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <ListGroup className="ms-4">
      {adgroups.map((adgroup) => (
        <CampaignsListItem key={adgroup.id}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <ExpandButton
              expanded={expanded.includes(adgroup.id)}
              onToggle={() => handleToggle(adgroup.id)}
              ariaLabel={expanded.includes(adgroup.id) ? 'Collapse adgroup' : 'Expand adgroup'}
              className="me-1"
            />
            <span style={{ verticalAlign: 'middle' }}>{adgroup.name}</span>
          </span>
          {expanded.includes(adgroup.id) && (
            <div className="mt-2">
              <ProductsList products={adgroup.products} />
            </div>
          )}
        </CampaignsListItem>
      ))}
    </ListGroup>
  );
};

export default AdgroupsList;
