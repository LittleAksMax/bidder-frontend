import { FC } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CampaignsListContainer from '../components/CampaignsList/CampaignsListContainer';
import Page from './Page';

const Home: FC = () => {
  const navigate = useNavigate();
  return (
    <Page showSettings>
      <Row className="w-100 flex-grow-1">
        <Col xs={12} className="mb-4">
          <div className="d-flex justify-content-end mb-3">
            <Button variant="outline-primary" size="sm" onClick={() => navigate('/policies')}>
              Manage Policies
            </Button>
          </div>
          <CampaignsListContainer />
        </Col>
      </Row>
    </Page>
  );
};

export default Home;
