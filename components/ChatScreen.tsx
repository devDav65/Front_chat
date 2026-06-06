'use client';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import Sidebar from './Sidebar';
import { Menu, Sun, Moon, LogOut, MessageSquare, Send, Loader2 } from 'lucide-react';

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

  const [input, setInput]      = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef           = useRef<HTMLDivElement>(null);
  const textareaRef              = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !currentSessionId) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
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

  const now    = new Date();
  const days   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const months = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'];
  const dateStr = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(12px, 4vw, 20px)',
        height: 58, minHeight: 58,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        flexShrink: 0, position: 'relative', zIndex: 10,
      }}>
        <div style={{ position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)', width: 180, height: 1, background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', opacity: 0.4 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Burger */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={iconBtnStyle}>
            <Menu size={16} />
          </button>
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px var(--accentGlow)',
          }}>
            <MessageSquare size={14} color="white" strokeWidth={2} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: 'Instrument Serif, serif', fontSize: 17,
              fontWeight: 400, color: 'var(--text)', lineHeight: 1.2,
            }}>
              <span style={{ color: 'var(--accent)' }}>N</span>exus
            </div>
            <div style={{
              fontSize: 11, color: 'var(--text2)',
              fontFamily: 'Geist Mono, monospace',
              whiteSpace: 'nowrap', overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: isMobile ? 140 : 220,
            }}>
              {currentSessionTitle}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* User chip — masqué sur très petit écran */}
          {!isMobile && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px 4px 4px',
              background: 'var(--bg2)', border: '1px solid var(--border2)',
              borderRadius: 20, fontSize: 13, color: 'var(--text)',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: 'white',
                fontFamily: 'Geist Mono, monospace',
              }}>
                {(session?.username?.[0] || 'U').toUpperCase()}
              </div>
              <span style={{ fontWeight: 500, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {session?.username}
              </span>
            </div>
          )}

          {/* Dot online */}
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2.5s infinite', flexShrink: 0 }} />

          <button onClick={toggleTheme} style={iconBtnStyle} title="Thème">
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={logout} style={{ ...iconBtnStyle, color: 'var(--danger)' } as React.CSSProperties} title="Déconnexion">
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, position: 'relative' }}>
        {/* Sidebar — desktop inline, mobile fixed (géré dans Sidebar.tsx) */}
        {!isMobile && <Sidebar />}
        {isMobile && <Sidebar />}

        {/* Main chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', overflowX: 'hidden',
            padding: 'clamp(16px,4vw,28px) clamp(12px,4vw,32px)',
            display: 'flex', flexDirection: 'column', gap: 16,
            WebkitOverflowScrolling: 'touch' as never,
          }}>
            {messages.length === 0 && !loadingMessages && (
              <div style={{ textAlign: 'center', padding: '16px 0 8px', animation: 'fadeUp 0.5s ease both' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 10, color: 'var(--text3)',
                  textTransform: 'uppercase', letterSpacing: '0.9px',
                  fontFamily: 'Geist Mono, monospace',
                  background: 'var(--bg2)', border: '1px solid var(--border2)',
                  borderRadius: 20, padding: '4px 14px', marginBottom: 14,
                }}>
                  {dateStr}
                </div>
                <h2 style={{
                  fontFamily: 'Instrument Serif, serif', fontStyle: 'italic',
                  fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 400,
                  color: 'var(--text)', marginBottom: 6,
                }}>
                  Bonjour, comment puis-je vous aider ?
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text2)' }}>
                  Je suis{' '}
                  <span style={{ color: 'var(--accent)', fontFamily: 'Instrument Serif, serif', fontSize: 15, fontStyle: 'italic' }}>
                    Nexus
                  </span>
                  , votre assistant personnel
                </p>
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-start' }}>
                  <MsgRow role="assistant" content="👋 Bienvenue ! Créez ou sélectionnez une conversation pour commencer." username={session?.username || ''} />
                </div>
              </div>
            )}

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

            {!loadingMessages && messages.map((m, i) => (
              <MsgRow key={i} role={m.role} content={m.content} username={session?.username || ''} />
            ))}

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

          {/* ── Input ── */}
          <div style={{
            padding: 'clamp(10px,2.5vw,14px) clamp(12px,4vw,24px) clamp(12px,3vw,16px)',
            background: 'var(--surface)', borderTop: '1px solid var(--border)',
            flexShrink: 0,
            paddingBottom: 'max(clamp(12px,3vw,16px), env(safe-area-inset-bottom))',
          }}>
            {/* Chips */}
            <div style={{
              display: 'flex', gap: 6, marginBottom: 10,
              overflowX: 'auto', scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch' as never,
            }}>
              {CHIPS.map(c => (
                <button key={c.label} onClick={() => { setInput(c.text); textareaRef.current?.focus(); }} style={{
                  padding: '6px 12px',
                  background: 'var(--bg2)', border: '1px solid var(--border2)',
                  borderRadius: 20, fontSize: 12, color: 'var(--text2)',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 500,
                  minHeight: 36, display: 'flex', alignItems: 'center', gap: 5,
                  flexShrink: 0,
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
                placeholder={currentSessionId ? 'Écrivez votre message…' : 'Créez une conversation…'}
                disabled={!currentSessionId}
                style={{
                  flex: 1, padding: '11px 14px', minHeight: 46,
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
                  color: 'white', opacity: sending || !input.trim() || !currentSessionId ? 0.4 : 1,
                  boxShadow: '0 3px 14px var(--accentGlow)',
                }}
              >
                {sending
                  ? <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
                  : <Send size={16} />}
              </button>
            </div>

            {/* Hint — masqué sur mobile */}
            {!isMobile && (
              <div style={{
                textAlign: 'center', fontSize: 10, color: 'var(--text3)',
                marginTop: 7, fontFamily: 'Geist Mono, monospace',
              }}>
                <kbd style={kbdStyle}>Enter</kbd> envoyer ·{' '}
                <kbd style={kbdStyle}>Shift+Enter</kbd> nouvelle ligne
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            background: 'var(--bg2)', borderTop: '1px solid var(--border)',
            padding: '6px 16px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{
              fontSize: 10, color: 'var(--text3)',
              fontFamily: 'Geist Mono, monospace', letterSpacing: '0.3px',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ display: 'inline-block', width: 14, height: 1, background: 'var(--border3)', borderRadius: 2 }} />
              Propulsé par <span style={{ fontWeight: 600, color: 'var(--accent2)' }}>WYD</span>
              <span style={{ display: 'inline-block', width: 14, height: 1, background: 'var(--border3)', borderRadius: 2 }} />
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
      display: 'flex', gap: 9, alignItems: 'flex-start',
      flexDirection: isUser ? 'row-reverse' : 'row',
      animation: 'msgIn 0.3s cubic-bezier(0.16,1,0.3,1)',
    }}>
      <Avatar type={isUser ? 'user' : 'bot'} initial={username[0]} />
      <div style={{ maxWidth: 'min(520px, calc(100vw - 80px))' }}>
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
      width: 30, height: 30, borderRadius: 8, flexShrink: 0, marginTop: 2,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, fontFamily: 'Geist Mono, monospace',
      ...(type === 'bot'
        ? { background: 'linear-gradient(135deg, var(--accent), #a78bfa)', color: 'white', boxShadow: '0 2px 10px var(--accentGlow)' }
        : { background: 'var(--surface2)', color: 'var(--accent)', border: '1px solid var(--border2)' }),
    }}>
      {type === 'bot' ? 'NX' : (initial || 'U').toUpperCase()}
    </div>
  );
}

const metaStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, color: 'var(--text3)',
  textTransform: 'uppercase', letterSpacing: '0.6px',
  marginBottom: 4, fontFamily: 'Geist Mono, monospace',
};

function bubbleStyle(isUser: boolean): React.CSSProperties {
  return {
    padding: '10px 14px',
    borderRadius: isUser
      ? 'var(--radius) 4px var(--radius) var(--radius)'
      : '4px var(--radius) var(--radius) var(--radius)',
    fontSize: 'clamp(13px, 3.5vw, 14.5px)', lineHeight: 1.7,
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
  flexShrink: 0,
};

const kbdStyle: React.CSSProperties = {
  background: 'var(--bg3)', border: '1px solid var(--border2)',
  borderRadius: 4, padding: '1px 5px', fontSize: 9,
  fontFamily: 'Geist Mono, monospace', color: 'var(--text2)',
};
