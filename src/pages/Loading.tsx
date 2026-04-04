import { FC } from 'react';
import { Spinner } from 'react-bootstrap';
import './Loading.css';

interface LoadingProps {
  className?: string;
  label?: string;
}

const Loading: FC<LoadingProps> = ({ className, label = 'Loading...' }) => (
  <div className={['loading-root', className].filter(Boolean).join(' ')}>
    <Spinner animation="border" role="status">
      <span className="visually-hidden">{label}</span>
    </Spinner>
  </div>
);

export default Loading;
