import { FC, MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';
import { CreateIcon } from '../icons/Icon';
import '../Modal.css';

interface CreateButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const CreateButton: FC<CreateButtonProps> = ({ onClick }) => (
  <Button className="icon-btn icon-btn-green" onClick={onClick}>
    <CreateIcon />
  </Button>
);

export default CreateButton;
