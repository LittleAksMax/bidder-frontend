import { FC } from 'react';
import { Link } from 'react-router-dom';

interface AuthRedirectProps {
  to: '/login' | '/register';
}

const AuthRedirect: FC<AuthRedirectProps> = ({ to }) => {
  const isLogin = to === '/login';
  return (
    <div className="text-center mt-3">
      {isLogin ? (
        <span>
          Already have an account? <Link to="/login">Log in</Link>
        </span>
      ) : (
        <span>
          Don't have an account? <Link to="/register">Register</Link>
        </span>
      )}
    </div>
  );
};

export default AuthRedirect;
