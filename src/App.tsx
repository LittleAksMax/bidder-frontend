import { FC } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RequireAuth from './pages/RequireAuth';
import Policies from './pages/Policies';
import Login from './pages/Login';
import Register from './pages/Register';
import FormPlaceholder from './components/Lists/FormPlaceholder';
import NotFound from './pages/NotFound';

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
        <Route path="/policies" element={<Policies />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/form" element={<FormPlaceholder />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
