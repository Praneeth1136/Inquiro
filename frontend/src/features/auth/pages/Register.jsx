import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../hooks/userAuth';
import { setError } from '../auth.slice';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const { handleRegister } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const authError = useSelector((state) => state.auth.error);

  useEffect(() => {
    dispatch(setError(null));
  }, [dispatch]);

  useEffect(() => {
    if (!loading && user) navigate('/app');
  }, [loading, user, navigate]);

  const clearMessages = () => {
    if (authError) dispatch(setError(null));
    if (successMsg) setSuccessMsg('');
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await handleRegister({ username, email, password });
      if (result) {
        setSuccessMsg('Account created! Check your email to verify, then sign in.');
        // brief pause so the user sees the message, then go to login
        setTimeout(() => navigate('/login'), 1400);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start asking questions in under a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[13px] font-medium text-neutral-400 mb-1.5">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); clearMessages(); }}
            required
            minLength={6}
            autoComplete="username"
            placeholder="Choose a username (min 6 chars)"
            className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-[15px] text-white placeholder-neutral-500 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/30 transition"
          />
        </div>

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
          <label className="block text-[13px] font-medium text-neutral-400 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Create a strong password"
            className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-[15px] text-white placeholder-neutral-500 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/30 transition"
          />
          <p className="mt-1.5 text-[12px] text-neutral-500">Use at least 6 characters.</p>
        </div>

        {authError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-300">
            {authError}
          </div>
        )}
        {successMsg && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 text-[13px] text-emerald-300">
            {successMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[15px] font-semibold rounded-lg transition-colors"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}