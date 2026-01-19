import { FC } from 'react';
import { Dropdown } from 'react-bootstrap';

interface AccountButtonProps {
  show: boolean;
}

const AccountButton: FC<AccountButtonProps> = ({ show }) => {
  if (!show) return null;
  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="secondary" id="account-dropdown" size="sm">
        <span className="bi bi-person" /> My Account
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item href="/login">Login</Dropdown.Item>
        <Dropdown.Item href="/register">Register</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AccountButton;
