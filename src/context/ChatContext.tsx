import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  hasMessages: boolean;
  setHasMessages: (hasMessages: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [hasMessages, setHasMessages] = useState(false);

  return (
    <ChatContext.Provider value={{ hasMessages, setHasMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
