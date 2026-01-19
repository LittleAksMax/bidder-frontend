import { FC } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CampaignsListContainer from '../components/Lists/CampaignsListContainer';
import Page from './Page';

const Home: FC = () => {
  const navigate = useNavigate();
  return (
    <Page showSettings>
      <div className="d-flex justify-content-end mb-3">
        <Button variant="outline-primary" size="sm" onClick={() => navigate('/policies')}>
          Manage Policies
        </Button>
      </div>
      <CampaignsListContainer />
    </Page>
  );
};

export default Home;
