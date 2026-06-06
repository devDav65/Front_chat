'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { apiLogin, apiRegister } from '@/lib/api';
import { MessageSquare, Sun, Moon, Loader2 } from 'lucide-react';

type Tab = 'login' | 'register';
type AlertState = { msg: string; type: 'error' | 'success' } | null;

export default function AuthScreen() {
  const { login, theme, toggleTheme } = useApp();
  const [tab, setTab] = useState<Tab>('login');

  // Login fields
  const [lUser, setLUser] = useState('');
  const [lPass, setLPass] = useState('');
  const [lAlert, setLAlert] = useState<AlertState>(null);
  const [lLoading, setLLoading] = useState(false);

  // Register fields
  const [rUser, setRUser] = useState('');
  const [rNom, setRNom] = useState('');
  const [rPrenom, setRPrenom] = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPass, setRPass] = useState('');
  const [rAlert, setRAlert] = useState<AlertState>(null);
  const [rLoading, setRLoading] = useState(false);

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
      if (!res.ok) { setRAlert({ msg: json.detail || "Erreur lors de l'inscription.", type: 'error' }); return; }
      setRAlert({ msg: '✅ Compte créé ! Connectez-vous.', type: 'success' });
      setLUser(rUser);
      setTimeout(() => setTab('login'), 1600);
    } catch { setRAlert({ msg: '❌ Serveur inaccessible.', type: 'error' }); }
    finally { setRLoading(false); }
  }

  const onKeyDown = (e: React.KeyboardEvent, fn: () => void) => {
    if (e.key === 'Enter') fn();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', overflowY: 'auto',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)',
      }} />
      {/* Glow orb */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        width: 600, height: 600,
        background: 'radial-gradient(circle, var(--accentBg) 0%, transparent 65%)',
        transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
        animation: 'orbPulse 7s ease-in-out infinite',
      }} />

      {/* Container */}
      <div style={{
        width: '100%', maxWidth: 420, position: 'relative', zIndex: 2,
        animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Theme toggle */}
        <button onClick={toggleTheme} style={{
          position: 'absolute', top: 0, right: 0,
          width: 38, height: 38,
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--text2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'var(--transition)',
        }}>
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={14} />}
        </button>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32, paddingTop: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 58, height: 58,
            background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
            borderRadius: 18, marginBottom: 16,
            boxShadow: '0 0 0 8px var(--accentBg), 0 0 40px var(--accentGlow)',
          }}>
            <MessageSquare size={26} color="white" strokeWidth={1.8} />
          </div>
          <h1 style={{
            fontFamily: 'Instrument Serif, serif',
            fontSize: 34, fontWeight: 400,
            color: 'var(--text)', letterSpacing: '-0.5px',
            lineHeight: 1,
          }}>
            <span style={{ color: 'var(--accent)' }}>N</span>exus
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6, fontFamily: 'Geist Mono, monospace' }}>
            propulsé par WYD
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 28px 24px',
          boxShadow: 'var(--shadow-lg), 0 0 60px var(--accentBg)',
        } as React.CSSProperties}>
          {/* Tabs */}
          <div style={{
            display: 'flex', background: 'var(--bg2)',
            borderRadius: 'var(--radius)', padding: 4, gap: 4, marginBottom: 24,
          }}>
            {(['login', 'register'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '9px 0', border: 'none',
                background: tab === t ? 'var(--surface)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--text2)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: 13.5, fontWeight: tab === t ? 600 : 400,
                borderRadius: 7, cursor: 'pointer',
                boxShadow: tab === t ? '0 1px 6px rgba(0,0,0,0.2)' : 'none',
                transition: 'var(--transition)',
              }}>
                {t === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          {/* Login form */}
          {tab === 'login' && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <Field label="Nom d'utilisateur" id="l-user">
                <input id="l-user" type="text" placeholder="david123" value={lUser}
                  onChange={e => setLUser(e.target.value)}
                  onKeyDown={e => onKeyDown(e, handleLogin)} style={inputStyle} />
              </Field>
              <Field label="Mot de passe" id="l-pass">
                <input id="l-pass" type="password" placeholder="••••••••" value={lPass}
                  onChange={e => setLPass(e.target.value)}
                  onKeyDown={e => onKeyDown(e, handleLogin)} style={inputStyle} />
              </Field>
              {lAlert && <Alert {...lAlert} />}
              <PrimaryBtn onClick={handleLogin} loading={lLoading}>Se connecter</PrimaryBtn>
            </div>
          )}

          {/* Register form */}
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
                  onKeyDown={e => onKeyDown(e, handleRegister)} style={inputStyle} />
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
    <div style={{ marginBottom: 13 }}>
      <label htmlFor={id} style={{
        display: 'block', fontSize: 10.5, fontWeight: 600,
        color: 'var(--text2)', textTransform: 'uppercase',
        letterSpacing: '0.8px', marginBottom: 6,
        fontFamily: 'Geist Mono, monospace',
      }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', minHeight: 44,
  background: 'var(--bg2)', border: '1.5px solid var(--border2)',
  borderRadius: 'var(--radius)', color: 'var(--text)',
  fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15,
  outline: 'none', transition: 'var(--transition)',
  WebkitAppearance: 'none',
};

function Alert({ msg, type }: { msg: string; type: 'error' | 'success' }) {
  return (
    <div style={{
      marginTop: 10, marginBottom: 4,
      padding: '9px 13px', borderRadius: 8, fontSize: 13,
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
      width: '100%', padding: '13px', marginTop: 10, minHeight: 48,
      background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
      border: 'none', borderRadius: 'var(--radius)',
      color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.6 : 1, transition: 'var(--transition)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      {loading ? <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> : children}
    </button>
  );
}
