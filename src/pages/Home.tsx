import { FC, useEffect, useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CampaignsListContainer from '../components/Lists/CampaignsListContainer';
import Page from './Page';
import { MARKETPLACES } from '../api/types';

const Home: FC = () => {
  const navigate = useNavigate();
  const [marketplaces, setMarketplaces] = useState<string[]>([]);
  const [selectedMarketplace, setSelectedMarketplace] = useState<string | null>(null);

  useEffect(() => {
    setMarketplaces(Array.from(MARKETPLACES));
    setSelectedMarketplace(MARKETPLACES[0]);
  }, []);

  return (
    <Page showSettings>
      <div className="w-100 d-flex justify-content-between align-items-center mb-3">
        <Dropdown onSelect={(mkt) => setSelectedMarketplace(mkt || null)}>
          <Dropdown.Toggle variant="outline-secondary" id="marketplace-dropdown" size="sm">
            {selectedMarketplace || 'No Marketplaces'}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {marketplaces.length > 0
              ? marketplaces.map((mkt) => (
                  <Dropdown.Item key={mkt} eventKey={mkt} active={selectedMarketplace === mkt}>
                    {mkt}
                  </Dropdown.Item>
                ))
              : null}
          </Dropdown.Menu>
        </Dropdown>
        <Button variant="outline-primary" size="sm" onClick={() => navigate('/policies')}>
          Manage Policies
        </Button>
      </div>
      <CampaignsListContainer
        selectedMarketplace={marketplaces.length > 0 ? selectedMarketplace : null}
      />
    </Page>
  );
};

export default Home;
