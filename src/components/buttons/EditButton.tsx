import { FC, MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';
import { EditIcon } from '../icons/Icon';
import '../Modal.css';

interface EditButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const EditButton: FC<EditButtonProps> = ({ onClick }) => (
  <Button className="icon-btn icon-btn-yellow" onClick={onClick}>
    <EditIcon />
  </Button>
);

export default EditButton;
