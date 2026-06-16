import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../hooks/userAuth';
import { setError } from '../auth.slice';
import AuthLayout from '../components/AuthLayout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const { handleLogin, handleResendVerification } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const authError = useSelector((state) => state.auth.error);

  const needsVerification = !!authError && /verif/i.test(authError);

  // clear any stale error when arriving on this page
  useEffect(() => {
    dispatch(setError(null));
  }, [dispatch]);

  useEffect(() => {
    if (!loading && user) navigate('/app');
  }, [loading, user, navigate]);

  const clearMessages = () => {
    if (authError) dispatch(setError(null));
    if (resendMsg) setResendMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await handleLogin({ email, password });
      if (data?.user) navigate('/app');
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    setResending(true);
    setResendMsg('');
    const res = await handleResendVerification(email);
    if (res?.success) {
      dispatch(setError(null));
      setResendMsg('Verification email sent. Please check your inbox.');
    }
    setResending(false);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your conversations."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[13px] font-medium text-neutral-400 mb-1.5">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-[15px] text-white placeholder-neutral-500 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/30 transition"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[13px] font-medium text-neutral-400">Password</label>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-[15px] text-white placeholder-neutral-500 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/30 transition"
          />
        </div>

        {/* error / resend */}
        {authError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-300">
            {authError}
            {needsVerification && (
              <button
                type="button"
                onClick={onResend}
                disabled={resending || !email}
                className="block mt-1.5 text-cyan-400 hover:text-cyan-300 font-medium disabled:opacity-50"
              >
                {resending ? 'Sending…' : 'Resend verification email'}
              </button>
            )}
          </div>
        )}
        {resendMsg && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 text-[13px] text-emerald-300">
            {resendMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[15px] font-semibold rounded-lg transition-colors"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}