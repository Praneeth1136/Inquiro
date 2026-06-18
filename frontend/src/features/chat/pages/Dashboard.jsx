import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../../auth/hooks/userAuth';
import { setCurrentChatId, setError, finishStreaming } from '../chat.Slice';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const codeString = String(children).replace(/\n$/, '');

  const onCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return <code {...props} className="bg-white/10 px-1 py-0.5 rounded text-[13px] font-mono">{children}</code>;
  }

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-white/5">
        <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">{match ? match[1] : 'code'}</span>
        <button onClick={onCopy} className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-white transition-colors p-1">
          {copied ? (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><polyline points="20 6 9 17 4 12"/></svg><span className="text-emerald-400">Copied!</span></>
          ) : (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        {...props}
        style={vscDarkPlus}
        language={match ? match[1] : 'text'}
        PreTag="div"
        customStyle={{ margin: 0, background: '#111', padding: '1rem', fontSize: '13px', lineHeight: '1.5' }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};

const SUGGESTIONS = [
  // { text: 'Explain quantum computing in simple terms', icon: <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 4a6 6 0 1 1-6 6 6 6 0 0 1 6-6z" /> },
  // { text: 'What happened in tech news this week?', icon: <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2M18 14h-8M15 18h-5M10 6h8v4h-8z" /> },
  // { text: 'Compare React and Vue for a new project', icon: <path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7" /> },
  // { text: 'Give me a 3-day itinerary for Tokyo', icon: <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" /> },
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
  const chatStatus = useSelector((state) => state.chat.chatStatus);

  const [selectedModel, setSelectedModel] = useState('gemini');
  const [attachedImages, setAttachedImages] = useState([]);
  const fileInputRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuChatId, setMenuChatId] = useState(null);
  const [toast, setToast] = useState(null);
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);

  const inputRef = useRef(null);
  const searchInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const toastTimer = useRef(null);
  const recognitionRef = useRef(null);

  const { handleSendMessage, initializeSocketConnection, handleGetChats, handleOpenChat, handleDeleteChat, handleRenameChat } = useChat();
  const { handleLogout } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const originalInputRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event) => {
        let sessionTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          sessionTranscript += event.results[i][0].transcript;
        }
        setInput((originalInputRef.current + ' ' + sessionTranscript).trim());
      };
      recognitionRef.current.onerror = (e) => {
        console.error("Speech error:", e.error);
        let msg = `Speech error: ${e.error}`;
        if (e.error === 'not-allowed') msg = 'Microphone access denied. Please check permissions.';
        if (e.error === 'network') msg = 'Network error. Note: Brave browser blocks speech by default.';
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      originalInputRef.current = input;
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const toggleSpeak = (id, text) => {
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingId(id);
    }
  };

  const onRegenerate = async (lastUserMessageText) => {
    if (isLoading || isStreaming || !lastUserMessageText) return;
    await handleSendMessage({ message: lastUserMessageText, chatId: currentChatId });
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSidebarOpen(true);
        searchInputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const chatList = Object.values(chats || {}).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
  const messages = currentChat?.messages || [];
  const isStreaming = messages.some((m) => m.streaming);

  /* ── Detect mobile for sidebar behavior ── */
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const onRenameStart = (e, id, title) => {
    e.stopPropagation();
    setRenamingChatId(id);
    setRenameTitle(title);
    setMenuChatId(null);
  };

  const onRenameSubmit = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (renameTitle.trim()) {
      handleRenameChat(id, renameTitle);
    }
    setRenamingChatId(null);
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

  /* ── Lock body scroll when mobile sidebar is open ── */
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen, isMobile]);

  /* ── Open sidebar by default on desktop ── */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    if (mq.matches) setSidebarOpen(true);
    const handler = (e) => { if (e.matches) setSidebarOpen(true); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const openChat = (chatId) => { handleOpenChat(chatId); closeSidebarOnMobile(); };
  const handleNewChat = () => { dispatch(setCurrentChatId(null)); setInput(''); closeSidebarOnMobile(); };
  const onLogout = async () => { setMenuOpen(false); await handleLogout(); navigate('/login'); };
  const onDelete = async (e, chatId) => { e.stopPropagation(); setMenuChatId(null); await handleDeleteChat(chatId); };

  const onShare = async () => {
    const lastAi = [...messages].reverse().find((m) => m.role === 'ai');
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
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

  const onDownloadChat = () => {
    if (!messages.length) { showToast('No messages to export'); return; }
    let content = `# ${currentChat?.title || 'Chat Export'}\n\n`;
    messages.forEach(m => {
      content += `### ${m.role === 'user' ? 'You' : 'AI'}\n${m.content}\n\n`;
    });
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentChat?.title || 'chat'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setAttachedImages((prev) => [...prev, evt.target.result]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    const imagesToPass = [...attachedImages];
    setAttachedImages([]);
    await handleSendMessage({ message: trimmed, chatId: currentChatId, modelName: selectedModel, images: imagesToPass });
  };
  const onSubmit = (e) => { e.preventDefault(); send(input); };

  return (
    <main className="h-dvh w-full flex bg-neutral-950 text-neutral-200 font-[Inter,sans-serif] antialiased overflow-hidden">
      <style>{`@keyframes caret{0%,100%{opacity:1}50%{opacity:0}}`}</style>

      {/* ═══════════ MOBILE SIDEBAR BACKDROP ═══════════ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 h-full flex flex-col border-r border-white/5 bg-neutral-900/95 backdrop-blur-md shrink-0
        transition-transform duration-300 ease-in-out
        w-72
        md:relative md:z-auto md:bg-neutral-900/70 md:backdrop-blur-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}
      `}>
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
        <div className="px-3 pb-2">
          <div className="relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input ref={searchInputRef} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search history..." className="w-full bg-black/20 border border-white/5 rounded-lg pl-8 pr-3 py-1.5 text-[12px] text-neutral-300 placeholder-neutral-600 outline-none focus:border-cyan-500/50 transition-colors" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hidden px-3 space-y-1">
          {chatList.filter(c => (c.title || 'New Chat').toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
            <p className="px-2 py-2 text-[12px] text-neutral-600">No conversations found.</p>
          ) : (
            chatList.filter(c => (c.title || 'New Chat').toLowerCase().includes(searchQuery.toLowerCase())).map((c) => (
              <div key={c.id} onClick={() => openChat(c.id)} className={`group flex items-center gap-1 pl-3 pr-1.5 py-2.5 rounded-lg text-[13px] cursor-pointer transition-colors ${currentChatId === c.id ? 'bg-white/10 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'}`}>
                {renamingChatId === c.id ? (
                  <form onSubmit={(e) => onRenameSubmit(e, c.id)} className="flex-1 mr-2">
                    <input autoFocus value={renameTitle} onChange={(e) => setRenameTitle(e.target.value)} onBlur={(e) => onRenameSubmit(e, c.id)} onClick={(e) => e.stopPropagation()} className="w-full bg-neutral-800 text-white px-2 py-0.5 rounded outline-none border border-cyan-500/50" />
                  </form>
                ) : (
                  <span className="truncate flex-1">{c.title || 'New Chat'}</span>
                )}
                <div className="relative" data-chatmenu>
                  <button onClick={(e) => { e.stopPropagation(); setMenuChatId(menuChatId === c.id ? null : c.id); }} aria-label="Chat options" className={`p-1 rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-white/10 transition ${menuChatId === c.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>
                  </button>
                  {menuChatId === c.id && (
                    <div className="absolute right-0 top-full mt-1 z-20 w-32 rounded-lg border border-neutral-800 bg-neutral-900 shadow-xl shadow-black/40 overflow-hidden">
                      <button onClick={(e) => onRenameStart(e, c.id, c.title || 'New Chat')} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-neutral-300 hover:bg-neutral-800 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        Rename
                      </button>
                      <button onClick={(e) => onDelete(e, c.id)} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-400 hover:bg-neutral-800 transition-colors border-t border-neutral-800">
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

        <header className="relative z-10 flex items-center justify-between px-3 sm:px-6 h-14 shrink-0 border-b border-white/5">
          <div className="flex items-center gap-2 min-w-0">
            {/* Hamburger / sidebar toggle — always visible when sidebar is closed */}
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              </button>
            )}
          </div>

          {/* Tabs completely removed, sources rendered inline */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-neutral-800/50 border border-white/10 text-neutral-300 text-[12px] rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-cyan-500/50 appearance-none cursor-pointer hover:bg-neutral-800 transition-colors"
            >
              <option value="gemini">Gemini 3.1 Flash</option>
              <option value="mistral">Mistral Small</option>
            </select>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <button onClick={onDownloadChat} aria-label="Export Markdown" className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[13px] font-medium text-neutral-400 hover:text-neutral-200 border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span className="hidden sm:inline">Export</span>
            </button>
            <button onClick={onShare} aria-label="Share answer" className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[13px] font-medium text-neutral-400 hover:text-neutral-200 border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </header>

        <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hidden">

          {/* ANSWER */}
          {isOpeningChat ? (
              <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-4">
                <div className="h-6 w-2/3 rounded bg-white/5 animate-pulse" />
                <div className="h-4 w-full rounded bg-white/5 animate-pulse mt-6" />
                <div className="h-4 w-5/6 rounded bg-white/5 animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-white/5 animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-white/5 animate-pulse" />
              </div>
            ) : messages.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center mb-5 sm:mb-7 shadow-lg shadow-cyan-500/25">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="sm:w-7 sm:h-7"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/></svg>
                </div>
                <h1 className="text-[22px] sm:text-[30px] font-semibold text-white tracking-tight mb-2 sm:mb-2.5 text-center">Where knowledge begins</h1>
                <p className="text-neutral-400 text-[14px] sm:text-[16px] text-center max-w-md mb-7 sm:mb-9">Ask anything and I&apos;ll find the best answers for you.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                  {SUGGESTIONS.map((s) => (
                    <button key={s.text} onClick={() => send(s.text)} className="group flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border border-white/10 bg-neutral-900/60 hover:bg-neutral-900 hover:border-white/20 transition-colors text-left">
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
              <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {messages.map((msg, idx) =>
                  msg.role === 'user' ? (
                    <div key={idx} className={`flex justify-end ${idx > 0 ? 'mt-6 sm:mt-8' : ''}`}>
                      <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl rounded-br-md bg-cyan-600/90 text-white text-[14px] sm:text-[15px] max-w-[85%] sm:max-w-[75%] shadow-md shadow-cyan-500/10 flex flex-col gap-2">
                        {msg.images?.length > 0 && (
                          <div className="flex flex-wrap gap-2 justify-end">
                            {msg.images.map((img, i) => (
                              <img key={i} src={img} alt="attached" className="max-w-[200px] max-h-[200px] rounded-lg object-contain border border-white/10 bg-black/20" />
                            ))}
                          </div>
                        )}
                        <span>{msg.content}</span>
                      </div>
                    </div>
                  ) : (
                    <div key={idx} className="flex justify-start mt-3 sm:mt-4">
                      <div className="flex gap-2.5 sm:gap-3 max-w-full w-full">
                        {/* AI avatar */}
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="white" className="sm:w-[14px] sm:h-[14px]"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          {msg.sources?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2.5 sm:mb-3">
                              {msg.sources.map((s, i) => (
                                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-white/10 bg-neutral-900 hover:border-white/20 transition-colors max-w-[160px] sm:max-w-[200px]">
                                  <img src={faviconOf(s.url)} alt="" className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded shrink-0" />
                                  <span className="text-[11px] sm:text-[12px] text-neutral-400 truncate">{domainOf(s.url)}</span>
                                </a>
                              ))}
                            </div>
                          )}
                          {msg.content ? (
                            <div className="text-[14px] sm:text-[15px] leading-6 sm:leading-7 text-neutral-200 prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-white prose-strong:text-white prose-a:text-cyan-400 prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800 prose-td:border-white/10 prose-th:border-white/10 prose-th:bg-white/5 prose-table:border-white/10 prose-table:border prose-table:rounded-xl overflow-x-auto">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>{msg.content}</ReactMarkdown>
                              {msg.streaming && <span className="inline-block w-[2px] h-[15px] align-middle ml-0.5 bg-cyan-400" style={{ animation: 'caret 1s step-end infinite' }} />}
                            </div>
                          ) : (
                            <Dots />
                          )}
                            {msg.images?.length > 0 && (
                              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                                {msg.images.map((src, i) => (
                                  <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="block aspect-video rounded-xl overflow-hidden border border-white/10 bg-neutral-900 hover:border-white/20 transition-colors">
                                    <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                                  </a>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-3">
                              <button onClick={() => toggleSpeak(idx, msg.content)} aria-label="Read aloud" className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[12px] font-medium text-neutral-400 hover:text-neutral-200 hover:bg-white/5 transition-colors">
                                {speakingId === idx ? (
                                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"/></svg> Stop speaking</>
                                ) : (
                                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg> Read aloud</>
                                )}
                              </button>
                              {idx === messages.length - 1 && !isStreaming && (
                                <button onClick={() => onRegenerate(messages[idx - 1]?.content)} aria-label="Regenerate" className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[12px] font-medium text-neutral-400 hover:text-neutral-200 hover:bg-white/5 transition-colors">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> Regenerate
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                  {isLoading && !isStreaming && <div className="flex justify-start mt-4"><div className="flex gap-3"><div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/></svg></div>{chatStatus ? <span className="text-[14px] text-neutral-400 mt-1">{chatStatus}</span> : <Dots />}</div></div>}
                  <div ref={messagesEndRef} />
                </div>
              )
          }</div>

        {/* INPUT */}
        <div className="relative z-10 shrink-0 px-3 sm:px-6 pb-4 sm:pb-5 pt-2">
          <div className="max-w-3xl mx-auto">
            {attachedImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 px-1">
                {attachedImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="attached" className="h-12 w-12 object-cover rounded-lg border border-white/10" />
                    <button onClick={() => setAttachedImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1.5 -right-1.5 bg-neutral-800 text-neutral-300 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 shadow-lg">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={onSubmit} className="flex items-end bg-neutral-900/80 backdrop-blur border border-white/10 rounded-2xl px-3 sm:px-4 py-2 sm:py-2 shadow-xl shadow-black/30 focus-within:border-cyan-500/50 focus-within:ring-4 focus-within:ring-cyan-500/10 transition-all">
              <input type="file" ref={fileInputRef} onChange={onFileChange} accept="image/*" className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Attach image" className="mb-0.5 sm:mb-1 mr-1 sm:mr-2 p-1.5 sm:p-2 rounded-xl transition-colors shrink-0 text-neutral-500 hover:text-neutral-300 hover:bg-white/5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={isListening ? 'Listening...' : messages.length > 0 ? 'Ask a follow-up...' : 'Ask anything...'}
                rows={1}
                className={`flex-1 min-w-0 bg-transparent text-neutral-200 placeholder-neutral-500 outline-none py-1.5 sm:py-2 text-[14px] sm:text-[15px] resize-none overflow-y-auto scrollbar-hidden ${isListening ? 'text-cyan-400 placeholder-cyan-400/50' : ''}`}
                style={{ maxHeight: '150px' }}
              />
              <button type="button" onClick={toggleListen} aria-label="Voice input" className={`mb-0.5 sm:mb-1 ml-1 sm:ml-2 p-1.5 sm:p-2 rounded-xl transition-colors shrink-0 ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              </button>
              {isStreaming ? (
                <button type="button" onClick={() => dispatch(finishStreaming({ chatId: currentChatId }))} aria-label="Stop generating" className="mb-0.5 sm:mb-1 ml-2 sm:ml-3 p-1.5 sm:p-2 rounded-xl transition-colors shrink-0 bg-red-500/10 text-red-400 hover:bg-red-500/20 shadow-md shadow-red-500/10">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="7" width="10" height="10" rx="1" ry="1"/></svg>
                </button>
              ) : (
                <button type="submit" disabled={!input.trim() || isLoading} aria-label="Send" className={`mb-0.5 sm:mb-1 ml-2 sm:ml-3 p-1.5 sm:p-2 rounded-xl transition-colors shrink-0 ${input.trim() && !isLoading ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                </button>
              )}
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