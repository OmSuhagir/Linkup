import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import UserCard from '../components/UserCard';
import MapView from '../components/MapView';
import useLocation from '../hooks/useLocation';
import useSocket from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMap, FiUsers } from 'react-icons/fi';

const NearbyUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState(true);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { location } = useLocation(true, 30000); // Update location every 30 seconds
  const { socket } = useSocket();
  const notifiedUsersRef = useRef(new Set()); // Track notified users to prevent duplicates
  const fetchIntervalRef = useRef(null);

  // Fetch nearby users
  const fetchNearbyUsers = async () => {
    try {
      const response = await api.get('/users/nearby');
      setUsers(response.data?.users ?? response.data ?? []);
    } catch (error) {
      console.error('Error fetching nearby users:', error);
      const message = error.response?.data?.message || 'Failed to load nearby users';
      // Only show error if first load fails
      if (loading) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNearbyUsers();
  }, []);

  // Auto-refresh nearby users every 5 seconds
  useEffect(() => {
    fetchIntervalRef.current = setInterval(() => {
      fetchNearbyUsers();
    }, 5000);

    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
    };
  }, []);

  // Socket.io proximity alerts
  useEffect(() => {
    if (!socket) return;

    const handleProximityAlert = (userData) => {
      if (!currentUser) return;

      // Check if we've already notified this user
      if (!notifiedUsersRef.current.has(userData.userId)) {
        // Mark as notified
        notifiedUsersRef.current.add(userData.userId);

        // Show toast
        toast.success(`${userData.name || 'A user'} is nearby!`, {
          icon: '📍',
          duration: 4000
        });

        // Auto-remove from notified set after 2 minutes (so they get notified again if they leave and come back)
        setTimeout(() => {
          notifiedUsersRef.current.delete(userData.userId);
        }, 120000);
      }
    };

    socket.on('proximityAlert', handleProximityAlert);

    return () => {
      socket.off('proximityAlert', handleProximityAlert);
    };
  }, [socket, currentUser]);

  const handleUserCardClick = (user) => {
    navigate(`/profile/${user._id}`);
  };

  if (loading && users.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-5">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nearby Users</h1>
        <p className="text-gray-600">Discover professionals in your area</p>
      </div>

      {/* View Toggle Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setMapView(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            mapView
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <FiMap className="w-5 h-5" />
          Map View
        </button>
        <button
          onClick={() => setMapView(false)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            !mapView
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <FiUsers className="w-5 h-5" />
          List View
        </button>
      </div>

      {/* Map View */}
      {mapView && (
        <div className="mb-8">
          <MapView
            currentUser={currentUser}
            nearbyUsers={users}
            onUserClick={handleUserCardClick}
            loading={loading}
          />
        </div>
      )}

      {/* User Cards / List View */}
      {users.length > 0 ? (
        <div className={mapView ? 'mt-6' : ''}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <UserCard key={user._id} user={user} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUsers className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No nearby users found</h3>
          <p className="text-gray-500 mb-6">
            Try updating your location or check back later. Users within 100m will appear here.
          </p>
          <button
            onClick={fetchNearbyUsers}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Status Info */}
      {users.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            Showing <strong>{users.length}</strong> user(s) nearby. Your location updates automatically every 30 seconds, and nearby users refresh every 5 seconds.
          </p>
        </div>
      )}
    </div>
  );
};

export default NearbyUsers;