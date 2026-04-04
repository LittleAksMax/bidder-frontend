import { FC } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { ProfileGroup } from '../../api/profile.types';
import ViewChangeLogButton from '../buttons/ViewChangeLogButton';
import PageToolbar from '../PageToolbar';

interface HomeToolbarProps {
  sellers: ProfileGroup[];
  selectedSeller: ProfileGroup | null;
  marketplaces: string[];
  selectedMarketplace: string | null;
  onSellerSelect: (sellerId: string | null) => void;
  onMarketplaceSelect: (marketplace: string | null) => void;
  onShowChangeLog: () => void;
  onViewSchedules: () => void;
  onViewPolicies: () => void;
}

const HomeToolbar: FC<HomeToolbarProps> = ({
  sellers,
  selectedSeller,
  marketplaces,
  selectedMarketplace,
  onSellerSelect,
  onMarketplaceSelect,
  onShowChangeLog,
  onViewSchedules,
  onViewPolicies,
}) => (
  <PageToolbar
    left={
      <div className="d-flex gap-2">
        <Dropdown onSelect={(sellerId) => onSellerSelect(sellerId ?? null)}>
          <Dropdown.Toggle variant="outline-secondary" id="seller-dropdown" size="sm">
            {selectedSeller?.name || 'No Sellers'}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {sellers.map((seller) => (
              <Dropdown.Item
                key={seller.id}
                eventKey={seller.id}
                active={selectedSeller?.id === seller.id}
              >
                {seller.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown onSelect={(marketplace) => onMarketplaceSelect(marketplace ?? null)}>
          <Dropdown.Toggle variant="outline-secondary" id="marketplace-dropdown" size="sm">
            {selectedMarketplace || 'No Marketplaces'}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {marketplaces.map((marketplace) => (
              <Dropdown.Item
                key={marketplace}
                eventKey={marketplace}
                active={selectedMarketplace === marketplace}
              >
                {marketplace}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <ViewChangeLogButton onClick={onShowChangeLog} disabled={selectedSeller === null} />
      </div>
    }
    right={
      <div className="d-flex gap-2">
        <Button variant="outline-primary" size="sm" onClick={onViewSchedules}>
          Schedules
        </Button>
        <Button variant="outline-primary" size="sm" onClick={onViewPolicies}>
          Manage Policies
        </Button>
      </div>
    }
  />
);

export default HomeToolbar;
