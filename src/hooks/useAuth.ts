import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const store = useAuthStore();
  const navigate = useNavigate();
  
  return {
    ...store,
    goToLogin: () => navigate('/login'),
    goToRegister: () => navigate('/register'),
    goToDashboard: () => navigate('/dashboard'),
    requireAuth: () => { if (!store.isAuthenticated) navigate('/login'); },
  };
};
