import { FC, ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authClient } from '../api/AuthClient';
import Page from './Page';

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth: FC<RequireAuthProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await authClient.ensureAuthenticated();
      setIsAuthenticated(authenticated);
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return <Page loading>{null}</Page>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
