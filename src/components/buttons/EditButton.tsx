import { FC, MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';
import { EditIcon } from '../icons/Icon';
import '../Modal.css';

interface EditButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

const EditButton: FC<EditButtonProps> = ({ onClick, className }) => (
  <Button
    className={`icon-btn icon-btn-yellow d-flex align-items-center justify-content-center ${className}`}
    onClick={onClick}
  >
    <EditIcon />
  </Button>
);

export default EditButton;
