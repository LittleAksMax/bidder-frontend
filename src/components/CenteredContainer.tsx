import { FC, ReactNode } from 'react';
import './CenteredContainer.css';

interface CenteredContainerProps {
  children: ReactNode;
}

const CenteredContainer: FC<CenteredContainerProps> = ({ children }) => (
  <div className="centered-container">{children}</div>
);

export default CenteredContainer;
