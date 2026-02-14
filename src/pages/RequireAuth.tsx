import { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { authClient } from '../api/AuthClient';

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth: FC<RequireAuthProps> = ({ children }) => {
  if (!authClient.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default RequireAuth;
