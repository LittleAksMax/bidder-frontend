import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

interface HelpButtonProps {
  section: string;
}

const HelpButton: FC<HelpButtonProps> = ({ section }) => {
  const navigate = useNavigate();
  const openHelpPage = () => {
    navigate(`/help#${section}`);
  };

  return (
    <button onClick={openHelpPage} className="help-button">
      ?
    </button>
  );
};

export default HelpButton;
