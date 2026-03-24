import { FC } from 'react';
import { Badge } from 'react-bootstrap';
import './Pills.css';

interface MarketplacePillProps {
  marketplace: string;
  fontSize?: string | number;
  color?: string; // Bootstrap color: 'info', 'success', etc.
}

const getMarketplacePillSizeClass = (fontSize?: string | number): string => {
  if (fontSize === 18 || fontSize === '18' || fontSize === '18px') {
    return 'marketplace-pill-size-large';
  }
  return 'marketplace-pill-size-default';
};

const MarketplacePill: FC<MarketplacePillProps> = ({
  marketplace,
  fontSize,
  color = 'primary',
}) => (
  <Badge
    bg={color}
    pill
    className={`ms-2 marketplace-pill ${getMarketplacePillSizeClass(fontSize)}`}
  >
    {marketplace}
  </Badge>
);

export default MarketplacePill;
