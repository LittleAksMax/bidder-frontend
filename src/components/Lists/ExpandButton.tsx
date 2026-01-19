import { FC } from 'react';

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
    className={className}
    style={{
      display: 'inline-block',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '1.1em',
      width: 20,
      textAlign: 'center',
      userSelect: 'none',
      lineHeight: 1,
      marginRight: 6,
    }}
  >
    {expanded ? '-' : '+'}
  </span>
);

export default ExpandButton;
