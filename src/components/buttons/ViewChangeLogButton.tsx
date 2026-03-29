import { FC, MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';
import '../Modal.css';

interface ViewChangeLogButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
  buttonText?: string;
}

const viewChangeLogDefaultText = 'View Change Log';

const ViewChangeLogButton: FC<ViewChangeLogButtonProps> = ({
  onClick,
  className,
  disabled,
  buttonText = viewChangeLogDefaultText,
}) => (
  <Button
    className={['btn-changelog', 'btn-changelog-compact', className].filter(Boolean).join(' ')}
    size="sm"
    onClick={onClick}
    disabled={disabled}
  >
    {buttonText}
  </Button>
);

export default ViewChangeLogButton;
