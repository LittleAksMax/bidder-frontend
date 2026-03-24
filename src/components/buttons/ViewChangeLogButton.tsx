import { FC, MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';
import '../Modal.css';

interface ViewChangeLogButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
}

const ViewChangeLogButton: FC<ViewChangeLogButtonProps> = ({ onClick, className, disabled }) => (
  <Button
    className={['btn-changelog', 'btn-changelog-compact', className].filter(Boolean).join(' ')}
    size="sm"
    onClick={onClick}
    disabled={disabled}
  >
    View Change Log
  </Button>
);

export default ViewChangeLogButton;
