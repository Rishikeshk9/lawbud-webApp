'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, Bot, LogIn, Menu } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';

export function AIChatInterface({ lawyer }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modified useEffect to load latest chat
  useEffect(() => {
    const initialize = async () => {
      await checkAuthStatus();
      // const chats = await fetchChats();

      // If there are existing chats, load the latest one
      if (chats && chats.length > 0) {
        const latestChat = chats[0]; // Since chats are ordered by created_at DESC
        setSelectedChat(latestChat);

        await fetchMessages(latestChat.id);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      fetchChats();
    }
  }, [isSidebarOpen, selectedChat]);

  // Modified fetchChats to return the chats
  const fetchChats = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) return [];

      // Query the ai_chats table and join with ai_messages
      // - Gets all fields from ai_chats (*)
      // - Also gets created_at timestamps from related ai_messages
      // - Filters to only get chats for current user
      // - Orders by chat creation date descending (newest first)
      const { data: chats, error } = await supabase
        .from('ai_chats')
        .select('*, ai_messages(created_at)')
        .eq('user_id', session.session.user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Format chats with latest message date
      const formattedChats = chats.map((chat) => ({
        ...chat,
        latest_message:
          chat.ai_messages.length > 0
            ? new Date(
                Math.max(...chat.ai_messages.map((m) => new Date(m.created_at)))
              )
            : new Date(chat.created_at),
      }));

      setChats(formattedChats);
      return formattedChats;
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch chat history',
        variant: 'destructive',
      });
      return [];
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const { data: messages, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (params.chatId) {
      setSelectedChat(params.chatId);
      console.log('selectedChat', params.chatId);
      fetchMessages(params.chatId);
    }
  }, [params.chatId]);

  // Initialize chat if none exists
  const initializeChat = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id || isAnonymous) return null;

      const { data: chat, error } = await supabase
        .from('ai_chats')
        .insert([{ user_id: session.session.user.id }])
        .select()
        .single();

      if (error) throw error;

      setSelectedChat(chat);
      router.push(`/chats/ai/${chat.id}`);
      return chat.id;
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new chat',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Modified handleSendMessage to ensure chat exists
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    try {
      setIsLoading(true);

      // // Ensure we have a chat ID if user is logged in
      // let currentChatId = chatId;
      // if (!isAnonymous && !currentChatId) {
      //   currentChatId = await initializeChat();
      // }

      // Add user message to UI
      const newUserMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newUserMessage]);

      // Save user message if logged in
      if (!isAnonymous && selectedChat) {
        await saveMessage(userMessage, 'user', selectedChat);
      }

      // Add typing indicator
      setMessages((prev) => [...prev, { role: 'typing', content: '' }]);

      // Get AI response
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          chatId: selectedChat,
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();

      // Remove typing indicator and add AI response
      const aiMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) =>
        prev.filter((msg) => msg.role !== 'typing').concat([aiMessage])
      );

      // Save AI response if logged in
      if (!isAnonymous && selectedChat) {
        await saveMessage(data.message, 'assistant', selectedChat);
      }

      // Update chats list if this is a new chat
      // if (!isAnonymous && !chatId) {
      //   fetchChats();
      // }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => prev.filter((msg) => msg.role !== 'typing'));
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Modified saveMessage function to accept chatId parameter
  const saveMessage = async (content, role, currentChatId) => {
    if (isAnonymous) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) throw new Error('No user session');

      const { error: messageError } = await supabase
        .from('ai_messages')
        .insert([
          {
            chat_id: currentChatId,
            content,
            role,
            user_id: session.session.user.id,
          },
        ]);

      if (messageError) throw messageError;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  };

  // Modified createNewChat function
  const createNewChat = async () => {
    setSelectedChat(null);

    setMessages([]);
    if (!isAnonymous) {
      await initializeChat();
    }
  };

  // Check auth status
  const checkAuthStatus = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setIsAnonymous(true);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className='flex w-full h-screen'>
      {/* Mobile Header */}
      <div className='fixed top-0 left-0 right-0 z-50 flex items-center gap-4 p-4 text-white bg-black border-b border-gray-800 '>
        <Button variant='ghost' size='icon' onClick={() => router.back()}>
          <ArrowLeft className='w-5 h-5' />
        </Button>
        {!isAnonymous && (
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsSidebarOpen(true)}
            className=''
          >
            <Menu className='w-5 h-5' />
          </Button>
        )}
        <div
          onClick={() => router.push('/lawyers/0')}
          className='flex flex-row items-center gap-2'
        >
          <Avatar className='w-8 h-8'>
            <AvatarFallback>
              <Bot className='w-4 h-4' />
            </AvatarFallback>
          </Avatar>
          <div className='flex-1'>
            <h2 className='text-lg font-semibold'>AI Legal Assistant</h2>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {!isAnonymous && (
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side='left' className='w-[300px] p-0 bg-black'>
            <SheetHeader className='flex flex-row items-center justify-between p-4 space-y-0 align-middle border-b border-gray-800'>
              <SheetTitle className='text-lg font-semibold text-white'>
                Chat History
              </SheetTitle>

              <Button
                onClick={() => {
                  createNewChat();
                  setIsSidebarOpen(false);
                }}
                variant='outline'
              >
                New Chat
              </Button>
            </SheetHeader>
            <ScrollArea className='flex-1 p-2'>
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    //setIsSidebarOpen(false);
                    router.push(`/chats/ai/${chat.id}`);
                  }}
                  className={`p-3 rounded  mb-2 cursor-pointer   ${
                    selectedChat === chat.id && params.chatId === chat.id
                      ? 'bg-white   text-black'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <div className='text-sm '>
                    Chat - {new Date(chat.latest_message).toLocaleDateString()}
                  </div>
                  <div className='text-xs text-gray-400'>
                    {new Date(chat.latest_message).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Sidebar */}
      {!isAnonymous && (
        <div className='flex-col hidden p-4 bg-black border-r border-gray-800 w-80 '>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-white'>Chats</h3>
            <Button onClick={createNewChat} variant='outline' size='sm'>
              New Chat
            </Button>
          </div>
          <ScrollArea className='flex-1'>
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setSelectedChat(chat);
                  router.push(`/chats/ai/${chat.id}`);
                }}
                className={`p-3 rounded-lg mb-2 cursor-pointer hover:bg-gray-900 ${
                  selectedChat?.id === chat.id ? 'bg-gray-900' : ''
                }`}
              >
                <div className='text-sm text-white'>
                  Chat {new Date(chat.latest_message).toLocaleDateString()}
                </div>
                <div className='text-xs text-gray-400'>
                  {new Date(chat.latest_message).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}

      {/* Chat Interface */}
      <div className='flex flex-col flex-1'>
        {/* Desktop Header */}
        <div className='fixed top-0 z-40 items-center hidden w-full gap-4 p-4 text-white bg-black border-b border-gray-800 md:flex'>
          <Button variant='ghost' size='icon' onClick={() => router.back()}>
            <ArrowLeft className='w-5 h-5' />
          </Button>
          <Avatar className='w-8 h-8'>
            <AvatarFallback>
              <Bot className='w-4 h-4' />
            </AvatarFallback>
          </Avatar>
          <div className='flex-1'>
            <h2 className='text-lg font-semibold'>AI Legal Assistant</h2>
          </div>
        </div>

        {/* Anonymous Alert */}
        {isAnonymous && (
          <Alert className='mx-4 mt-16'>
            <AlertDescription className='flex flex-wrap items-center justify-between gap-2'>
              <span>
                You are in anonymous mode. Your chat history won't be saved.
              </span>
              <Button asChild variant='outline' size='sm'>
                <Link href='/login' className='flex items-center gap-2'>
                  <LogIn className='w-4 h-4' />
                  <span className='hidden sm:inline'>Login to save chats</span>
                  <span className='sm:hidden'>Login</span>
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Messages */}
        <ScrollArea
          ref={scrollAreaRef}
          className='flex-1  py-1 px-4 w-full max-h-[calc(100vh-8rem)] mt-16'
        >
          <div className='max-w-2xl mx-auto space-y-4'>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'typing' ? (
                  <div className='flex items-center p-3 space-x-2 rounded-lg bg-muted'>
                    <div
                      className='w-2 h-2 bg-gray-500 rounded-full animate-bounce'
                      style={{ animationDelay: '0ms' }}
                    ></div>
                    <div
                      className='w-2 h-2 bg-gray-500 rounded-full animate-bounce'
                      style={{ animationDelay: '150ms' }}
                    ></div>
                    <div
                      className='w-2 h-2 bg-gray-500 rounded-full animate-bounce'
                      style={{ animationDelay: '300ms' }}
                    ></div>
                  </div>
                ) : (
                  <div className='flex flex-col gap-2'>
                    <div
                      className={`max-w-[85%]   rounded-lg w-full  px-3 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto border'
                          : 'bg-black text-white'
                      }`}
                    >
                      <p
                        dangerouslySetInnerHTML={{
                          __html: message.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/__(.*?)__/g, '<em>$1</em>'),
                        }}
                      ></p>
                      <p
                        className={`text-xs text-gray-400  flex mt-1 pr-3  whitespace-normal text-nowrap ${
                          message.role === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {(message.created_at &&
                          new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })) ||
                          (message.timestamp &&
                            new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            }))}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Form */}
        <form
          onSubmit={handleSendMessage}
          className='fixed bottom-0 z-40 flex justify-center w-full p-4 bg-black border-t border-gray-800'
        >
          <div className='flex w-full max-w-2xl gap-2 px-4'>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Type your message...'
              disabled={isLoading}
              className='flex-1 w-full text-white ring-0 focus:ring-0 focus:outline-none'
            />
            <Button type='submit' disabled={isLoading}>
              <Send className='w-4 h-4' />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
