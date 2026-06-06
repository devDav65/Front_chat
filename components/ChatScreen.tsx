'use client';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import Sidebar from './Sidebar';
import {
  Menu, Sun, Moon, LogOut, MessageSquare,
  Send, Loader2
} from 'lucide-react';

const CHIPS = [
  { icon: '💡', label: 'Capacités',  text: 'Quelles sont tes capacités ?' },
  { icon: '✍️', label: 'Rédaction',  text: 'Aide-moi à rédiger un email professionnel' },
  { icon: '📚', label: 'Expliquer',  text: 'Explique-moi un concept technique' },
  { icon: '🎨', label: 'Idées',      text: 'Génère des idées créatives sur un sujet' },
  { icon: '📋', label: 'Résumé',     text: 'Résume ce texte en 3 points clés' },
];

export default function ChatScreen() {
  const {
    session, logout, theme, toggleTheme,
    currentSessionId, currentSessionTitle,
    messages, loadingMessages, sending, sendMessage,
    sidebarOpen, setSidebarOpen,
  } = useApp();

  const [input, setInput]   = useState('');
  const messagesEndRef       = useRef<HTMLDivElement>(null);
  const textareaRef          = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !currentSessionId) return;
    setInput('');
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const now = new Date();
  const days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const months = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'];
  const dateStr = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 62,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        flexShrink: 0, position: 'relative', zIndex: 10,
      }}>
        {/* Accent line bottom */}
        <div style={{
          position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)',
          width: 180, height: 1,
          background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
          opacity: 0.4,
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Mobile menu */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={iconBtnStyle}>
            <Menu size={16} />
          </button>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px var(--accentGlow)',
          }}>
            <MessageSquare size={15} color="white" strokeWidth={2} />
          </div>
          <div>
            <div style={{
              fontFamily: 'Instrument Serif, serif', fontSize: 18,
              fontWeight: 400, color: 'var(--text)',
            }}>
              <span style={{ color: 'var(--accent)' }}>N</span>exus
            </div>
            <div style={{
              fontSize: 11.5, color: 'var(--text2)',
              fontFamily: 'Geist Mono, monospace',
              whiteSpace: 'nowrap', overflow: 'hidden',
              textOverflow: 'ellipsis', maxWidth: 200,
            }}>
              {currentSessionTitle}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Status dot + user chip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '5px 10px 5px 5px',
            background: 'var(--bg2)', border: '1px solid var(--border2)',
            borderRadius: 20, fontSize: 13, color: 'var(--text)',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'white',
              fontFamily: 'Geist Mono, monospace',
            }}>
              {(session?.username?.[0] || 'U').toUpperCase()}
            </div>
            <span style={{ fontWeight: 500, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session?.username}
            </span>
          </div>

          {/* Online dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--success)', animation: 'pulse 2.5s infinite',
            }} />
          </div>

          <button onClick={toggleTheme} style={iconBtnStyle} title="Thème">
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={logout} style={{ ...iconBtnStyle, color: 'var(--danger)' } as React.CSSProperties} title="Déconnexion">
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', overflowX: 'hidden',
            padding: '28px clamp(16px, 5vw, 48px)',
            display: 'flex', flexDirection: 'column',
            gap: 18, WebkitOverflowScrolling: 'touch' as never,
          }}>
            {/* Welcome */}
            {messages.length === 0 && !loadingMessages && (
              <div style={{ textAlign: 'center', padding: '16px 0 8px', animation: 'fadeUp 0.5s ease 0.1s both' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 10.5, color: 'var(--text3)',
                  textTransform: 'uppercase', letterSpacing: '0.9px',
                  fontFamily: 'Geist Mono, monospace',
                  background: 'var(--bg2)', border: '1px solid var(--border2)',
                  borderRadius: 20, padding: '4px 14px', marginBottom: 14,
                }}>
                  {dateStr}
                </div>
                <h2 style={{
                  fontFamily: 'Instrument Serif, serif', fontStyle: 'italic',
                  fontSize: 'clamp(20px,4vw,26px)', fontWeight: 400,
                  color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.3px',
                }}>
                  Bonjour, comment puis-je vous aider ?
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text2)' }}>
                  Je suis{' '}
                  <span style={{
                    color: 'var(--accent)', fontFamily: 'Instrument Serif, serif',
                    fontSize: 15, fontStyle: 'italic',
                  }}>Nexus</span>
                  , votre assistant personnel
                </p>

                {/* Welcome message */}
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-start' }}>
                  <MsgRow role="assistant" content="👋 Bienvenue ! Créez ou sélectionnez une conversation pour commencer." username={session?.username || ''} />
                </div>
              </div>
            )}

            {/* Loading skeleton */}
            {loadingMessages && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[1,2].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface)', flexShrink: 0, animation: 'shimmer 1.4s infinite', backgroundSize: '200% 100%' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ height: 10, width: 80, borderRadius: 4, background: 'var(--surface)', animation: 'shimmer 1.4s infinite', backgroundSize: '200% 100%' }} />
                      <div style={{ height: 48, borderRadius: 10, background: 'var(--surface)', animation: 'shimmer 1.4s infinite', backgroundSize: '200% 100%' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Messages */}
            {!loadingMessages && messages.map((m, i) => (
              <MsgRow key={i} role={m.role} content={m.content} username={session?.username || ''} />
            ))}

            {/* Typing */}
            {sending && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'msgIn 0.3s ease' }}>
                <Avatar type="bot" />
                <div>
                  <div style={metaStyle}>Nexus</div>
                  <div style={{ ...bubbleStyle(false), padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      {[0,1,2].map(i => (
                        <span key={i} style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: 'var(--accent)', display: 'inline-block',
                          animation: `tdot 1.4s infinite ${i * 0.2}s`, opacity: 0.5,
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div style={{
            padding: '12px clamp(16px,5vw,48px) 16px',
            background: 'var(--surface)', borderTop: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            {/* Chips */}
            <div style={{
              display: 'flex', gap: 6, marginBottom: 10,
              overflowX: 'auto', scrollbarWidth: 'none',
            }}>
              {CHIPS.map(c => (
                <button key={c.label} onClick={() => { setInput(c.text); textareaRef.current?.focus(); }} style={{
                  padding: '6px 13px', background: 'var(--bg2)',
                  border: '1px solid var(--border2)', borderRadius: 20,
                  fontSize: 12, color: 'var(--text2)', cursor: 'pointer',
                  whiteSpace: 'nowrap', fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontWeight: 500, minHeight: 34,
                  display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'var(--transition)',
                }}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={currentSessionId ? 'Écrivez votre message à Nexus…' : 'Créez une conversation pour commencer…'}
                disabled={!currentSessionId}
                style={{
                  flex: 1, padding: '11px 16px', minHeight: 46,
                  background: 'var(--bg2)', border: '1.5px solid var(--border2)',
                  borderRadius: 'var(--radius)', color: 'var(--text)',
                  fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15,
                  outline: 'none', resize: 'none', maxHeight: 120, lineHeight: 1.6,
                  transition: 'var(--transition)', WebkitAppearance: 'none',
                  opacity: currentSessionId ? 1 : 0.5,
                }}
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim() || !currentSessionId}
                style={{
                  width: 46, height: 46, minWidth: 46, flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
                  border: 'none', borderRadius: 'var(--radius)',
                  cursor: sending || !input.trim() || !currentSessionId ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', transition: 'var(--transition)',
                  opacity: sending || !input.trim() || !currentSessionId ? 0.4 : 1,
                  boxShadow: '0 3px 14px var(--accentGlow)',
                }}
              >
                {sending
                  ? <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
                  : <Send size={16} />
                }
              </button>
            </div>
            <div style={{
              textAlign: 'center', fontSize: 10.5, color: 'var(--text3)',
              marginTop: 8, fontFamily: 'Geist Mono, monospace',
            }}>
              <kbd style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '1px 5px', fontSize: 9 }}>Enter</kbd>
              {' '}pour envoyer · {' '}
              <kbd style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4, padding: '1px 5px', fontSize: 9 }}>Shift+Enter</kbd>
              {' '}pour nouvelle ligne
            </div>
          </div>

          {/* Footer */}
          <div style={{
            background: 'var(--bg2)', borderTop: '1px solid var(--border)',
            padding: '7px 20px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{
              fontSize: 10.5, color: 'var(--text3)',
              fontFamily: 'Geist Mono, monospace', letterSpacing: '0.3px',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <span style={{ display: 'inline-block', width: 18, height: 1, background: 'var(--border3)', borderRadius: 2 }} />
              Propulsé par <span style={{ fontWeight: 600, color: 'var(--accent2)' }}>WYD</span>
              <span style={{ display: 'inline-block', width: 18, height: 1, background: 'var(--border3)', borderRadius: 2 }} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MsgRow({ role, content, username }: { role: 'user' | 'assistant'; content: string; username: string }) {
  const isUser = role === 'user';
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-start',
      flexDirection: isUser ? 'row-reverse' : 'row',
      animation: 'msgIn 0.3s cubic-bezier(0.16,1,0.3,1)',
      maxWidth: '100%',
    }}>
      <Avatar type={isUser ? 'user' : 'bot'} initial={username[0]} />
      <div style={{ maxWidth: 'min(560px, calc(100vw - 90px))' }}>
        <div style={{ ...metaStyle, textAlign: isUser ? 'right' : 'left' }}>
          {isUser ? username : 'Nexus'}
        </div>
        <div style={bubbleStyle(isUser)}>{content}</div>
      </div>
    </div>
  );
}

function Avatar({ type, initial }: { type: 'user' | 'bot'; initial?: string }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 8, flexShrink: 0, marginTop: 2,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 700, fontFamily: 'Geist Mono, monospace',
      ...(type === 'bot'
        ? { background: 'linear-gradient(135deg, var(--accent), #a78bfa)', color: 'white', boxShadow: '0 2px 10px var(--accentGlow)' }
        : { background: 'var(--surface2)', color: 'var(--accent)', border: '1px solid var(--border2)' }
      ),
    }}>
      {type === 'bot' ? 'NX' : (initial || 'U').toUpperCase()}
    </div>
  );
}

const metaStyle: React.CSSProperties = {
  fontSize: 10.5, fontWeight: 600, color: 'var(--text3)',
  textTransform: 'uppercase', letterSpacing: '0.6px',
  marginBottom: 5, fontFamily: 'Geist Mono, monospace',
};

function bubbleStyle(isUser: boolean): React.CSSProperties {
  return {
    padding: '11px 16px',
    borderRadius: isUser ? 'var(--radius) 4px var(--radius) var(--radius)' : '4px var(--radius) var(--radius) var(--radius)',
    fontSize: 14.5, lineHeight: 1.7,
    wordBreak: 'break-word', overflowWrap: 'anywhere' as never,
    background: isUser ? 'var(--user-bg)' : 'var(--bot-bg)',
    border: `1px solid ${isUser ? 'var(--user-bd)' : 'var(--bot-bd)'}`,
    color: 'var(--text)',
  };
}

const iconBtnStyle: React.CSSProperties = {
  width: 36, height: 36, minWidth: 36,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'var(--bg2)', border: '1px solid var(--border2)',
  borderRadius: 'var(--radius)', cursor: 'pointer',
  color: 'var(--text2)', transition: 'var(--transition)',
};
