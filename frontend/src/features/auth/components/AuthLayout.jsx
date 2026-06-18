import { Link } from 'react-router-dom';

const Logo = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#20b8cd" opacity=".85" />
    <path d="M2 17l10 5 10-5" stroke="#20b8cd" strokeWidth="2" fill="none" />
    <path d="M2 12l10 5 10-5" stroke="#20b8cd" strokeWidth="2" fill="none" />
  </svg>
);

const faviconOf = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
const DEMO_SOURCES = ['nasa.gov', 'wikipedia.org', 'nature.com'];

/**
 * Shared shell for Login + Register.
 * Left: brand panel matching the landing page (hidden on mobile).
 * Right: the form (passed as children). Props are unchanged, so the
 * existing Login.jsx / Register.jsx work without edits.
 */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen w-full flex bg-neutral-950 text-neutral-200 font-[Inter,sans-serif] antialiased selection:bg-cyan-500/30">

      <style>{`
        @keyframes caret { 0%,100%{ opacity: 1 } 50%{ opacity: 0 } }
        @keyframes floaty { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-6px) } }
      `}</style>

      {/* ─────────── Left brand panel ─────────── */}
      <aside className="hidden lg:flex w-1/2 relative overflow-hidden border-r border-white/5">
        {/* ambient + grid background (same language as the landing) */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-32 w-[40rem] h-[40rem] rounded-full bg-cyan-500/15 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
              backgroundSize: '56px 56px',
              maskImage: 'radial-gradient(ellipse 70% 60% at 30% 30%, #000 60%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 30% 30%, #000 60%, transparent 100%)',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <Logo />
            <span className="text-lg font-semibold text-white tracking-tight">Inquiro</span>
          </Link>

          <div className="max-w-md animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <h1 className="text-4xl xl:text-5xl font-semibold text-white leading-[1.05] tracking-tight">
              Where{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                knowledge
              </span>{' '}
              begins.
            </h1>
            <p className="mt-4 text-[15px] text-neutral-400 leading-relaxed">
              Ask anything and get clear, sourced answers in seconds — your questions and conversations, all in one place.
            </p>

            {/* mini product preview */}
            <div
              className="mt-8 rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur shadow-2xl shadow-black/40 overflow-hidden max-w-sm"
              style={{ animation: 'floaty 7s ease-in-out infinite' }}
            >
              <div className="flex items-center gap-2 px-4 h-10 border-b border-white/5">
                <span className="text-[11px] font-medium text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-400/10">Answer</span>
                <span className="text-[11px] text-neutral-500 px-2 py-0.5">Links</span>
                <span className="text-[11px] text-neutral-500 px-2 py-0.5">Images</span>
              </div>
              <div className="p-4">
                <div className="flex justify-end mb-3">
                  <div className="px-3 py-2 rounded-xl bg-neutral-800 text-neutral-100 text-[12px]">
                    Nearest star to the Sun?
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {DEMO_SOURCES.map((d) => (
                    <div key={d} className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-white/10 bg-neutral-900">
                      <img src={faviconOf(d)} alt="" className="w-3.5 h-3.5 rounded" />
                      <span className="text-[11px] text-neutral-400">{d}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[12px] leading-6 text-neutral-300">
                  <span className="text-white font-medium">Proxima Centauri</span>, about{' '}
                  <span className="text-white font-medium">4.24 light-years</span> away
                  <span
                    className="inline-block w-[2px] h-[12px] align-middle ml-0.5 bg-cyan-400"
                    style={{ animation: 'caret 1s step-end infinite' }}
                  />
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-600">© 2026 Inquiro · Built with React</p>
        </div>
      </aside>

      {/* ─────────── Right form panel ─────────── */}
      <main className="flex-1 flex items-center justify-center px-5 sm:px-6 py-10 sm:py-12 relative">
        {/* subtle glow on mobile where the left panel is hidden */}
        <div className="pointer-events-none absolute inset-0 lg:hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-cyan-500/10 blur-[100px]" />
        </div>

        <div className="relative w-full max-w-sm animate-fade-in px-1 sm:px-0">
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <Logo size={24} />
            <span className="text-lg font-semibold text-white tracking-tight">Inquiro</span>
          </Link>

          <h2 className="text-2xl font-semibold text-white tracking-tight animate-fade-in-up">{title}</h2>
          {subtitle && <p className="mt-1.5 text-sm text-neutral-400 animate-fade-in-up" style={{animationDelay: '0.06s'}}>{subtitle}</p>}

          <div className="mt-8 animate-fade-in-up" style={{animationDelay: '0.12s'}}>{children}</div>

          {footer && <div className="mt-6 text-center text-sm text-neutral-400 animate-fade-in" style={{animationDelay: '0.2s'}}>{footer}</div>}
        </div>
      </main>
    </div>
  );
}