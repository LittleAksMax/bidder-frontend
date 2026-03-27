import { FC, MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';
import { CreateIcon } from '../icons/Icon';
import '../Modal.css';

interface CreateButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
}

const CreateButton: FC<CreateButtonProps> = ({ onClick, className = '', disabled = false }) => (
  <Button
    className={`icon-btn icon-btn-green d-flex align-items-center justify-content-center ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    <CreateIcon />
  </Button>
);

export default CreateButton;
