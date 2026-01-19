import { FC } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useLogout } from '../components/auth/useLogout';

interface AccountButtonProps {
  show: boolean;
}

const AccountButton: FC<AccountButtonProps> = ({ show }) => {
  const logout = useLogout();
  if (!show) return null;
  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="secondary" id="account-dropdown" size="sm">
        <span className="bi bi-person" /> My Account
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={logout}>Log out</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AccountButton;
