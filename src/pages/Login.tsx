import { FC, useState } from 'react';
import Page from './Page';
import AuthForm from './AuthForm';
import CenteredContainer from '../components/CenteredContainer';

const Login: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // handle login logic
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
          required
        />
        <input
          type="password"
          className="form-control mb-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </AuthForm>
    </CenteredContainer>
  );
};

export default Login;
