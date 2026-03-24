import { FC, useEffect, useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CampaignsListContainer from '../components/Lists/CampaignsListContainer';
import ChangeLogModal, { ChangeLogScope } from '../components/Lists/ChangeLogModal';
import ViewChangeLogButton from '../components/buttons/ViewChangeLogButton';
import Page from './Page';
import { apiClient } from '../api/ApiClient';
import { ProfileGroup } from '../api/types';

const STORAGE_KEYS = {
  sellerId: 'home.selectedSellerId',
  marketplace: 'home.selectedMarketplace',
};

const Home: FC = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState<ProfileGroup[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<ProfileGroup | null>(null);
  const [marketplaces, setMarketplaces] = useState<string[]>([]);
  const [selectedMarketplace, setSelectedMarketplace] = useState<string | null>(null);
  const [showChangeLog, setShowChangeLog] = useState(false);
  const [sellersLoaded, setSellersLoaded] = useState(false);
  const [hasInitialisedSelection, setHasInitialisedSelection] = useState(false);

  useEffect(() => {
    apiClient.getSellerProfiles().then((s) => {
      setSellers(s);
      const savedSellerId = window.localStorage.getItem(STORAGE_KEYS.sellerId);
      const savedSeller = savedSellerId
        ? (s.find((seller) => seller.id === savedSellerId) ?? null)
        : null;
      setSelectedSeller(savedSeller ?? s[0] ?? null);
      setSellersLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!sellersLoaded) {
      return;
    }

    if (selectedSeller) {
      const codes = selectedSeller.profiles.map((p) => p.countryCode);
      setMarketplaces(codes);
      const savedMarketplace = window.localStorage.getItem(STORAGE_KEYS.marketplace);
      const persistedMarketplace =
        savedMarketplace && codes.includes(savedMarketplace) ? savedMarketplace : null;
      setSelectedMarketplace(persistedMarketplace ?? codes[0] ?? null);
    } else {
      setMarketplaces([]);
      setSelectedMarketplace(null);
    }
    setHasInitialisedSelection(true);
  }, [selectedSeller, sellersLoaded]);

  useEffect(() => {
    if (!hasInitialisedSelection) {
      return;
    }

    if (selectedSeller?.id) {
      window.localStorage.setItem(STORAGE_KEYS.sellerId, selectedSeller.id);
      return;
    }
    window.localStorage.removeItem(STORAGE_KEYS.sellerId);
  }, [selectedSeller, hasInitialisedSelection]);

  useEffect(() => {
    if (!hasInitialisedSelection) {
      return;
    }

    if (selectedMarketplace) {
      window.localStorage.setItem(STORAGE_KEYS.marketplace, selectedMarketplace);
      return;
    }
    window.localStorage.removeItem(STORAGE_KEYS.marketplace);
  }, [selectedMarketplace, hasInitialisedSelection]);

  const selectedProfile =
    selectedSeller?.profiles.find((p) => p.countryCode === selectedMarketplace) ?? null;
  const selectionPending =
    selectedSeller !== null && selectedSeller.profiles.length > 0 && selectedProfile === null;
  const changeLogScope: ChangeLogScope = selectedProfile ? 'profile' : 'seller';

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
          <ViewChangeLogButton
            onClick={() => setShowChangeLog(true)}
            disabled={selectedSeller === null}
          />
        </div>
        <Button variant="outline-primary" size="sm" onClick={() => navigate('/policies')}>
          Manage Policies
        </Button>
      </div>
      <CampaignsListContainer
        region={selectedProfile?.region ?? null}
        sellerId={selectedSeller?.id ?? null}
        profile={selectedProfile}
        selectionPending={selectionPending}
      />
      <ChangeLogModal
        show={showChangeLog}
        onHide={() => setShowChangeLog(false)}
        scope={changeLogScope}
        sellerId={selectedSeller?.id ?? null}
        profileId={selectedProfile?.profileId ?? null}
      />
    </Page>
  );
};

export default Home;
