import { FC, ReactNode, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { DeleteIcon } from '../icons/Icon';
import '../Modal.css';

export interface DeleteButtonConfirmation {
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface DeleteButtonProps {
  onClick?: () => void | Promise<void>;
  className?: string;
  disabled?: boolean;
  confirmation: DeleteButtonConfirmation;
}

const DeleteButton: FC<DeleteButtonProps> = ({
  onClick,
  className = '',
  disabled = false,
  confirmation,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async (): Promise<void> => {
    if (!onClick) {
      setShowConfirmation(false);
      return;
    }

    setIsSubmitting(true);

    try {
      await onClick();
      setShowConfirmation(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        className={`icon-btn icon-btn-red d-flex align-items-center justify-content-center ${className}`}
        onClick={() => setShowConfirmation(true)}
        disabled={disabled}
      >
        <DeleteIcon />
      </Button>
      <Modal
        show={showConfirmation}
        onHide={() => setShowConfirmation(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title>{confirmation.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{confirmation.body}</Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowConfirmation(false)}
            disabled={isSubmitting}
          >
            {confirmation.cancelLabel ?? 'Cancel'}
          </Button>
          <Button variant="danger" onClick={() => void handleConfirm()} disabled={isSubmitting}>
            {confirmation.confirmLabel ?? 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeleteButton;
