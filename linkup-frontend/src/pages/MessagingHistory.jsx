import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMessageSquare, FiUsers, FiClock } from 'react-icons/fi';

const MessagingHistory = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessagingHistory();
  }, []);

  const fetchMessagingHistory = async () => {
    try {
      const response = await api.get('/chat/history');
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching messaging history:', error);
      toast.error('Failed to load messaging history');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleConversationClick = (conversation) => {
    if (conversation.type === 'private') {
      navigate(`/chat/${conversation.participantId}`);
    } else {
      navigate(`/chat/team/${conversation.participantId}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Messaging History</h1>
        <p className="text-gray-600">Your conversations with people and teams</p>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-500">Start chatting with people or join teams to see your conversations here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <div
              key={`${conversation.type}-${conversation.participantId}`}
              onClick={() => handleConversationClick(conversation)}
              className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all duration-200"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {conversation.type === 'private' ? (
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold text-lg">
                      {conversation.participant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <FiUsers className="w-6 h-6 text-purple-600" />
                  </div>
                )}
              </div>

              {/* Conversation Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {conversation.participant.name}
                    {conversation.type === 'team' && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Team
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <FiClock className="w-3 h-3 mr-1" />
                    {formatTime(conversation.lastMessage.timestamp)}
                  </div>
                </div>

                <p className="text-sm text-gray-600 truncate">
                  {conversation.lastMessage.sender &&
                   conversation.lastMessage.sender.toString() === user?._id?.toString() ? (
                    <span className="font-medium">You: </span>
                  ) : conversation.type === 'team' ? (
                    <span className="font-medium">
                      {conversation.lastMessage.sender?.name || 'Someone'}: </span>
                  ) : null}
                  {conversation.lastMessage.message}
                </p>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {conversation.messageCount} messages
                  </span>
                  {conversation.unreadCount > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {conversation.unreadCount} new
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow indicator */}
              <div className="flex-shrink-0 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagingHistory;