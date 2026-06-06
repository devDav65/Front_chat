export interface User {
  id: number;
  username: string;
}

export interface Session {
  token: string;
  userId: number;
  username: string;
}

export interface ChatSession {
  id: number;
  titre: string;
  updated_at: string;
  user_id: number;
}

export interface Message {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  session_id?: number;
}
