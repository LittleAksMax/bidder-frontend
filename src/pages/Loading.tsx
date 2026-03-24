import { FC } from 'react';
import { Spinner } from 'react-bootstrap';
import './Loading.css';

const Loading: FC = () => (
  <div className="loading-root">
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);

export default Loading;
