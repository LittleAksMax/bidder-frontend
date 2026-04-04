import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface BackToHomeButtonProps {
  className?: string;
}

const BackToHomeButton: FC<BackToHomeButtonProps> = ({ className }) => {
  const navigate = useNavigate();

  return (
    <Button variant="outline-primary" size="sm" onClick={() => navigate('/')} className={className}>
      Back To Home
    </Button>
  );
};

export default BackToHomeButton;
