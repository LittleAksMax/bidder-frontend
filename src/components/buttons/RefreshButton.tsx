import { FC, MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';
import { RefreshIcon } from '../icons/Icon';
import '../Modal.css';

interface RefreshButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
}

const RefreshButton: FC<RefreshButtonProps> = ({ onClick, className = '', disabled = false }) => (
  <Button
    className={`icon-btn icon-btn-turquoise d-flex align-items-center justify-content-center ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    <RefreshIcon />
  </Button>
);

export default RefreshButton;
