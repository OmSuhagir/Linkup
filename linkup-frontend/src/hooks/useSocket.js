import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const useSocket = () => {
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketError, setSocketError] = useState(null);

  useEffect(() => {
    if (user && token) {
      // Connect to socket server
      socketRef.current = io('http://localhost:5000', {
        auth: {
          token,
        },
      });

      socketRef.current.on('connect', () => {
        setIsConnected(true);
        setSocketError(null);
        console.log('Connected to socket server');
      });

      socketRef.current.on('disconnect', (reason) => {
        setIsConnected(false);
        console.log('Disconnected from socket server, reason:', reason);
      });

      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
        setSocketError(error);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        setSocketError(error.message);

        // If it's an authentication error, try to refresh the token
        if (error.message === 'Authentication error') {
          console.log('Authentication failed, checking token...');
          const storedToken = localStorage.getItem('token');
          if (storedToken) {
            try {
              // Check if token is expired
              const payload = JSON.parse(atob(storedToken.split('.')[1]));
              const currentTime = Date.now() / 1000;
              if (payload.exp < currentTime) {
                console.error('Token expired, user needs to login again');
                setSocketError('Session expired. Please login again.');
                // You could trigger a logout here
              }
            } catch (e) {
              console.error('Error parsing token:', e);
            }
          }
        }
      });

      // Listen for server-side errors (emitted by backend)
      socketRef.current.on('serverError', (errorData) => {
        console.error('Server error received:', errorData);
        setSocketError(errorData.message || 'Server error occurred');
      });

      // Join user room
      socketRef.current.emit('joinUser', user._id);

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user, token]);

  const joinTeam = (teamId) => {
    if (socketRef.current) {
      socketRef.current.emit('joinTeam', teamId);
    }
  };

  const leaveTeam = (teamId) => {
    if (socketRef.current) {
      socketRef.current.emit('leaveTeam', teamId);
    }
  };

  const sendMessage = (messageData) => {
    if (!messageData || !messageData.senderId || !messageData.receiverId || !messageData.message) {
      console.error('Frontend: Invalid message data, missing required fields:', messageData);
      return;
    }
    
    if (socketRef.current && socketRef.current.connected) {
      console.log('Frontend: Emitting sendMessage', messageData);
      socketRef.current.emit('sendMessage', messageData);
    } else {
      console.error('Frontend: Socket not connected, cannot send message');
    }
  };

  const sendTeamMessage = (messageData) => {
    if (!messageData || !messageData.senderId || !messageData.teamId || !messageData.message) {
      console.error('Frontend: Invalid team message data, missing required fields:', messageData);
      return;
    }
    
    if (socketRef.current && socketRef.current.connected) {
      console.log('Frontend: Emitting sendTeamMessage', messageData);
      socketRef.current.emit('sendTeamMessage', messageData);
    } else {
      console.error('Frontend: Socket not connected, cannot send team message');
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    socketError,
    joinTeam,
    leaveTeam,
    sendMessage,
    sendTeamMessage,
  };
};

export default useSocket;