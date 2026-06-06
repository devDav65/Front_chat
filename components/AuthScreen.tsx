'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { apiLogin, apiRegister } from '@/lib/api';
import { MessageSquare, Sun, Moon, Loader2 } from 'lucide-react';

const API_BASE         = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

type Tab        = 'login' | 'register';
type AlertState = { msg: string; type: 'error' | 'success' } | null;

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (cfg: {
            client_id: string;
            scope: string;
            callback: (r: { access_token?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

export default function AuthScreen() {
  const { login, theme, toggleTheme } = useApp();
  const [tab, setTab]         = useState<Tab>('login');
  const [gLoading, setGLoading] = useState(false);
  const [gReady, setGReady]   = useState(false);

  // Login
  const [lUser, setLUser]       = useState('');
  const [lPass, setLPass]       = useState('');
  const [lAlert, setLAlert]     = useState<AlertState>(null);
  const [lLoading, setLLoading] = useState(false);

  // Register
  const [rUser, setRUser]       = useState('');
  const [rNom, setRNom]         = useState('');
  const [rPrenom, setRPrenom]   = useState('');
  const [rEmail, setREmail]     = useState('');
  const [rPass, setRPass]       = useState('');
  const [rAlert, setRAlert]     = useState<AlertState>(null);
  const [rLoading, setRLoading] = useState(false);

  // Charger SDK Google
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const existing = document.getElementById('google-gsi');
    if (existing) { setGReady(true); return; }
    const script    = document.createElement('script');
    script.id       = 'google-gsi';
    script.src      = 'https://accounts.google.com/gsi/client';
    script.async    = true;
    script.onload   = () => setGReady(true);
    document.head.appendChild(script);
  }, []);

  async function handleGoogleSignIn() {
    if (!gReady || !window.google) {
      setLAlert({ msg: 'SDK Google non chargé, réessayez.', type: 'error' });
      return;
    }
    setGLoading(true);
    setLAlert(null);

    window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope:     'email profile',
      callback:  async (tokenResponse) => {
        if (!tokenResponse?.access_token) {
          setGLoading(false);
          setLAlert({ msg: 'Connexion Google annulée.', type: 'error' });
          return;
        }
        try {
          const res  = await fetch(`${API_BASE}/api/auth/google`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ token: tokenResponse.access_token }),
          });
          const json = await res.json();
          if (!res.ok) {
            setLAlert({ msg: json.detail || 'Erreur Google Auth.', type: 'error' });
            return;
          }
          // username retourné directement par l'API
          const username = json.username || 'user';
          let userId = 1;
          try {
            userId = parseInt(JSON.parse(atob(json.access_token.split('.')[1])).sub) || 1;
          } catch {}
          login(json.access_token, userId, username);
        } catch {
          setLAlert({ msg: '❌ Serveur inaccessible.', type: 'error' });
        } finally {
          setGLoading(false);
        }
      },
    }).requestAccessToken();
  }

  async function handleLogin() {
    if (!lUser || !lPass) { setLAlert({ msg: 'Remplissez tous les champs.', type: 'error' }); return; }
    setLLoading(true); setLAlert(null);
    try {
      const res  = await apiLogin(lUser, lPass);
      const json = await res.json();
      if (!res.ok) { setLAlert({ msg: json.detail || 'Identifiants incorrects.', type: 'error' }); return; }
      let userId = 1;
      try { userId = parseInt(JSON.parse(atob(json.access_token.split('.')[1])).sub) || 1; } catch {}
      login(json.access_token, userId, lUser);
    } catch { setLAlert({ msg: '❌ Serveur inaccessible.', type: 'error' }); }
    finally { setLLoading(false); }
  }

  async function handleRegister() {
    if (!rUser || !rNom || !rPrenom || !rEmail || !rPass) {
      setRAlert({ msg: 'Remplissez tous les champs.', type: 'error' }); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rEmail)) {
      setRAlert({ msg: 'Email invalide.', type: 'error' }); return;
    }
    if (rPass.length < 6) {
      setRAlert({ msg: 'Mot de passe trop court (min. 6 car.).', type: 'error' }); return;
    }
    setRLoading(true); setRAlert(null);
    try {
      const res  = await apiRegister({ username: rUser, nom: rNom, prenom: rPrenom, email: rEmail, password: rPass });
      const json = await res.json();
      if (!res.ok) { setRAlert({ msg: json.detail || 'Erreur inscription.', type: 'error' }); return; }
      setRAlert({ msg: '✅ Compte créé ! Connectez-vous.', type: 'success' });
      setLUser(rUser);
      setTimeout(() => setTab('login'), 1600);
    } catch { setRAlert({ msg: '❌ Serveur inaccessible.', type: 'error' }); }
    finally { setRLoading(false); }
  }

  const onKey = (e: React.KeyboardEvent, fn: () => void) => { if (e.key === 'Enter') fn(); };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(16px,4vw,24px)', overflowY: 'auto',
    }}>
      {/* Grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)',
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%,black,transparent)',
      }} />
      {/* Orb */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', width: 600, height: 600,
        background: 'radial-gradient(circle,var(--accentBg) 0%,transparent 65%)',
        transform: 'translate(-50%,-50%)', pointerEvents: 'none',
        animation: 'orbPulse 7s ease-in-out infinite',
      }} />

      <div style={{
        width: '100%', maxWidth: 420, position: 'relative', zIndex: 2,
        animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Theme btn */}
        <button onClick={toggleTheme} style={{
          position: 'absolute', top: 0, right: 0, width: 38, height: 38,
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--text2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={14} />}
        </button>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28, paddingTop: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56,
            background: 'linear-gradient(135deg,var(--accent),#a78bfa)',
            borderRadius: 18, marginBottom: 14,
            boxShadow: '0 0 0 8px var(--accentBg),0 0 40px var(--accentGlow)',
          }}>
            <MessageSquare size={24} color="white" strokeWidth={1.8} />
          </div>
          <h1 style={{
            fontFamily: 'Instrument Serif,serif', fontSize: 32,
            fontWeight: 400, color: 'var(--text)', letterSpacing: '-0.5px', lineHeight: 1,
          }}>
            <span style={{ color: 'var(--accent)' }}>N</span>exus
          </h1>
          <p style={{ fontSize: 12.5, color: 'var(--text2)', marginTop: 6, fontFamily: 'Geist Mono,monospace' }}>
            propulsé par WYD
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-xl)', padding: 'clamp(20px,5vw,28px)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', background: 'var(--bg2)',
            borderRadius: 'var(--radius)', padding: 4, gap: 4, marginBottom: 20,
          }}>
            {(['login','register'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '9px 0', border: 'none',
                background: tab === t ? 'var(--surface)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--text2)',
                fontFamily: 'Plus Jakarta Sans,sans-serif',
                fontSize: 13.5, fontWeight: tab === t ? 600 : 400,
                borderRadius: 7, cursor: 'pointer',
                boxShadow: tab === t ? '0 1px 6px rgba(0,0,0,0.2)' : 'none',
                transition: 'var(--transition)',
              }}>
                {t === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          {/* Bouton Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={gLoading || !GOOGLE_CLIENT_ID}
            style={{
              width: '100%', padding: '11px 14px', marginBottom: 16,
              background: 'var(--bg2)', border: '1.5px solid var(--border2)',
              borderRadius: 'var(--radius)', cursor: gLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 14, fontWeight: 500,
              color: 'var(--text)', transition: 'var(--transition)',
              opacity: gLoading || !GOOGLE_CLIENT_ID ? 0.5 : 1,
            }}
          >
            {gLoading ? (
              <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}
            Continuer avec Google
          </button>

          {/* Séparateur */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border2)' }} />
            <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Geist Mono,monospace' }}>ou</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border2)' }} />
          </div>

          {/* Login */}
          {tab === 'login' && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <Field label="Nom d'utilisateur" id="l-user">
                <input id="l-user" type="text" placeholder="david123" value={lUser}
                  onChange={e => setLUser(e.target.value)}
                  onKeyDown={e => onKey(e, handleLogin)} style={inputStyle} />
              </Field>
              <Field label="Mot de passe" id="l-pass">
                <input id="l-pass" type="password" placeholder="••••••••" value={lPass}
                  onChange={e => setLPass(e.target.value)}
                  onKeyDown={e => onKey(e, handleLogin)} style={inputStyle} />
              </Field>
              {lAlert && <Alert {...lAlert} />}
              <PrimaryBtn onClick={handleLogin} loading={lLoading}>Se connecter</PrimaryBtn>
            </div>
          )}

          {/* Register */}
          {tab === 'register' && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <Field label="Nom d'utilisateur" id="r-user">
                <input id="r-user" type="text" placeholder="david123" value={rUser}
                  onChange={e => setRUser(e.target.value)} style={inputStyle} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Nom" id="r-nom">
                  <input id="r-nom" type="text" placeholder="Dupont" value={rNom}
                    onChange={e => setRNom(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Prénom" id="r-prenom">
                  <input id="r-prenom" type="text" placeholder="David" value={rPrenom}
                    onChange={e => setRPrenom(e.target.value)} style={inputStyle} />
                </Field>
              </div>
              <Field label="Email" id="r-email">
                <input id="r-email" type="email" placeholder="vous@exemple.com" value={rEmail}
                  onChange={e => setREmail(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Mot de passe (min. 6 car.)" id="r-pass">
                <input id="r-pass" type="password" placeholder="••••••••" value={rPass}
                  onChange={e => setRPass(e.target.value)}
                  onKeyDown={e => onKey(e, handleRegister)} style={inputStyle} />
              </Field>
              {rAlert && <Alert {...rAlert} />}
              <PrimaryBtn onClick={handleRegister} loading={rLoading}>Créer mon compte</PrimaryBtn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={id} style={{
        display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text2)',
        textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6,
        fontFamily: 'Geist Mono,monospace',
      }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', minHeight: 44,
  background: 'var(--bg2)', border: '1.5px solid var(--border2)',
  borderRadius: 'var(--radius)', color: 'var(--text)',
  fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 15,
  outline: 'none', transition: 'var(--transition)', WebkitAppearance: 'none',
};

function Alert({ msg, type }: { msg: string; type: 'error' | 'success' }) {
  return (
    <div style={{
      marginBottom: 8, padding: '9px 13px', borderRadius: 8, fontSize: 13,
      textAlign: 'center', animation: 'fadeUp 0.2s ease',
      background: type === 'error' ? 'rgba(248,113,113,0.08)' : 'rgba(52,211,153,0.08)',
      border: `1px solid ${type === 'error' ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)'}`,
      color: type === 'error' ? 'var(--danger)' : 'var(--success)',
    }}>{msg}</div>
  );
}

function PrimaryBtn({ onClick, loading, children }: {
  onClick: () => void; loading: boolean; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      width: '100%', padding: '13px', marginTop: 8, minHeight: 48,
      background: 'linear-gradient(135deg,var(--accent),#a78bfa)',
      border: 'none', borderRadius: 'var(--radius)',
      color: 'white', fontFamily: 'Plus Jakarta Sans,sans-serif',
      fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.6 : 1, transition: 'var(--transition)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      {loading
        ? <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
        : children}
    </button>
  );
}