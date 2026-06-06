'use client';
import { useApp } from '@/context/AppContext';
import AuthScreen from '@/components/AuthScreen';
import ChatScreen from '@/components/ChatScreen';

export default function Home() {
  const { session } = useApp();
  return session ? <ChatScreen /> : <AuthScreen />;
}
