import { FC, ReactNode } from 'react';
import { Container } from 'react-bootstrap';
import SettingsMenu from './SettingsMenu';
import AccountButton from './AccountButton';

interface PageProps {
  children: ReactNode;
  showSettings?: boolean;
}

const Page: FC<PageProps> = ({ children, showSettings = false }) => (
  <Container
    fluid
    className="vh-100 d-flex flex-column justify-content-center align-items-center p-0 position-relative"
    style={{ background: '#f8f9fa' }}
  >
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 24,
        zIndex: 10,
        display: 'flex',
        gap: '0.5rem',
      }}
    >
      <SettingsMenu show={showSettings} />
      <AccountButton show={showSettings} />
    </div>
    <div
      style={{
        width: '90%',
        height: '90%',
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
        padding: '2rem 3.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        overflow: 'auto',
        fontSize: '1.05rem',
      }}
    >
      {children}
    </div>
  </Container>
);

export default Page;
