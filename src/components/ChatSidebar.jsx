import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  ArrowRightStartOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { formatMessageTime, truncateText, getMessageDisplayText } from '../utils/messageUtils';

const ChatSidebar = ({ chats, currentChatId, onSelectChat, onCreateChat, onDeleteChat, onRenameChat, isLoading }) => {
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();

  const handleRenameStart = (chat, e) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleRenameSubmit = async (chatId, e) => {
    e.preventDefault();
    if (editTitle.trim()) {
      await onRenameChat(chatId, editTitle.trim());
    }
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleRenameCancel = () => {
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleDelete = (chatId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      onDeleteChat(chatId);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
    setShowUserMenu(false);
  };

  const getLastMessagePreview = (chat) => {
    if (!chat.messages || chat.messages.length === 0) return 'No messages yet';

    const lastMessage = chat.messages[chat.messages.length - 1];
    const text = getMessageDisplayText(lastMessage);
    return text || 'Media message';
  };

  const getUserDisplayName = () => {
    if (user?.isGuest) {
      return 'Guest User';
    }
    const firstName = user?.first_name || user?.username || user?.email?.split('@')[0] || 'User';
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-100">
        <button
          onClick={onCreateChat}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
        ) : chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <ChatBubbleLeftIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No chats yet</p>
            <p className="text-xs text-gray-400">Create your first chat</p>
          </div>
        ) : (
          <div className="p-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`relative group p-2 mb-1 rounded-md cursor-pointer transition-all duration-200 ${
                  currentChatId === chat.id ? 'bg-blue-50 border border-blue-200 shadow-sm' : 'hover:bg-gray-50'
                }`}
              >
                {editingChatId === chat.id ? (
                  <form onSubmit={(e) => handleRenameSubmit(chat.id, e)} className="w-full">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={handleRenameCancel}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') handleRenameCancel();
                      }}
                      className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-medium text-gray-900 text-sm mb-1 truncate leading-tight">{chat.title}</h3>
                        <p className="text-xs text-gray-500 truncate leading-tight">
                          {truncateText(getLastMessagePreview(chat), 35)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{formatMessageTime(chat.updated_at)}</p>
                      </div>

                      {/* Action buttons */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={(e) => handleRenameStart(chat, e)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Rename"
                        >
                          <PencilIcon className="h-3 w-3 text-gray-500" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(chat.id, e)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="h-3 w-3 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Menu */}
      <div className="border-t border-gray-200">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{getUserDisplayName()}</p>
              <p className="text-xs text-gray-500 truncate">{user?.isGuest ? 'Guest Session' : user?.email}</p>
            </div>
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              {/* Menu */}
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500">{user?.isGuest ? 'Guest Session' : user?.email}</p>
                </div>
                {!user?.isGuest && (
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full p-3 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                    <span className="text-sm">Profile Settings</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full p-3 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors text-red-600"
                >
                  <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
