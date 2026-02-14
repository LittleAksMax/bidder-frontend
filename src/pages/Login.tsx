import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/ApiClient';
import AuthForm from '../components/auth/AuthForm';
import CenteredContainer from '../components/CenteredContainer';
import AuthRedirect from '../components/auth/AuthRedirect';
import { authClient } from '../api/AuthClient';

const Login: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resp = await authClient.login({
      email: email,
      password: password,
    });

    if (resp) {
      navigate('/');
    } else {
      alert('Login failed!');
    }
  };

  return (
    <CenteredContainer>
      <AuthForm title="Login" onSubmit={handleSubmit} submitLabel="Login">
        <input
          type="email"
          className="form-control mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          type="password"
          className="form-control mb-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        <AuthRedirect to="/register" />
      </AuthForm>
    </CenteredContainer>
  );
};

export default Login;
