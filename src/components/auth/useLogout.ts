import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../../api/AuthClient';

export const useLogout = () => {
  const navigate = useNavigate();
  return useCallback(async () => {
    if (await authClient.logout()) {
      navigate('/login');
    }
  }, [navigate]);
};
