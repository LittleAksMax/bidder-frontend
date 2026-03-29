import { FC, MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';
import { DoubleChevronIcon } from '../icons/Icon';
import '../Modal.css';

interface DoubleChevronButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
}

const DoubleChevronButton: FC<DoubleChevronButtonProps> = ({
  onClick,
  className = '',
  disabled = false,
}) => (
  <Button
    className={`icon-btn icon-btn-blue d-flex align-items-center justify-content-center ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    <DoubleChevronIcon />
  </Button>
);

export default DoubleChevronButton;
