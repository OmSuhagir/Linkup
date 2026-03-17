import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useSocket from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiSend } from 'react-icons/fi';

const Chat = () => {
  const { userId, teamId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [recipient, setRecipient] = useState(null);
  const messagesEndRef = useRef(null);
  const { socket, isConnected, socketError, sendMessage, sendTeamMessage } = useSocket();

  const currentUserId = currentUser?._id || currentUser?.id;

  // Debug: Log the current user object
  useEffect(() => {
    console.log('Current user object:', currentUser);
    console.log('Current user ID (from _id or id):', currentUserId);
  }, [currentUser, currentUserId]);

  const isTeamChat = Boolean(teamId);
  const chatId = teamId ?? userId;

  // Debug logging
  console.log('Chat component mounted/updated:', { userId, teamId, chatId, isTeamChat, currentUserId, authLoading });

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Redirect if no chatId provided
  useEffect(() => {
    if (!chatId) {
      toast.error('Please select a user or team to chat with');
      navigate('/dashboard');
    }
  }, [chatId, navigate]);

  const fetchRecipientInfo = async () => {
    try {
      // Don't fetch if chatId is undefined
      if (!chatId) return;

      if (isTeamChat) {
        const response = await api.get(`/teams/${chatId}`);
        setRecipient(response.data);
      } else {
        const response = await api.get(`/users/${chatId}`);
        setRecipient(response.data);
      }
    } catch (error) {
      console.error('Error fetching recipient info:', error);
    }
  };

  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      return;
    }

    // Wait for auth to load before fetching messages
    if (authLoading) {
      console.log('Waiting for auth to load...');
      return;
    }

    // Only fetch if we have a valid chatId (not "undefined" string)
    if (chatId !== 'undefined' && chatId) {
      fetchMessages();
      fetchRecipientInfo();
    }
  }, [chatId, authLoading]);

  // Separate useEffect for socket operations to prevent double-joining
  useEffect(() => {
    if (!socket || !chatId || chatId === 'undefined' || authLoading) {
      console.log('Socket join skipped:', { hasSocket: !!socket, chatId, authLoading });
      return;
    }

    console.log('Attempting socket join:', { chatId, isTeamChat });
    if (isTeamChat) {
      console.log('Emitting joinTeam:', chatId);
      socket.emit('joinTeam', chatId);
    } else {
      console.log('Emitting joinUser:', chatId);
      socket.emit('joinUser', chatId);
    }
  }, [chatId, isTeamChat, socket, authLoading]);

  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (message) => {
        setMessages(prev => {
          // Remove temporary message with same content and add confirmed message
          const messageContent = message.message;
          const filtered = prev.filter(msg => !msg.temporary || msg.message !== messageContent);
          return [...filtered, message];
        });
      };

      const handleReceiveTeamMessage = (message) => {
        if (message.teamId === chatId) {
          setMessages(prev => {
            // Remove temporary message with same content and add confirmed message
            const messageContent = message.message;
            const filtered = prev.filter(msg => !msg.temporary || msg.message !== messageContent);
            return [...filtered, message];
          });
        }
      };

      const handleServerError = (error) => {
        console.error('Server error received:', error);
        toast.error('Failed to send message: ' + (error.message || 'Unknown error'));
        // Remove any temporary messages on server error
        setMessages(prev => prev.filter(msg => !msg.temporary));
      };

      socket.on('receiveMessage', handleReceiveMessage);
      socket.on('receiveTeamMessage', handleReceiveTeamMessage);
      socket.on('serverError', handleServerError);
      socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });

      return () => {
        socket.off('receiveMessage', handleReceiveMessage);
        socket.off('receiveTeamMessage', handleReceiveTeamMessage);
        socket.off('serverError', handleServerError);
        socket.off('connect_error');
      };
    }
  }, [socket, chatId]);

  const fetchMessages = async () => {
    try {
      let response;
      if (isTeamChat) {
        response = await api.get(`/chat/team/${chatId}`);
      } else {
        response = await api.get(`/chat/${chatId}`);
      }

      // Backend returns { messages }
      setMessages(response.data?.messages ?? response.data ?? []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Validate auth is loaded
    if (authLoading) {
      console.error('Auth still loading');
      toast.error('Please wait while your session loads...');
      return;
    }
    
    // Validate all required fields
    if (!currentUserId) {
      console.error('Current user ID is missing:', currentUserId);
      toast.error('User session lost. Please refresh the page.');
      return;
    }

    if (!chatId || chatId === 'undefined') {
      console.error('Chat ID is invalid:', chatId);
      toast.error('Invalid chat ID. Please reload the page.');
      return;
    }

    if (!newMessage.trim() || !isConnected) {
      if (!isConnected) {
        toast.error('Connection lost. Trying to reconnect...');
      }
      return;
    }

    const trimmedMessage = newMessage.trim();

    // Optimistic update - add message to state immediately
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      sender: currentUserId,
      message: trimmedMessage,
      timestamp: new Date().toISOString(),
      temporary: isTeamChat // Only mark as temporary for team messages (sender gets confirmation back)
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      if (isTeamChat) {
        console.log('Chat: Sending team message', { senderId: currentUserId, teamId: chatId, message: trimmedMessage });
        sendTeamMessage({
          senderId: currentUserId,
          teamId: chatId,
          message: trimmedMessage,
        });
      } else {
        console.log('Chat: Sending private message', { senderId: currentUserId, receiverId: chatId, message: trimmedMessage });
        sendMessage({
          senderId: currentUserId,
          receiverId: chatId,
          message: trimmedMessage,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
      toast.error('Failed to send message');
    }
  };

  if (loading || authLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
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
    <div className="flex flex-col h-[calc(100vh-8rem)] p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isTeamChat ? 'Team Chat' : 'Private Chat'}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <div className={`w-2 h-2 rounded-full ${authLoading ? 'bg-yellow-500' : isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <p className="text-gray-600">
            {authLoading ? 'Loading session...' : isConnected ? 'Connected' : 'Connecting...'}
          </p>
        </div>
        {socketError && (
          <p className="text-red-600 text-sm mt-2">Error: {socketError}</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-2">
        {messages.length > 0 ? (
          messages.map((message) => {
            const senderId = (message.sender && message.sender._id) || message.sender || message.senderId;
            const isMine = senderId === currentUserId;
            const senderName = (message.sender && message.sender.name) || currentUser?.name || 'You';

            return (
              <div
                key={message._id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    isMine ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-900'
                  } ${
                    message.temporary ? 'opacity-60' : ''
                  }`}
                >
                  {!isMine && isTeamChat && (
                    <p className="text-xs font-semibold mb-1 opacity-75">{senderName}</p>
                  )}
                  <p className="break-words">{message.message}</p>
                  <p className={`text-xs mt-1 ${isMine ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {new Date(message.timestamp || message.createdAt || Date.now()).toLocaleTimeString()}
                  </p>
                  {message.temporary && (
                    <p className="text-xs mt-1 opacity-75">Sending...</p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start the conversation!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          placeholder={authLoading ? 'Loading...' : isConnected ? 'Type a message...' : 'Connecting...'}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-100"
          disabled={!isConnected || authLoading}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || !isConnected || authLoading}
          title={authLoading ? 'Loading session...' : isConnected ? 'Send message' : 'Waiting for connection'}
          className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-indigo-500/20 font-medium whitespace-nowrap"
        >
          <FiSend className="w-4 h-4 -ml-1" />
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;