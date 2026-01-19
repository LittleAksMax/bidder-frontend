import { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { apiClient } from '../api/ApiClient';

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth: FC<RequireAuthProps> = ({ children }) => {
  if (!apiClient.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default RequireAuth;
