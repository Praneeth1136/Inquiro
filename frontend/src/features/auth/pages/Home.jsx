import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Logo = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#20b8cd" opacity=".85" />
    <path d="M2 17l10 5 10-5" stroke="#20b8cd" strokeWidth="2" fill="none" />
    <path d="M2 12l10 5 10-5" stroke="#20b8cd" strokeWidth="2" fill="none" />
  </svg>
);

const faviconOf = (domain) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

const DEMO_SOURCES = ['nasa.gov', 'wikipedia.org', 'nature.com', 'space.com'];

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-[Inter,sans-serif] antialiased selection:bg-cyan-500/30">

      {/* local keyframes */}
      <style>{`
        @keyframes floaty { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-8px) } }
        @keyframes caret { 0%,100%{ opacity: 1 } 50%{ opacity: 0 } }
      `}</style>

      {/* ─────────── NAV ─────────── */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-neutral-950/70 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-semibold text-white tracking-tight">Inquiro</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[14px] text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 rounded-lg text-[14px] font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="px-4 py-2 rounded-lg text-[14px] font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/20">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────── HERO ─────────── */}
      <section className="relative overflow-hidden">
        {/* ambient + grid background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[55rem] h-[40rem] rounded-full bg-cyan-500/15 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
              backgroundSize: '56px 56px',
              maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 60%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 60%, transparent 100%)',
            }}
          />
        </div>

        <div className="max-w-3xl mx-auto px-6 pt-24 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-white/10 bg-white/5 text-[12px] text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Answers, not just links
          </div>

          <h1 className="text-5xl sm:text-7xl font-semibold text-white tracking-tight leading-[0.95]">
            Where{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              knowledge
            </span>
            <br />begins.
          </h1>

          <p className="mt-7 text-[17px] sm:text-[19px] text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Ask anything and get a clear, sourced answer in seconds — then keep the conversation going.
          </p>

          <form
            onSubmit={onSubmit}
            className="group mt-10 flex items-center gap-2 max-w-xl mx-auto bg-neutral-900/80 border border-white/10 rounded-2xl px-4 py-3 shadow-2xl shadow-black/40 focus-within:border-cyan-500/60 focus-within:ring-4 focus-within:ring-cyan-500/10 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-500 shrink-0">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything…"
              className="flex-1 bg-transparent text-[15px] text-neutral-200 placeholder-neutral-500 outline-none"
            />
            <button type="submit" className="shrink-0 px-4 py-1.5 rounded-xl text-[14px] font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors">
              Search
            </button>
          </form>
          <p className="mt-3 text-[12px] text-neutral-600">Free to start · No credit card</p>
        </div>

        {/* ── Product preview mockup (show, don't tell) ── */}
        <div className="max-w-3xl mx-auto px-6 pb-24">
          <div
            className="rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur shadow-2xl shadow-black/50 overflow-hidden"
            style={{ animation: 'floaty 7s ease-in-out infinite' }}
          >
            {/* mock window bar */}
            <div className="flex items-center gap-2 px-4 h-11 border-b border-white/5">
              <span className="text-[12px] font-medium text-cyan-400 px-2.5 py-1 rounded-full bg-cyan-400/10">Answer</span>
              <span className="text-[12px] text-neutral-500 px-2.5 py-1">Links</span>
              <span className="text-[12px] text-neutral-500 px-2.5 py-1">Images</span>
            </div>

            <div className="p-6 text-left">
              {/* user question */}
              <div className="flex justify-end mb-5">
                <div className="px-4 py-2.5 rounded-2xl bg-neutral-800 text-neutral-100 text-[14px]">
                  How far is the nearest star to the Sun?
                </div>
              </div>

              {/* source pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {DEMO_SOURCES.map((d) => (
                  <div key={d} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-white/10 bg-neutral-900">
                    <img src={faviconOf(d)} alt="" className="w-4 h-4 rounded" />
                    <span className="text-[12px] text-neutral-400">{d}</span>
                  </div>
                ))}
              </div>

              {/* answer */}
              <p className="text-[14px] leading-7 text-neutral-300">
                The nearest star to the Sun is <span className="text-white font-medium">Proxima Centauri</span>, located about{' '}
                <span className="text-white font-medium">4.24 light-years</span> away in the Alpha Centauri system. It&apos;s a small red dwarf and hosts at least one known exoplanet in its habitable zone
                <span
                  className="inline-block w-[2px] h-[15px] align-middle ml-0.5 bg-cyan-400"
                  style={{ animation: 'caret 1s step-end infinite' }}
                />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── FEATURES (bento) ─────────── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-12">
        <div className="max-w-xl mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Built for people who ask questions.
          </h2>
          <p className="mt-3 text-[16px] text-neutral-400">
            Not a search engine that hands you ten blue links. A research partner that reads the web and answers.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 md:auto-rows-[200px]">
          {/* big feature */}
          <div className="md:col-span-2 md:row-span-2 rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-900 to-neutral-900/30 p-7 flex flex-col justify-between">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#20b8cd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Sourced answers</h3>
              <p className="mt-2 text-[14px] text-neutral-400 leading-relaxed max-w-sm">
                Every response is grounded in real web results and shows its sources, so you can verify what you read and dig deeper with one click.
              </p>
            </div>
          </div>

          {/* small features */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/40 p-6 hover:border-white/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#20b8cd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-white">Follow-ups</h3>
            <p className="mt-1.5 text-[13px] text-neutral-400 leading-relaxed">Ask, refine, keep going — your thread remembers the context.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-neutral-900/40 p-6 hover:border-white/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#20b8cd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-white">Saved history</h3>
            <p className="mt-1.5 text-[13px] text-neutral-400 leading-relaxed">Every search lives in a tidy history, ready to revisit anytime.</p>
          </div>
        </div>
      </section>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight text-center mb-14">
          Three steps. Seconds, not tabs.
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { n: '01', t: 'Ask in plain language', d: 'Type your question the way you\u2019d ask a friend. No keywords, no operators.' },
            { n: '02', t: 'We search the live web', d: 'Behind the scenes we read multiple sources and pull the relevant facts.' },
            { n: '03', t: 'Get a sourced answer', d: 'A clear, written answer with the links it came from — then ask a follow-up.' },
          ].map((s) => (
            <div key={s.n} className="relative">
              <span className="text-[44px] font-semibold text-white/10 leading-none">{s.n}</span>
              <h3 className="mt-3 text-[16px] font-semibold text-white">{s.t}</h3>
              <p className="mt-2 text-[14px] text-neutral-400 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── CTA ─────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-600/20 via-neutral-900 to-neutral-900 p-12 text-center">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl" />
          <h2 className="relative text-3xl sm:text-4xl font-semibold text-white tracking-tight">Start asking today</h2>
          <p className="relative mt-3 text-[16px] text-neutral-300">Create an account and run your first search in under a minute.</p>
          <Link
            to="/register"
            className="relative inline-block mt-8 px-7 py-3 rounded-xl text-[15px] font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/25"
          >
            Get started — it&apos;s free
          </Link>
        </div>
      </section>

      {/* ─────────── FOOTER ─────────── */}
      <footer className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <Logo size={22} />
              <span className="text-base font-semibold text-white">Inquiro</span>
            </div>
            <p className="mt-3 text-[13px] text-neutral-500 max-w-xs">Where knowledge begins.</p>
          </div>

          {[
            { h: 'Product', items: ['Features', 'How it works', 'Pricing'] },
            { h: 'Company', items: ['About', 'Blog', 'Careers'] },
            { h: 'Legal', items: ['Privacy', 'Terms', 'Contact'] },
          ].map((col) => (
            <div key={col.h}>
              <p className="text-[13px] font-semibold text-neutral-300 mb-3">{col.h}</p>
              <ul className="space-y-2">
                {col.items.map((i) => (
                  <li key={i}>
                    <a href="#" className="text-[13px] text-neutral-500 hover:text-neutral-300 transition-colors">{i}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[12px] text-neutral-600">© 2026 Inquiro · Built with React &amp; Tailwind</p>
            <p className="text-[12px] text-neutral-600">A personal project, not affiliated with Perplexity AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}