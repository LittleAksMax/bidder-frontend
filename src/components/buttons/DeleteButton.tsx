import { FC, MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';
import { DeleteIcon } from '../icons/Icon';
import '../Modal.css';

interface DeleteButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

const DeleteButton: FC<DeleteButtonProps> = ({ onClick, className }) => (
  <Button
    className={`icon-btn icon-btn-red d-flex align-items-center justify-content-center ${className}`}
    onClick={onClick}
  >
    <DeleteIcon />
  </Button>
);

export default DeleteButton;
