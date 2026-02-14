import { FC, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/ApiClient';
import AuthForm from '../components/auth/AuthForm';
import CenteredContainer from '../components/CenteredContainer';
import AuthRedirect from '../components/auth/AuthRedirect';
import { authClient } from '../api/AuthClient';

const Register: FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const resp = await authClient.register({
      email: email,
      username: username,
      password: password,
    });

    if (resp) {
      navigate('/');
    } else {
      alert('Registration failed!');
    }
  };

  return (
    <CenteredContainer>
      <AuthForm title="Register" onSubmit={handleSubmit} submitLabel="Register">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
        <input
          type="email"
          className="form-control mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
          required
        />
        <input
          type="password"
          className="form-control mb-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <input
          type="password"
          className="form-control mb-2"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="off"
          required
        />
        <AuthRedirect to="/login" />
      </AuthForm>
    </CenteredContainer>
  );
};

export default Register;
