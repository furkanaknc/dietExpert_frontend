import React, { useEffect, useRef } from 'react';
import { ChatBubbleLeftEllipsisIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Message from './Message';
import MessageInput from './MessageInput';

const ChatView = ({
  chat,
  messages,
  onSendMessage,
  onSendImageMessage,
  onSendAudioMessage,
  isLoading,
  error,
  user,
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <ChatBubbleLeftEllipsisIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to DietExpert</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Start a new conversation to get personalized nutrition advice, meal plans, and dietary guidance from your AI
            nutrition expert.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <div className="text-red-500 mb-3">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Chat</h3>
          <p className="text-red-600 mb-3 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="border-b border-gray-200 px-4 py-3 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 leading-tight">{chat.title}</h2>
            <p className="text-xs text-gray-500">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <SparklesIcon className="h-3 w-3" />
            <span>DietExpert AI</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center max-w-md">
              <ChatBubbleLeftEllipsisIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-2">{chat.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Ask me about nutrition, diet plans, healthy recipes, or share photos of your meals for analysis. I'm
                here to help you achieve your health goals!
              </p>
            </div>
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <Message key={message.id} message={message} isUser={message.role === 'USER'} user={user} />
            ))}
            {isLoading && (
              <div className="flex gap-3 px-4 py-3 bg-white border-t border-gray-100">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-500 text-white flex items-center justify-center">
                  <SparklesIcon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900 text-sm">DietExpert</span>
                    <span className="text-xs text-gray-500">analyzing...</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="animate-bounce w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <div
                      className="animate-bounce w-1.5 h-1.5 bg-gray-400 rounded-full"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="animate-bounce w-1.5 h-1.5 bg-gray-400 rounded-full"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        onSendImageMessage={onSendImageMessage}
        onSendAudioMessage={onSendAudioMessage}
        isLoading={isLoading}
        disabled={!chat}
      />
    </div>
  );
};

export default ChatView;
