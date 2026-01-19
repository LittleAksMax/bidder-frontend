import { FC, useState } from 'react';
import Page from './Page';
import AuthForm from '../components/auth/AuthForm';
import CenteredContainer from '../components/CenteredContainer';

const Register: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // handle register logic
  };

  return (
    <CenteredContainer>
      <AuthForm title="Register" onSubmit={handleSubmit} submitLabel="Register">
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
        <input
          type="password"
          className="form-control mb-2"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </AuthForm>
    </CenteredContainer>
  );
};

export default Register;
