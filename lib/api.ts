const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function apiFetch(path: string, token: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...opts.headers,
    },
  });
  return res;
}

export async function apiLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res;
}

export async function apiRegister(data: {
  username: string; nom: string; prenom: string; email: string; password: string;
}) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res;
}

export async function apiGetSessions(token: string) {
  return apiFetch('/api/sessions', token);
}

export async function apiCreateSession(token: string, titre = 'Nouvelle conversation') {
  return apiFetch('/api/sessions', token, {
    method: 'POST',
    body: JSON.stringify({ titre }),
  });
}

export async function apiDeleteSession(token: string, id: number) {
  return apiFetch(`/api/sessions/${id}`, token, { method: 'DELETE' });
}

export async function apiRenameSession(token: string, id: number, titre: string) {
  return apiFetch(`/api/sessions/${id}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ titre }),
  });
}

export async function apiGetMessages(token: string, sessionId: number) {
  return apiFetch(`/api/sessions/${sessionId}/messages`, token);
}

export async function apiSendMessage(token: string, sessionId: number, message: string) {
  return apiFetch('/api/chat', token, {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId, message }),
  });
}
