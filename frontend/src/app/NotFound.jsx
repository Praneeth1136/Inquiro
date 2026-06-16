import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-neutral-200 font-[Inter,sans-serif] px-4">
      <div className="flex items-center gap-2 mb-8">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#20b8cd" opacity=".85" />
          <path d="M2 17l10 5 10-5" stroke="#20b8cd" strokeWidth="2" fill="none" />
          <path d="M2 12l10 5 10-5" stroke="#20b8cd" strokeWidth="2" fill="none" />
        </svg>
        <span className="text-lg font-semibold text-white tracking-tight">Inquiro</span>
      </div>

      <p className="text-[64px] font-semibold text-white leading-none tracking-tight">404</p>
      <h1 className="mt-3 text-xl font-medium text-white">This page doesn&apos;t exist</h1>
      <p className="mt-2 text-sm text-neutral-400 text-center max-w-sm">
        The page you&apos;re looking for may have moved or never existed. Let&apos;s get you back.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-lg text-[14px] font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors"
        >
          Back home
        </Link>
        <Link
          to="/app"
          className="px-5 py-2.5 rounded-lg text-[14px] font-medium text-neutral-300 border border-neutral-700 hover:bg-neutral-800 transition-colors"
        >
          Open app
        </Link>
      </div>
    </div>
  );
}