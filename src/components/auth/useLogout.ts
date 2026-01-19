import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/ApiClient';

export const useLogout = () => {
  const navigate = useNavigate();
  return useCallback(() => {
    apiClient.setAuthenticated(false);
    navigate('/login');
  }, [navigate]);
};
