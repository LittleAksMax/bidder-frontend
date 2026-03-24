import { FC } from 'react';
import './ExpandButton.css';

interface ExpandButtonProps {
  expanded: boolean;
  onToggle: () => void;
  ariaLabel?: string;
  className?: string;
}

const ExpandButton: FC<ExpandButtonProps> = ({ expanded, onToggle, ariaLabel, className }) => (
  <span
    role="button"
    tabIndex={0}
    onClick={onToggle}
    onKeyPress={(e) => {
      if (e.key === 'Enter' || e.key === ' ') onToggle();
    }}
    aria-label={ariaLabel || (expanded ? 'Collapse' : 'Expand')}
    className={['expand-button', className].filter(Boolean).join(' ')}
  >
    {expanded ? '-' : '+'}
  </span>
);

export default ExpandButton;
