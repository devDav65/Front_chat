'use client';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ChatSession } from '@/lib/types';
import { MessageSquare, Plus, Pencil, Trash2, Check, X } from 'lucide-react';

export default function Sidebar() {
  const {
    sessions, currentSessionId, loadingSessions,
    selectSession, createSession, deleteSession, renameSession,
    sidebarOpen, setSidebarOpen,
    session: authSession, logout,
    theme
  } = useApp();

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 15,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
          display: 'none',
        }} className="sidebar-overlay" />
      )}

      <aside style={{
        width: 'var(--sidebar-w)', minWidth: 'var(--sidebar-w)',
        height: '100%', background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0, position: 'relative', zIndex: 20,
        overflow: 'hidden',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 16px 14px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 12px var(--accentGlow)',
            }}>
              <MessageSquare size={14} color="white" strokeWidth={2} />
            </div>
            <span style={{
              fontFamily: 'Instrument Serif, serif', fontSize: 17,
              fontWeight: 400, color: 'var(--text)',
            }}>
              <span style={{ color: 'var(--accent)' }}>N</span>exus
            </span>
          </div>

          <button onClick={createSession} style={{
            width: '100%', padding: '9px 12px',
            background: 'var(--accentBg)',
            border: '1px dashed rgba(124,106,247,0.3)',
            borderRadius: 'var(--radius)', color: 'var(--accent2)',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'var(--transition)',
          }}>
            <Plus size={14} strokeWidth={2.5} />
            Nouvelle conversation
          </button>
        </div>

        {/* Sessions list */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '8px',
          minHeight: 0, WebkitOverflowScrolling: 'touch' as never,
        }}>
          {loadingSessions ? (
            <div style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  height: 46, borderRadius: 'var(--radius)',
                  background: 'linear-gradient(90deg, var(--bg3) 25%, var(--surface) 50%, var(--bg3) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.4s infinite',
                }} />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text3)' }}>
              <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
              <p style={{ fontSize: 12, fontFamily: 'Geist Mono, monospace', lineHeight: 1.7 }}>
                Aucune conversation.<br />Créez-en une !
              </p>
            </div>
          ) : (
            <>
              <div style={{
                fontSize: 10, fontWeight: 600, color: 'var(--text3)',
                textTransform: 'uppercase', letterSpacing: '1px',
                fontFamily: 'Geist Mono, monospace',
                padding: '6px 8px 4px', marginBottom: 2,
              }}>Conversations</div>
              {sessions.map(s => (
                <SessionItem
                  key={s.id} session={s}
                  active={s.id === currentSessionId}
                  onSelect={() => selectSession(s.id, s.titre)}
                  onDelete={() => deleteSession(s.id)}
                  onRename={(t) => renameSession(s.id, t)}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer user */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 10px', borderRadius: 'var(--radius)',
            cursor: 'pointer', transition: 'var(--transition)',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'white',
              fontFamily: 'Geist Mono, monospace',
            }}>
              {(authSession?.username?.[0] || 'U').toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: 'var(--text)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {authSession?.username}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'Geist Mono, monospace' }}>
                Utilisateur
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function SessionItem({
  session, active, onSelect, onDelete, onRename
}: {
  session: ChatSession; active: boolean;
  onSelect: () => void; onDelete: () => void; onRename: (t: string) => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(session.titre);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => { if (renaming) inputRef.current?.focus(); }, [renaming]);

  const date = new Date(session.updated_at);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  let dateStr = 'À l\'instant';
  if (mins >= 1 && mins < 60) dateStr = `Il y a ${mins} min`;
  else if (hrs >= 1 && hrs < 24) dateStr = `Il y a ${hrs}h`;
  else if (days === 1) dateStr = 'Hier';
  else if (days >= 2 && days < 7) dateStr = `Il y a ${days}j`;
  else if (days >= 7) dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  const confirmRename = () => {
    const t = title.trim() || session.titre;
    setTitle(t);
    onRename(t);
    setRenaming(false);
  };

  return (
    <div
      onClick={() => !renaming && onSelect()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 10px', borderRadius: 8,
        cursor: renaming ? 'default' : 'pointer',
        marginBottom: 2, border: '1px solid transparent',
        background: active ? 'var(--item-active, rgba(124,106,247,0.12))' : hovered ? 'var(--item-hover, rgba(124,106,247,0.06))' : 'transparent',
        borderColor: active ? 'rgba(124,106,247,0.18)' : 'transparent',
        transition: 'var(--transition)',
      }}
    >
      <div style={{
        width: 28, height: 28, background: active ? 'var(--accentBg)' : 'var(--bg3)',
        borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: active ? 'var(--accent)' : 'var(--text3)',
        transition: 'var(--transition)',
      }}>
        <MessageSquare size={12} strokeWidth={2} />
      </div>

      {renaming ? (
        <>
          <input
            ref={inputRef} value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={confirmRename}
            onKeyDown={e => {
              if (e.key === 'Enter') confirmRename();
              if (e.key === 'Escape') { setTitle(session.titre); setRenaming(false); }
            }}
            style={{
              flex: 1, background: 'var(--bg2)', border: '1px solid var(--accent)',
              borderRadius: 5, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: 13, padding: '2px 8px', outline: 'none', minWidth: 0,
              boxShadow: '0 0 0 2px var(--accentBg)',
            }}
            onClick={e => e.stopPropagation()}
          />
          <button onClick={e => { e.stopPropagation(); confirmRename(); }} style={actBtnStyle}>
            <Check size={11} />
          </button>
          <button onClick={e => { e.stopPropagation(); setTitle(session.titre); setRenaming(false); }} style={actBtnStyle}>
            <X size={11} />
          </button>
        </>
      ) : (
        <>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 500,
              color: active ? 'var(--accent2)' : 'var(--text)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              transition: 'color var(--transition)',
            }}>{session.titre}</div>
            <div style={{
              fontSize: 10, color: 'var(--text3)',
              fontFamily: 'Geist Mono, monospace', marginTop: 1,
            }}>{dateStr}</div>
          </div>
          {(hovered || active) && (
            <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
              <button
                onClick={e => { e.stopPropagation(); setRenaming(true); }}
                title="Renommer" style={actBtnStyle}
              ><Pencil size={11} /></button>
              <button
                onClick={e => { e.stopPropagation(); if (confirm(`Supprimer "${session.titre}" ?`)) onDelete(); }}
                title="Supprimer"
                style={{ ...actBtnStyle, color: 'var(--danger)' } as React.CSSProperties}
              ><Trash2 size={11} /></button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const actBtnStyle: React.CSSProperties = {
  width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent', border: 'none', borderRadius: 5,
  cursor: 'pointer', color: 'var(--text3)', transition: 'var(--transition)',
};
