import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../../auth/hooks/userAuth';
import { setCurrentChatId, setError } from '../chat.Slice';
import ReactMarkdown from 'react-markdown';

const SUGGESTIONS = [
  { text: 'Explain quantum computing in simple terms', icon: <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 4a6 6 0 1 1-6 6 6 6 0 0 1 6-6z" /> },
  { text: 'What happened in tech news this week?', icon: <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2M18 14h-8M15 18h-5M10 6h8v4h-8z" /> },
  { text: 'Compare React and Vue for a new project', icon: <path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7" /> },
  { text: 'Give me a 3-day itinerary for Tokyo', icon: <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" /> },
];

const domainOf = (url) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } };
const faviconOf = (url) => `https://www.google.com/s2/favicons?domain=${domainOf(url)}&sz=64`;

const Dots = () => (
  <div className="flex items-center gap-1.5 py-1">
    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]" />
    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]" />
  </div>
);

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const currentChat = useSelector((state) => state.chat.chats[state.chat.currentChatId]);
  const isLoading = useSelector((state) => state.chat.isLoading);
  const isOpeningChat = useSelector((state) => state.chat.isOpeningChat);
  const chatError = useSelector((state) => state.chat.error);
  const chats = useSelector((state) => state.chat.chats);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('answer');
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuChatId, setMenuChatId] = useState(null);
  const [toast, setToast] = useState(null);

  const { handleSendMessage, initializeSocketConnection, handleGetChats, handleOpenChat, handleDeleteChat } = useChat();
  const { handleLogout } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const toastTimer = useRef(null);

  const chatList = Object.values(chats || {}).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
  const messages = currentChat?.messages || [];

  const lastAi = [...messages].reverse().find((m) => m.role === 'ai');
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const sources = lastAi?.sources || [];
  const images = lastAi?.images || [];
  const isStreaming = messages.some((m) => m.streaming);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    initializeSocketConnection();
    handleGetChats();
  }, []);

  // surface chat errors as a toast
  useEffect(() => {
    if (chatError) {
      showToast(chatError);
      dispatch(setError(null));
    }
  }, [chatError, dispatch]);

  useEffect(() => {
    const onClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    const onClick = (e) => { if (!e.target.closest?.('[data-chatmenu]')) setMenuChatId(null); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const openChat = (chatId) => { setActiveTab('answer'); handleOpenChat(chatId); };
  const handleNewChat = () => { dispatch(setCurrentChatId(null)); setInput(''); setActiveTab('answer'); };
  const onLogout = async () => { setMenuOpen(false); await handleLogout(); navigate('/login'); };
  const onDelete = async (e, chatId) => { e.stopPropagation(); setMenuChatId(null); await handleDeleteChat(chatId); };

  const onShare = async () => {
    if (!lastAi?.content) { showToast('Nothing to share yet'); return; }
    const text = `${lastUser?.content || ''}\n\n${lastAi.content}`.trim();
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Inquiro answer', text });
      } else {
        await navigator.clipboard.writeText(text);
        showToast('Answer copied to clipboard');
      }
    } catch {
      /* user dismissed the share sheet — ignore */
    }
  };

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    setActiveTab('answer');
    await handleSendMessage({ message: trimmed, chatId: currentChatId });
  };
  const onSubmit = (e) => { e.preventDefault(); send(input); };

  const TABS = [
    { id: 'answer', label: 'Answer', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/></svg> },
    { id: 'links', label: 'Links', count: sources.length, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
    { id: 'images', label: 'Images', count: images.length, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
  ];

  return (
    <main className="h-screen w-full flex bg-neutral-950 text-neutral-200 font-[Inter,sans-serif] antialiased">
      <style>{`@keyframes caret{0%,100%{opacity:1}50%{opacity:0}}`}</style>

      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside className={`h-full flex flex-col border-r border-white/5 bg-neutral-900/70 shrink-0 transition-all duration-200 ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
        <div className="flex items-center justify-between px-4 h-14 shrink-0">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#20b8cd" opacity=".85" />
              <path d="M2 17l10 5 10-5" stroke="#20b8cd" strokeWidth="2" fill="none" />
              <path d="M2 12l10 5 10-5" stroke="#20b8cd" strokeWidth="2" fill="none" />
            </svg>
            <span className="text-sm font-semibold text-white tracking-tight">Inquiro</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} aria-label="Collapse sidebar" className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
          </button>
        </div>

        <div className="px-3 pt-1 pb-4">
          <button onClick={handleNewChat} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-md shadow-cyan-500/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New chat
          </button>
        </div>

        <div className="px-5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-600">History</div>
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {chatList.length === 0 ? (
            <p className="px-2 py-2 text-[12px] text-neutral-600">No conversations yet.</p>
          ) : (
            chatList.map((c) => (
              <div key={c.id} onClick={() => openChat(c.id)} className={`group flex items-center gap-1 pl-3 pr-1.5 py-2.5 rounded-lg text-[13px] cursor-pointer transition-colors ${currentChatId === c.id ? 'bg-white/10 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'}`}>
                <span className="truncate flex-1">{c.title || 'New Chat'}</span>
                <div className="relative" data-chatmenu>
                  <button onClick={(e) => { e.stopPropagation(); setMenuChatId(menuChatId === c.id ? null : c.id); }} aria-label="Chat options" className={`p-1 rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-white/10 transition ${menuChatId === c.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>
                  </button>
                  {menuChatId === c.id && (
                    <div className="absolute right-0 top-full mt-1 z-20 w-32 rounded-lg border border-neutral-800 bg-neutral-900 shadow-xl shadow-black/40 overflow-hidden">
                      <button onClick={(e) => onDelete(e, c.id)} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-400 hover:bg-neutral-800 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-3 py-3 mt-1 border-t border-white/5 relative" ref={menuRef}>
          {menuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-neutral-800 bg-neutral-900 shadow-xl shadow-black/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-800">
                <p className="text-[13px] font-medium text-neutral-200 truncate">{user?.username || 'User'}</p>
                <p className="text-[12px] text-neutral-500 truncate">{user?.email || ''}</p>
              </div>
              <button onClick={() => { setMenuOpen(false); navigate('/settings'); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-neutral-300 hover:bg-neutral-800 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Settings
              </button>
              <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-400 hover:bg-neutral-800 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Log out
              </button>
            </div>
          )}
          <button onClick={() => setMenuOpen((v) => !v)} aria-label="Account menu" className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</div>
            <span className="text-[13px] font-medium text-neutral-200 truncate flex-1 text-left">{user?.username || 'User'}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500 shrink-0"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
        </div>
      </aside>

      {/* ═══════════ MAIN ═══════════ */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[50rem] h-[34rem] rounded-full bg-cyan-500/[0.07] blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)', backgroundSize: '56px 56px', maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 50%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 50%, transparent 100%)' }} />
        </div>

        <header className="relative z-10 flex items-center justify-between px-6 h-14 shrink-0 border-b border-white/5">
          <div className="flex items-center gap-2 w-28">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${activeTab === tab.id ? 'text-cyan-400 bg-cyan-400/10' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}>
                {tab.icon}{tab.label}
                {tab.count > 0 && <span className="ml-0.5 text-[11px] text-neutral-500">{tab.count}</span>}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 w-28 justify-end">
            <button onClick={onShare} aria-label="Share answer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-neutral-400 hover:text-neutral-200 border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share
            </button>
          </div>
        </header>

        <div className="relative z-10 flex-1 overflow-y-auto">

          {/* ANSWER */}
          {activeTab === 'answer' && (
            isOpeningChat ? (
              <div className="max-w-3xl mx-auto px-6 py-10 space-y-4">
                <div className="h-6 w-2/3 rounded bg-white/5 animate-pulse" />
                <div className="h-4 w-full rounded bg-white/5 animate-pulse mt-6" />
                <div className="h-4 w-5/6 rounded bg-white/5 animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-white/5 animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-white/5 animate-pulse" />
              </div>
            ) : messages.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-full px-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center mb-7 shadow-lg shadow-cyan-500/25">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/></svg>
                </div>
                <h1 className="text-[30px] font-semibold text-white tracking-tight mb-2.5">Where knowledge begins</h1>
                <p className="text-neutral-400 text-[16px] text-center max-w-md mb-9">Ask anything and I&apos;ll find the best answers for you.</p>
                <div className="grid sm:grid-cols-2 gap-3 w-full max-w-2xl">
                  {SUGGESTIONS.map((s) => (
                    <button key={s.text} onClick={() => send(s.text)} className="group flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/10 bg-neutral-900/60 hover:bg-neutral-900 hover:border-white/20 transition-colors text-left">
                      <span className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#20b8cd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                      </span>
                      <span className="text-[13px] text-neutral-300 group-hover:text-white transition-colors flex-1">{s.text}</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600 group-hover:text-cyan-400 transition-colors shrink-0"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto px-6 py-8">
                {messages.map((msg, idx) =>
                  msg.role === 'user' ? (
                    <div key={idx} className={`flex justify-end ${idx > 0 ? 'mt-8' : ''}`}>
                      <div className="px-4 py-2.5 rounded-2xl rounded-br-md bg-cyan-600/90 text-white text-[15px] max-w-[75%] shadow-md shadow-cyan-500/10">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div key={idx} className="flex justify-start mt-4">
                      <div className="flex gap-3 max-w-full w-full">
                        {/* AI avatar */}
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          {msg.sources?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {msg.sources.slice(0, 4).map((s, i) => (
                                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-white/10 bg-neutral-900 hover:border-white/20 transition-colors max-w-[200px]">
                                  <img src={faviconOf(s.url)} alt="" className="w-4 h-4 rounded shrink-0" />
                                  <span className="text-[12px] text-neutral-400 truncate">{domainOf(s.url)}</span>
                                </a>
                              ))}
                            </div>
                          )}
                          {msg.content ? (
                            <div className="text-[15px] leading-7 text-neutral-200 prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-white prose-strong:text-white prose-a:text-cyan-400 prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                              {msg.streaming && <span className="inline-block w-[2px] h-[15px] align-middle ml-0.5 bg-cyan-400" style={{ animation: 'caret 1s step-end infinite' }} />}
                            </div>
                          ) : (
                            <Dots />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}
                {isLoading && !isStreaming && <div className="flex justify-start mt-4"><div className="flex gap-3"><div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/></svg></div><Dots /></div></div>}
                <div ref={messagesEndRef} />
              </div>
            )
          )}

          {/* LINKS */}
          {activeTab === 'links' && (
            <div className="max-w-3xl mx-auto px-6 py-8">
              {sources.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center pt-24">
                  <p className="text-neutral-300 text-[15px] font-medium">No sources yet</p>
                  <p className="text-neutral-500 text-[14px] mt-1 max-w-sm">Ask a question and the web pages used to answer it will show up here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[13px] text-neutral-500 mb-2">{sources.length} source{sources.length > 1 ? 's' : ''} for the latest answer</p>
                  {sources.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-neutral-900/60 hover:border-white/20 transition-colors">
                      <img src={faviconOf(s.url)} alt="" className="w-5 h-5 rounded mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-neutral-100 truncate">{s.title}</p>
                        <p className="text-[12px] text-cyan-500/80 truncate mt-0.5">{domainOf(s.url)}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* IMAGES */}
          {activeTab === 'images' && (
            <div className="max-w-3xl mx-auto px-6 py-8">
              {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center pt-24">
                  <p className="text-neutral-300 text-[15px] font-medium">No images yet</p>
                  <p className="text-neutral-500 text-[14px] mt-1 max-w-sm">Images found while searching the web will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {images.map((src, i) => (
                    <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="block aspect-video rounded-xl overflow-hidden border border-white/10 bg-neutral-900 hover:border-white/20 transition-colors">
                      <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="relative z-10 shrink-0 px-6 pb-5 pt-2">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={onSubmit} className="flex items-center bg-neutral-900/80 backdrop-blur border border-white/10 rounded-2xl px-4 py-3 shadow-xl shadow-black/30 focus-within:border-cyan-500/50 focus-within:ring-4 focus-within:ring-cyan-500/10 transition-all">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={messages.length > 0 ? 'Ask a follow-up...' : 'Ask anything...'} className="flex-1 bg-transparent text-[15px] text-neutral-200 placeholder-neutral-500 outline-none" />
              <button type="submit" disabled={!input.trim() || isLoading} aria-label="Send" className={`ml-3 p-2 rounded-xl transition-colors ${input.trim() && !isLoading ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
              </button>
            </form>
            <p className="text-center text-[11px] text-neutral-600 mt-2">Answers can make mistakes — verify important info.</p>
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/10 text-[13px] text-neutral-100 shadow-xl shadow-black/40">
          {toast}
        </div>
      )}
    </main>
  );
};

export default Dashboard;