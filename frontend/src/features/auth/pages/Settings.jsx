import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/userAuth';

const Logo = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#20b8cd" opacity=".85" />
    <path d="M2 17l10 5 10-5" stroke="#20b8cd" strokeWidth="2" fill="none" />
    <path d="M2 12l10 5 10-5" stroke="#20b8cd" strokeWidth="2" fill="none" />
  </svg>
);

const formatDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '—';
  }
};

export default function Settings() {
  const user = useSelector((state) => state.auth.user);
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await handleLogout();
    navigate('/login');
  };

  // getMe may return the user directly or nested as { user }
  const me = user?.user || user || {};

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-[Inter,sans-serif] antialiased relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[40rem] h-[30rem] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      {/* top bar */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-[14px]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to app
          </Link>
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-base font-semibold text-white tracking-tight">Inquiro</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold text-white tracking-tight animate-fade-in-up">Settings</h1>
        <p className="mt-1.5 text-[15px] text-neutral-400 animate-fade-in-up" style={{animationDelay: '0.06s'}}>Manage your account.</p>

        {/* Profile card */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-neutral-900/50 p-6 animate-fade-in-up" style={{animationDelay: '0.12s'}}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center text-white text-lg font-semibold shrink-0">
              {me?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[16px] font-semibold text-white truncate">{me?.username || 'User'}</p>
                {me?.verified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-emerald-400 bg-emerald-400/10">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Verified
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium text-amber-400 bg-amber-400/10">Unverified</span>
                )}
              </div>
              <p className="text-[13px] text-neutral-500 truncate">{me?.email || ''}</p>
            </div>
          </div>

          <div className="mt-6 divide-y divide-white/5 border-t border-white/5">
            <div className="flex items-center justify-between py-3">
              <span className="text-[13px] text-neutral-500">Username</span>
              <span className="text-[13px] text-neutral-200">{me?.username || '—'}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-[13px] text-neutral-500">Email</span>
              <span className="text-[13px] text-neutral-200">{me?.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-[13px] text-neutral-500">Member since</span>
              <span className="text-[13px] text-neutral-200">{formatDate(me?.createdAt)}</span>
            </div>
          </div>
        </section>

        {/* Account actions */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-neutral-900/50 p-6 animate-fade-in-up" style={{animationDelay: '0.18s'}}>
          <p className="text-[13px] font-semibold text-neutral-300 mb-1">Account</p>
          <p className="text-[13px] text-neutral-500 mb-4">Sign out of your account on this device.</p>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[14px] font-medium text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log out
          </button>
        </section>
      </main>
    </div>
  );
}