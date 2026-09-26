'use client';

import { Suspense } from 'react';
import ChatContent from './chat-content';

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
