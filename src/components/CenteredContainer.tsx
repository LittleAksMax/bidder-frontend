import { FC, ReactNode } from 'react';

interface CenteredContainerProps {
  children: ReactNode;
}

const CenteredContainer: FC<CenteredContainerProps> = ({ children }) => (
  <div
    style={{
      minHeight: '100vh',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    }}
  >
    {children}
  </div>
);

export default CenteredContainer;
