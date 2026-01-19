import { FC, MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';
import { DeleteIcon } from '../icons/Icon';
import '../Modal.css';

interface DeleteButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const DeleteButton: FC<DeleteButtonProps> = ({ onClick }) => (
  <Button className="icon-btn icon-btn-red" onClick={onClick}>
    <DeleteIcon />
  </Button>
);

export default DeleteButton;
