import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CampaignsListContainer from '../components/Lists/CampaignsListContainer';
import ChangeLogModal, { ChangeLogScope } from '../components/Lists/ChangeLogModal';
import HomeToolbar from '../components/Home/HomeToolbar';
import Page from './Page';
import { apiClient } from '../api/ApiClient';
import { ProfileGroup } from '../api/profile.types';
import { STORAGE_KEYS } from '../storageKeys';

const Home: FC = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState<ProfileGroup[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<ProfileGroup | null>(null);
  const [marketplaces, setMarketplaces] = useState<string[]>([]);
  const [selectedMarketplace, setSelectedMarketplace] = useState<string | null>(null);
  const [adgroupNamesById, setAdgroupNamesById] = useState<Record<string, string>>({});
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

  useEffect(() => {
    setAdgroupNamesById({});
  }, [selectedSeller?.id, selectedProfile?.profileId]);

  return (
    <Page showSettings>
      <HomeToolbar
        sellers={sellers}
        selectedSeller={selectedSeller}
        marketplaces={marketplaces}
        selectedMarketplace={selectedMarketplace}
        onSellerSelect={(sellerId) => {
          const seller = sellers.find((candidate) => candidate.id === sellerId) ?? null;
          setSelectedSeller(seller);
        }}
        onMarketplaceSelect={setSelectedMarketplace}
        onShowChangeLog={() => setShowChangeLog(true)}
        onViewSchedules={() => navigate('/schedules')}
        onViewPolicies={() => navigate('/policies')}
      />
      <CampaignsListContainer
        region={selectedProfile?.region ?? null}
        sellerId={selectedSeller?.id ?? null}
        profile={selectedProfile}
        selectionPending={selectionPending}
        onAdgroupNamesByIdChange={setAdgroupNamesById}
      />
      <ChangeLogModal
        show={showChangeLog}
        onHide={() => setShowChangeLog(false)}
        scope={changeLogScope}
        sellerId={selectedSeller?.id ?? null}
        profileId={selectedProfile?.profileId ?? null}
        adgroupNamesById={adgroupNamesById}
      />
    </Page>
  );
};

export default Home;
