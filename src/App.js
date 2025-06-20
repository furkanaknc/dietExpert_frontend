import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatSidebar from './components/ChatSidebar';
import ChatView from './components/ChatView';
import AuthScreen from './components/AuthScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { chatAPI } from './services/api';

import { createTextContent, createImageContent, createAudioContent } from './utils/messageUtils';
import { parseBackendError } from './utils/errorHandler';

function ChatApp() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { chatId: urlChatId } = useParams();

  const userId = user?.id;

  const loadUserChats = useCallback(async () => {
    try {
      setIsLoadingChats(true);
      const userChats = await chatAPI.getUserChats(userId);
      setChats(userChats || []);
    } catch (err) {
      console.error('Failed to load chats:', err);
      setError(parseBackendError(err));
    } finally {
      setIsLoadingChats(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadUserChats();
    }
  }, [isAuthenticated, userId, loadUserChats]);

  useEffect(() => {
    if (urlChatId) {
      setCurrentChatId(urlChatId);
    }
  }, [urlChatId]);

  useEffect(() => {
    if (currentChatId) {
      loadChatMessages(currentChatId);
    }
  }, [currentChatId]);

  const loadChatMessages = async (chatId) => {
    try {
      setError(null);
      const chat = await chatAPI.getChatDetail(chatId);
      setCurrentChat(chat);
      setMessages(chat.messages || []);
    } catch (err) {
      console.error('Failed to load chat:', err);
      setError(parseBackendError(err));
      setCurrentChat(null);
      setMessages([]);
    }
  };

  const handleSelectChat = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  const handleCreateChat = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const newChatData = {
        title: 'New Chat',
        user_id: userId,
        content: createTextContent(''),
      };

      const newChat = await chatAPI.createChat(newChatData);

      setChats((prev) => [newChat, ...prev]);
      navigate(`/chat/${newChat.id}`);
    } catch (err) {
      console.error('Failed to create chat:', err);
      setError(parseBackendError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = useCallback(
    async (messageText) => {
      if (!currentChatId || !messageText.trim()) return;

      try {
        setIsLoading(true);
        setError(null);

        const content = createTextContent(messageText);
        const response = await chatAPI.sendMessage(currentChatId, content);

        const userMessage = response.userMessage;
        const aiMessage = response.aiMessage;

        if (userMessage && aiMessage) {
          setMessages((prev) => [...prev, userMessage, aiMessage]);

          setChats((prev) =>
            prev.map((chat) =>
              chat.id === currentChatId
                ? {
                    ...chat,
                    updated_at: aiMessage.created_at,
                    messages: [...(chat.messages || []), userMessage, aiMessage],
                  }
                : chat,
            ),
          );
        }
      } catch (err) {
        console.error('Failed to send message:', err);
        setError(parseBackendError(err));
      } finally {
        setIsLoading(false);
      }
    },
    [currentChatId],
  );

  const handleSendImageMessage = useCallback(
    async (messageText, imageData, mimeType) => {
      if (!currentChatId) return;

      try {
        setIsLoading(true);
        setError(null);

        const imageUrl = `data:${mimeType};base64,${imageData}`;
        const content = createImageContent(messageText, imageUrl, {
          format: mimeType.split('/')[1] || 'jpg',
          alt_text: 'Uploaded food image',
        });

        const response = await chatAPI.sendImageMessage(currentChatId, content, imageData, mimeType);

        const userMessage = response.userMessage;
        const aiMessage = response.aiMessage;

        if (userMessage && aiMessage) {
          setMessages((prev) => [...prev, userMessage, aiMessage]);

          setChats((prev) =>
            prev.map((chat) =>
              chat.id === currentChatId
                ? {
                    ...chat,
                    updated_at: aiMessage.created_at,
                    messages: [...(chat.messages || []), userMessage, aiMessage],
                  }
                : chat,
            ),
          );
        }
      } catch (err) {
        console.error('Failed to send image message:', err);
        setError(parseBackendError(err));
      } finally {
        setIsLoading(false);
      }
    },
    [currentChatId],
  );

  const handleSendAudioMessage = useCallback(
    async (messageText, audioData, mimeType) => {
      if (!currentChatId) return;

      try {
        setIsLoading(true);
        setError(null);

        const audioUrl = `data:${mimeType};base64,${audioData}`;
        const content = createAudioContent(messageText, audioUrl, {
          format: mimeType.split('/')[1] || 'webm',
          duration: 0,
          transcription: messageText,
        });

        const response = await chatAPI.sendAudioMessage(currentChatId, content, audioData, mimeType);
        const userMessage = response.userMessage;
        const aiMessage = response.aiMessage;

        if (userMessage && aiMessage) {
          setMessages((prev) => [...prev, userMessage, aiMessage]);

          setChats((prev) =>
            prev.map((chat) =>
              chat.id === currentChatId
                ? {
                    ...chat,
                    updated_at: aiMessage.created_at,
                    messages: [...(chat.messages || []), userMessage, aiMessage],
                  }
                : chat,
            ),
          );
        }
      } catch (err) {
        console.error('Failed to send audio message:', err);
        setError(parseBackendError(err));
      } finally {
        setIsLoading(false);
      }
    },
    [currentChatId],
  );

  const handleRenameChat = async (chatId, newTitle) => {
    try {
      await chatAPI.updateChatTitle(chatId, userId, newTitle);

      setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, title: newTitle } : chat)));

      if (currentChat?.id === chatId) {
        setCurrentChat((prev) => ({ ...prev, title: newTitle }));
      }
    } catch (err) {
      console.error('Failed to rename chat:', err);
      setError(parseBackendError(err));
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await chatAPI.deleteChat(chatId, userId);
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setCurrentChat(null);
        setMessages([]);
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
      setError(parseBackendError(err));
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading DietExpert...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="h-screen flex bg-gray-100 relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onCreateChat={handleCreateChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        isLoading={isLoadingChats}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={setIsSidebarOpen}
      />

      {/* Main Chat Area */}
      <ChatView
        chat={currentChat}
        messages={messages}
        onSendMessage={handleSendMessage}
        onSendImageMessage={handleSendImageMessage}
        onSendAudioMessage={handleSendAudioMessage}
        isLoading={isLoading}
        error={error}
        user={user}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        isSidebarOpen={isSidebarOpen}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ChatApp />
    </AuthProvider>
  );
}

export default App;
