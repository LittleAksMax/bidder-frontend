import { FC } from 'react';
import { Dropdown } from 'react-bootstrap';
import { authClient } from '../api/AuthClient';
import { apiClient } from '../api/ApiClient';

const REGIONS = [
  { code: 'EU', label: 'Europe' },
  { code: 'US', label: 'North America' },
  { code: 'FE', label: 'Far East' },
];

interface LinkAmazonItemProps {
  region: string;
}

const LinkAmazonItem: FC<LinkAmazonItemProps> = ({ region }) => {
  const entry = REGIONS.find((r) => r.code === region);
  const label = entry ? entry.label : region;

  return (
    <Dropdown.Item
      onClick={async () => {
        if (!authClient.isAuthenticated()) {
          alert('Must log in before linking Amazon account!');
        } else {
          const url = await apiClient.getRedirectUrl(region);
          if (!url) {
            alert('Something went wrong when getting Amazon login URL');
            return;
          }
          window.location.href = url;
        }
      }}
    >
      Link Amazon ({label})
    </Dropdown.Item>
  );
};

interface SettingsMenuProps {
  show: boolean;
}

const SettingsMenu: FC<SettingsMenuProps> = ({ show }) => {
  if (!show) return null;
  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="secondary" id="settings-dropdown" size="sm">
        <span className="bi bi-gear" /> Settings
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {REGIONS.map((r) => (
          <LinkAmazonItem key={r.code} region={r.code} />
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SettingsMenu;
