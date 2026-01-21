import { FC } from 'react';
import { Dropdown } from 'react-bootstrap';
import { amazonClient } from '../api/amazonClient';

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
        <Dropdown.Item onClick={() => amazonClient.linkAccount()}>
          Link Amazon Account
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SettingsMenu;
