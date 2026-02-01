import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreatePolicyModal.css';
import './HelpButton.css';

interface HelpButtonProps {
  section: string;
}

const HelpButton: FC<HelpButtonProps> = ({ section }) => {
  const navigate = useNavigate();

  const openHelpPage = () => {
    navigate(`/help#${section}`);
  };

  return (
    <button className="help-button" onClick={openHelpPage}>
      ?
    </button>
  );
};

export default HelpButton;
