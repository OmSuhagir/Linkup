import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import useSocket from '../hooks/useSocket';
import { FiBell, FiUsers, FiMessageSquare, FiUser, FiCheck, FiX } from 'react-icons/fi';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNotification = (notification) => {
        console.log('Received notification from socket:', notification);
        console.log('Notification relatedUser:', notification.relatedUser);
        setNotifications(prev => [notification, ...prev]);
      };

      socket.on('notification', handleNotification);

      return () => {
        socket.off('notification', handleNotification);
      };
    }
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error(error.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (teamId, userId, notificationId) => {
    try {
      await api.post('/teams/approve', { teamId, userId });
      toast.success('Member approved!');
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error.response?.data?.message || 'Failed to approve member');
    }
  };

  const handleRejectRequest = async (teamId, userId, notificationId) => {
    try {
      await api.post('/teams/reject', { teamId, userId });
      toast.success('Request rejected');
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase?.()) {
      case 'team_request':
        return <FiUsers className="w-5 h-5 text-indigo-500" />;
      case 'new_message':
        return <FiMessageSquare className="w-5 h-5 text-emerald-500" />;
      case 'nearby_user':
        return <FiUser className="w-5 h-5 text-purple-500" />;
      default:
        return <FiBell className="w-5 h-5 text-slate-400" />;
    }
  };

  const getNotificationLink = (notification) => {
    console.log('Notification object:', notification);
    
    if (!notification) {
      console.error('Notification is null/undefined');
      return '#';
    }

    let link = '#';
    const notificationType = notification.type?.toLowerCase?.() || '';
    
    if (notificationType === 'team_request') {
      const teamId = notification.teamId?._id || notification.teamId;
      if (teamId && teamId !== 'undefined') {
        link = `/team/${teamId}`;
      }
    } else if (notificationType === 'new_message') {
      // Handle both cases: relatedUser as object {_id: '...'} or as string
      let relatedUserId = null;
      
      if (notification.relatedUser) {
        if (typeof notification.relatedUser === 'object' && notification.relatedUser._id) {
          relatedUserId = notification.relatedUser._id;
        } else if (typeof notification.relatedUser === 'string' && notification.relatedUser !== 'undefined') {
          relatedUserId = notification.relatedUser;
        }
      }
      
      console.log('NEW_MESSAGE - relatedUser field:', notification.relatedUser, 'extracted ID:', relatedUserId);
      
      if (relatedUserId && relatedUserId !== 'undefined') {
        link = `/chat/${relatedUserId}`;
      } else {
        console.error('No valid relatedUser ID found for message notification');
      }
    } else if (notificationType === 'nearby_user') {
      const relatedUserId = notification.relatedUser?._id || notification.relatedUser;
      if (relatedUserId && relatedUserId !== 'undefined') {
        link = `/profile/${relatedUserId}`;
      }
    }
    
    console.log('Generated link:', link);
    return link;
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
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
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">Stay updated with your network activity</p>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">

          {notifications.map((notification) => (

            notification.type?.toLowerCase() === 'team_request' ? (

              <div
                key={notification._id}
                className={`bg-white rounded-xl shadow-md p-4 ${!notification.read ? 'border-l-4 border-indigo-500' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1">
                    <p className={`text-sm ${!notification.read ? 'font-semibold' : 'text-gray-900'}`}>
                      {notification.message}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.createdAt || notification.timestamp).toLocaleString()}
                    </p>
                  </div>

                  {!notification.read && (
                    <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleApproveRequest(notification.teamId, notification.relatedUser, notification._id)}
                    className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition flex items-center gap-1.5 text-sm font-medium shadow-sm"
                  >
                    <FiCheck className="w-4 h-4" />
                    Approve
                  </button>

                  <button
                    onClick={() => handleRejectRequest(notification.teamId, notification.relatedUser, notification._id)}
                    className="bg-rose-500 text-white px-3 py-1.5 rounded-lg hover:bg-rose-600 transition flex items-center gap-1.5 text-sm font-medium shadow-sm"
                  >
                    <FiX className="w-4 h-4" />
                    Reject
                  </button>

                  <Link
                    to={`/team/${notification.teamId}`}
                    className="text-indigo-600 hover:text-indigo-500 text-sm font-medium ml-auto"
                  >
                    View Team →
                  </Link>
                </div>
              </div>

            ) : (

              (() => {
                const link = getNotificationLink(notification);
                if (link === '#') {
                  return (
                    <div
                      key={notification._id}
                      className={`block bg-white rounded-xl shadow-md p-4 ${
                        !notification.read ? 'border-l-4 border-indigo-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1">
                          <p className={`text-sm ${!notification.read ? 'font-semibold' : 'text-gray-900'}`}>
                            {notification.message}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt || notification.timestamp).toLocaleString()}
                          </p>
                          <p className="text-xs text-red-500 mt-2">Unable to load notification</p>
                        </div>

                        {!notification.read && (
                          <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={notification._id}
                    to={link}
                    onClick={() => markAsRead(notification._id)}
                    className={`block bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition duration-200 ${
                      !notification.read ? 'border-l-4 border-indigo-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1">
                        <p className={`text-sm ${!notification.read ? 'font-semibold' : 'text-gray-900'}`}>
                          {notification.message}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt || notification.timestamp).toLocaleString()}
                        </p>
                      </div>

                      {!notification.read && (
                        <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  </Link>
                );
              })()

            )

          ))}

        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <FiBell className="w-8 h-8 text-slate-400" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2">
            No notifications
          </h3>

          <p className="text-gray-500">
            You're all caught up! New notifications will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;