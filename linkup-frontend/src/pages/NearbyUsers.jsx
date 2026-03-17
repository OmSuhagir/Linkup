import { useState, useEffect } from 'react';
import api from '../services/api';
import UserCard from '../components/UserCard';
import toast from 'react-hot-toast';

const NearbyUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  useEffect(() => {
    fetchNearbyUsers();
  }, []);

  const fetchNearbyUsers = async () => {
    try {
      const response = await api.get('/users/nearby');
      // Backend returns { users, searchCriteria } so handle both shapes
      setUsers(response.data?.users ?? response.data ?? []);
    } catch (error) {
      console.error('Error fetching nearby users:', error);
      const message = error.response?.data?.message || 'Failed to load nearby users';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async () => {
    setUpdatingLocation(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      await api.post('/location/update', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      toast.success('Location updated successfully!');
      fetchNearbyUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Failed to update location. Please enable location services.');
    } finally {
      setUpdatingLocation(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nearby Users</h1>
          <p className="text-gray-600 mt-2">Discover professionals in your area</p>
        </div>
        <button
          onClick={updateLocation}
          disabled={updatingLocation}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {updatingLocation ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Updating...
            </>
          ) : (
            'Update Location'
          )}
        </button>
      </div>

      {users.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No nearby users found</h3>
          <p className="text-gray-500 mb-6">
            Try updating your location or check back later. Users within 10km will appear here.
          </p>
          <button
            onClick={updateLocation}
            disabled={updatingLocation}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updatingLocation ? 'Updating Location...' : 'Update My Location'}
          </button>
        </div>
      )}
    </div>
  );
};

export default NearbyUsers;