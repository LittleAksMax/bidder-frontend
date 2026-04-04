import { FC, ReactNode } from 'react';
import { Container } from 'react-bootstrap';
import SettingsMenu from './SettingsMenu';
import AccountButton from './AccountButton';
import Loading from './Loading';
import './Page.css';

interface PageProps {
  children: ReactNode;
  showSettings?: boolean;
  loading?: boolean;
}

const Page: FC<PageProps> = ({ children, showSettings = false, loading = false }) => (
  <Container
    fluid
    className="vh-100 d-flex flex-column justify-content-center align-items-center p-0 position-relative page-root"
  >
    <div className="page-settings-actions">
      <SettingsMenu show={showSettings} />
      <AccountButton show={showSettings} />
    </div>
    <div className="page-content-shell">{loading ? <Loading /> : children}</div>
  </Container>
);

export default Page;
