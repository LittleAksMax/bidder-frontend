import { FC } from 'react';
import { Dropdown } from 'react-bootstrap';

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
      <Dropdown.Menu />
    </Dropdown>
  );
};

export default SettingsMenu;
