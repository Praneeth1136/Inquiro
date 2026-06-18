import { useDispatch } from 'react-redux';
import { setUser, setLoading, setError } from '../auth.slice';
import { register, login, logout, resendVerification, getMe } from '../services/auth.api';
import { disconnectSocket } from '../../chat/services/chat.socket';

export function useAuth() {
  const dispatch = useDispatch();

  async function handleRegister({ username, email, password }) {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await register({ username, email, password });
      return data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Registration failed'));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogin({ email, password }) {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await login({ email, password });
      if (data && data.user) {
        dispatch(setUser(data.user));
      }
      return data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Login failed'));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleResendVerification(email) {
    try {
      const data = await resendVerification({ email });
      return data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Could not resend verification email'));
      return null;
    }
  }

  async function handleLogout() {
    try {
      await logout();
      disconnectSocket();
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Logout failed'));
    } finally {
      dispatch(setUser(null));
    }
  }

  async function handleGetMe() {
    try {
      dispatch(setLoading(true));
      const data = await getMe();
      dispatch(setUser(data.user));
    } catch (error) {
      // not logged in is an expected case here — don't surface it as an error
      dispatch(setUser(null));
    } finally {
      dispatch(setLoading(false));
    }
  }

  return { handleRegister, handleLogin, handleResendVerification, handleLogout, handleGetMe };
}