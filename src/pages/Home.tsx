import { FC, useEffect, useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CampaignsListContainer from '../components/Lists/CampaignsListContainer';
import Page from './Page';
import { apiClient } from '../api/ApiClient';
import { ProfileGroup } from '../api/types';

const Home: FC = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState<ProfileGroup[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<ProfileGroup | null>(null);
  const [marketplaces, setMarketplaces] = useState<string[]>([]);
  const [selectedMarketplace, setSelectedMarketplace] = useState<string | null>(null);

  useEffect(() => {
    apiClient.getSellerProfiles().then((s) => {
      setSellers(s);
      if (s.length !== 0) {
        setSelectedSeller(s[0] ?? null);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedSeller) {
      const codes = selectedSeller.profiles.map((p) => p.countryCode);
      setMarketplaces(codes);
      setSelectedMarketplace(codes[0] ?? null);
    } else {
      setMarketplaces([]);
      setSelectedMarketplace(null);
    }
  }, [selectedSeller]);

  const selectedProfile =
    selectedSeller?.profiles.find((p) => p.countryCode === selectedMarketplace) ?? null;

  return (
    <Page showSettings>
      <div className="w-100 d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2">
          <Dropdown
            onSelect={(id) => {
              const seller = sellers.find((s) => s.id === id) ?? null;
              setSelectedSeller(seller);
            }}
          >
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
        </div>
        <Button variant="outline-primary" size="sm" onClick={() => navigate('/policies')}>
          Manage Policies
        </Button>
      </div>
      <CampaignsListContainer
        selectedMarketplace={marketplaces.length > 0 ? selectedMarketplace : null}
        region={selectedProfile?.region ?? null}
        profileId={selectedProfile?.profileId ?? null}
      />
    </Page>
  );
};

export default Home;
