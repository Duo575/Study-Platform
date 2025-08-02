import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Users,
  Crown,
  Shield,
  User,
  Clock,
} from 'lucide-react';
import { useSocialStore } from '../../store/socialStore';
import type { GroupMessage, StudyGroup } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface GroupChatProps {
  group: StudyGroup;
  className?: string;
}

const GroupChat: React.FC<GroupChatProps> = ({ group, className = '' }) => {
  const { messages, sendMessage, fetchGroupMessages, isLoading } =
    useSocialStore();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchGroupMessages(group.id);
  }, [group.id, fetchGroupMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(group.id, newMessage.trim());
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const getMemberRole = (userId: string) => {
    const member = group.members.find(m => m.userId === userId);
    return member?.role || 'member';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-3 h-3 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-3 h-3 text-blue-500" />;
      default:
        return <User className="w-3 h-3 text-gray-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'text-yellow-600';
      case 'admin':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const groupedMessages = messages.reduce(
    (groups: GroupMessage[][], message, index) => {
      if (index === 0 || messages[index - 1].userId !== message.userId) {
        groups.push([message]);
      } else {
        groups[groups.length - 1].push(message);
      }
      return groups;
    },
    []
  );

  return (
    <div
      className={`flex flex-col h-full bg-white rounded-lg shadow-sm ${className}`}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{group.name}</h3>
            <p className="text-sm text-gray-500">
              {group.stats.activeMembers} of {group.stats.totalMembers} members
              online
            </p>
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Users className="w-12 h-12 text-gray-300 mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-1">
              No messages yet
            </h4>
            <p className="text-gray-600 text-sm">
              Be the first to start the conversation!
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {groupedMessages.map((messageGroup, groupIndex) => (
              <motion.div
                key={`group-${groupIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1"
              >
                {/* Message Group Header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {messageGroup[0].username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium text-sm ${getRoleColor(getMemberRole(messageGroup[0].userId))}`}
                    >
                      {messageGroup[0].username}
                    </span>
                    {getRoleIcon(getMemberRole(messageGroup[0].userId))}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(messageGroup[0].timestamp, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>

                {/* Messages in Group */}
                {messageGroup.map(message => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-10"
                  >
                    <div
                      className={`inline-block max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        message.type === 'system'
                          ? 'bg-gray-100 text-gray-600 text-sm italic'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>

                    {/* Message Reactions */}
                    {message.reactions.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {message.reactions.map(reaction => (
                          <button
                            key={reaction.emoji}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded-full text-xs transition-colors"
                          >
                            <span>{reaction.emoji}</span>
                            <span className="text-gray-600">
                              {reaction.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <div className="flex-1">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || isLoading}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {isTyping && (
          <div className="mt-2 text-xs text-gray-500">Someone is typing...</div>
        )}
      </div>
    </div>
  );
};

export default GroupChat;
