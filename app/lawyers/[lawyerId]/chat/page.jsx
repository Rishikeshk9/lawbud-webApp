'use client';

import { useEffect, useState } from 'react';
import { AIChatInterface } from '@/components/AIChatInterface';
import { HumanChatInterface } from '@/components/HumanChatInterface';
import { useLawyers } from '@/app/contexts/LawyersContext';
import { AIChatProvider } from '@/app/contexts/AIChatContext';
import { useParams } from 'next/navigation';

export default function ChatPage() {
  const { lawyerId } = useParams();
  const { lawyers } = useLawyers();
  const [lawyer, setLawyer] = useState(null);

  useEffect(() => {
    const foundLawyer = lawyers.find((l) => l.id === lawyerId);
    setLawyer(foundLawyer);
  }, [lawyerId, lawyers]);

  if (!lawyer) {
    return <div>Loading...</div>;
  }

  // Render AI chat interface for AI lawyer
  if (lawyer.isAI) {
    return (
      <AIChatProvider>
        <div className='flex flex-col h-screen'>
          <AIChatInterface />
        </div>
      </AIChatProvider>
    );
  }

  // Render regular chat interface for human lawyers
  return (
    <div className='flex flex-col h-screen'>
      <HumanChatInterface lawyer={lawyer} />
    </div>
  );
}
