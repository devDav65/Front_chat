'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Session, ChatSession, Message } from '@/lib/types';
import {
  apiGetSessions, apiCreateSession, apiDeleteSession,
  apiRenameSession, apiGetMessages, apiSendMessage
} from '@/lib/api';

interface AppContextType {
  // Auth
  session: Session | null;
  login: (token: string, userId: number, username: string) => void;
  logout: () => void;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Sessions
  sessions: ChatSession[];
  currentSessionId: number | null;
  loadingSessions: boolean;
  selectSession: (id: number | null, titre?: string) => Promise<void>;
  createSession: () => Promise<void>;
  deleteSession: (id: number) => Promise<void>;
  renameSession: (id: number, titre: string) => Promise<void>;

  // Messages
  messages: Message[];
  loadingMessages: boolean;
  sending: boolean;
  sendMessage: (text: string) => Promise<void>;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  currentSessionTitle: string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [currentSessionTitle, setCurrentSessionTitle] = useState('Sélectionnez une conversation');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Init from localStorage
  useEffect(() => {
    const savedTheme = (localStorage.getItem('nx_theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const token    = localStorage.getItem('nx_token');
    const userId   = parseInt(localStorage.getItem('nx_uid') || '0');
    const username = localStorage.getItem('nx_user') || '';
    if (token && userId && username) {
      setSession({ token, userId, username });
    }
  }, []);

  const login = useCallback((token: string, userId: number, username: string) => {
    localStorage.setItem('nx_token', token);
    localStorage.setItem('nx_uid',   String(userId));
    localStorage.setItem('nx_user',  username);
    setSession({ token, userId, username });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nx_token');
    localStorage.removeItem('nx_uid');
    localStorage.removeItem('nx_user');
    setSession(null);
    setSessions([]);
    setCurrentSessionId(null);
    setMessages([]);
    setCurrentSessionTitle('Sélectionnez une conversation');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('nx_theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);

  // Load sessions when session changes
  const loadSessions = useCallback(async (sess: Session) => {
    setLoadingSessions(true);
    try {
      const res = await apiGetSessions(sess.token);
      if (res.status === 401) { logout(); return null; }
      const data: ChatSession[] = await res.json();
      setSessions(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch {
      return null;
    } finally {
      setLoadingSessions(false);
    }
  }, [logout]);

  useEffect(() => {
    if (!session) return;
    loadSessions(session).then(async (data) => {
      if (!data) return;
      if (data.length === 0) {
        // Auto-create first session
        await createSessionWithSession(session);
      } else {
        // Open most recent
        await selectSessionWithSession(session, data[0].id, data[0].titre);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token]);

  const createSessionWithSession = async (sess: Session) => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await apiCreateSession(sess.token);
      if (!res.ok) return;
      const newS: ChatSession = await res.json();
      setSessions(prev => [newS, ...prev]);
      await selectSessionWithSession(sess, newS.id, newS.titre);
    } finally {
      setCreating(false);
    }
  };

  const selectSessionWithSession = async (sess: Session, id: number, titre?: string) => {
    setCurrentSessionId(id);
    setCurrentSessionTitle(titre || 'Conversation');
    setLoadingMessages(true);
    setMessages([]);
    try {
      const res = await apiGetMessages(sess.token, id);
      if (!res.ok) { setLoadingMessages(false); return; }
      const data: Message[] = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } finally {
      setLoadingMessages(false);
    }
  };

  const selectSession = useCallback(async (id: number | null, titre?: string) => {
    if (!session) return;
    if (!id) {
      setCurrentSessionId(null);
      setCurrentSessionTitle('Sélectionnez une conversation');
      setMessages([]);
      return;
    }
    await selectSessionWithSession(session, id, titre);
    setSidebarOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const createSession = useCallback(async () => {
    if (!session) return;
    await createSessionWithSession(session);
    setSidebarOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const deleteSession = useCallback(async (id: number) => {
    if (!session) return;
    await apiDeleteSession(session.token, id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (id === currentSessionId) {
      setCurrentSessionId(null);
      setMessages([]);
      setCurrentSessionTitle('Sélectionnez une conversation');
    }
  }, [session, currentSessionId]);

  const renameSession = useCallback(async (id: number, titre: string) => {
    if (!session) return;
    const res = await apiRenameSession(session.token, id, titre);
    if (res.ok) {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, titre } : s));
      if (id === currentSessionId) setCurrentSessionTitle(titre);
    }
  }, [session, currentSessionId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!session || !currentSessionId || sending) return;
    setSending(true);
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    try {
      const res = await apiSendMessage(session.token, currentSessionId, text);
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || data.detail || 'Erreur inattendue.'
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Impossible de contacter le serveur.'
      }]);
    } finally {
      setSending(false);
    }
  }, [session, currentSessionId, sending, logout]);

  return (
    <AppContext.Provider value={{
      session, login, logout,
      theme, toggleTheme,
      sessions, currentSessionId, loadingSessions, selectSession,
      createSession, deleteSession, renameSession,
      messages, loadingMessages, sending, sendMessage,
      sidebarOpen, setSidebarOpen, currentSessionTitle,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
