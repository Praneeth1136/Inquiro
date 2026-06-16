import { createBrowserRouter, Navigate } from 'react-router-dom';
import Home from '../features/auth/pages/Home';
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import Settings from '../features/auth/pages/Settings';
import Dashboard from '../features/chat/pages/Dashboard';
import Protected from '../features/auth/components/Protected';
import NotFound from './NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/app',
    element: (
      <Protected>
        <Dashboard />
      </Protected>
    ),
  },
  {
    path: '/settings',
    element: (
      <Protected>
        <Settings />
      </Protected>
    ),
  },
  // keep old links working
  { path: '/dashboard', element: <Navigate to="/app" replace /> },
  // catch-all 404
  { path: '*', element: <NotFound /> },
]);