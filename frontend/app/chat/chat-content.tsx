'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiCall } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface ChatSession {
  id: string;
  title: string;
  projectId?: string;
  messages: Message[];
  createdAt: string;
}

export default function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams?.get('project') || '';
  const sessionId = searchParams?.get('session') || '';

  const { user, checkAuth } = useAuthStore();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const init = async () => {
      await checkAuth();
    };
    init();
  }, [checkAuth]);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.push('/login');
      return;
    }
    loadSessions();
  }, [user, router, mounted]);

  useEffect(() => {
    if (sessionId && sessions.length > 0) {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
      }
    }
  }, [sessionId, sessions]);

  async function loadSessions() {
    try {
      const data = await apiCall<ChatSession[]>('/chat/sessions');
      setSessions(data);
      if (sessionId) {
        const session = data.find(s => s.id === sessionId);
        if (session) {
          setCurrentSession(session);
        }
      } else if (data.length > 0) {
        setCurrentSession(data[0]);
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      toast.error('Failed to load chat sessions');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateSession() {
    try {
      const session = await apiCall<ChatSession>('/chat/sessions', {
        method: 'POST',
        body: JSON.stringify({
          title: `New Chat ${new Date().toLocaleString()}`,
          projectId: projectId || undefined,
        }),
      });
      setSessions([session, ...sessions]);
      setCurrentSession(session);
      toast.success('Chat created');
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      toast.error('Failed to create chat');
    }
  }

  async function handleSendMessage() {
    if (!messageInput.trim() || !currentSession) return;

    setSending(true);
    const userMessage = messageInput;
    setMessageInput('');

    try {
      const response = await apiCall<Message>(`/chat/sessions/${currentSession.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: userMessage }),
      });

      // Update current session with new messages
      setCurrentSession({
        ...currentSession,
        messages: [
          ...currentSession.messages,
          { id: 'user-' + Date.now(), role: 'user', content: userMessage, createdAt: new Date().toISOString() },
          response,
        ],
      });

      // Update sessions list
      setSessions(
        sessions.map(s =>
          s.id === currentSession.id
            ? {
                ...s,
                messages: [
                  ...s.messages,
                  { id: 'user-' + Date.now(), role: 'user', content: userMessage, createdAt: new Date().toISOString() },
                  response,
                ],
              }
            : s,
        ),
      );
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      toast.error('Failed to send message');
      setMessageInput(userMessage);
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteSession(id: string) {
    if (!confirm('Delete this chat?')) return;
    try {
      await apiCall(`/chat/sessions/${id}`, { method: 'DELETE' });
      setSessions(sessions.filter(s => s.id !== id));
      if (currentSession?.id === id) {
        setCurrentSession(sessions.find(s => s.id !== id) || null);
      }
      toast.success('Chat deleted');
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      toast.error('Failed to delete chat');
    }
  }

  if (!mounted || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <Link href="/dashboard" className="text-blue-400 hover:underline text-sm">
            ← Dashboard
          </Link>
          <button
            onClick={handleCreateSession}
            className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            + New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 border-b border-gray-700 cursor-pointer transition ${
                currentSession?.id === session.id ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
              onClick={() => setCurrentSession(session)}
            >
              <p className="text-sm font-medium truncate">{session.title}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSession(session.id);
                }}
                className="text-xs text-red-400 hover:text-red-300 mt-1"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentSession ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentSession.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Start a conversation...</p>
                </div>
              ) : (
                currentSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-2xl px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-300 p-4 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={sending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !messageInput.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 mb-4">No chat selected</p>
              <button
                onClick={handleCreateSession}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
