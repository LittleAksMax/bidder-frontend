import { FC } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RequireAuth from './pages/RequireAuth';
import Policies from './pages/Policies';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Help from './pages/Help';

const App: FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/policies"
          element={
            <RequireAuth>
              <Policies />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/help"
          element={
            <RequireAuth>
              <Help />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
