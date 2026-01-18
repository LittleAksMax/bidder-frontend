import { FC } from 'react';
import { Dropdown } from 'react-bootstrap';

interface SettingsMenuProps {
  show: boolean;
}

const SettingsMenu: FC<SettingsMenuProps> = ({ show }) => {
  if (!show) return null;
  return (
    <div style={{ position: 'absolute', top: 16, right: 32, zIndex: 10 }}>
      <Dropdown align="end">
        <Dropdown.Toggle variant="secondary" id="settings-dropdown" size="sm">
          <span className="bi bi-gear" /> Settings
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item href="/login">Login</Dropdown.Item>
          <Dropdown.Item href="/register">Register</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default SettingsMenu;
