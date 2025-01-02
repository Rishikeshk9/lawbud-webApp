'use client';

import { createContext, useContext, useState } from 'react';

const AIChatContext = createContext();

export function AIChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message) => {
    try {
      setIsLoading(true);

      // Add user message to chat
      const newMessages = [...messages, { role: 'user', content: message }];
      setMessages(newMessages);

      // Get AI response
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      // Add AI response to chat
      setMessages([
        ...newMessages,
        { role: 'assistant', content: data.message },
      ]);
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <AIChatContext.Provider
      value={{ messages, isLoading, sendMessage, clearChat }}
    >
      {children}
    </AIChatContext.Provider>
  );
}

export function useAIChat() {
  const context = useContext(AIChatContext);
  if (context === undefined) {
    throw new Error('useAIChat must be used within an AIChatProvider');
  }
  return context;
}
