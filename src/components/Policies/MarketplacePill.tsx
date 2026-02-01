import { FC } from 'react';
import { Badge } from 'react-bootstrap';

interface MarketplacePillProps {
  marketplace: string;
  fontSize?: string | number;
  color?: string; // Bootstrap color: 'info', 'success', etc.
}

const MarketplacePill: FC<MarketplacePillProps> = ({
  marketplace,
  fontSize,
  color = 'primary',
}) => (
  <Badge
    bg={color}
    pill
    className="ms-2"
    style={{
      padding: '0.1em 0.3em',
      lineHeight: 1,
      verticalAlign: 'middle',
      width: '2em',
      fontSize,
    }}
  >
    {marketplace}
  </Badge>
);

export default MarketplacePill;
