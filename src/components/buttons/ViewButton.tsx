import { FC, MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';
import { EyeIcon } from '../icons/Icon';
import '../Modal.css';

interface ViewButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
}

const ViewButton: FC<ViewButtonProps> = ({ onClick, className = '', disabled = false }) => (
  <Button
    className={`icon-btn icon-btn-turquoise d-flex align-items-center justify-content-center ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    <EyeIcon />
  </Button>
);

export default ViewButton;
