import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FiMapPin, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

// Custom icon for current user
const currentUserIcon = L.divIcon({
  html: `<div class="flex items-center justify-center w-8 h-8 bg-indigo-600 border-2 border-white rounded-full shadow-lg">
    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clip-rule="evenodd" />
    </svg>
  </div>`,
  className: 'current-user-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Custom icon for nearby users
const nearbyUserIcon = L.divIcon({
  html: `<div class="flex items-center justify-center w-8 h-8 bg-purple-600 border-2 border-white rounded-full shadow-lg">
    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clip-rule="evenodd" />
    </svg>
  </div>`,
  className: 'nearby-user-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const MapView = ({ currentUser, nearbyUsers, onUserClick, loading }) => {
  const [mapCenter, setMapCenter] = useState([12.9716, 79.1573]); // Default: Chennai
  const [hasLocation, setHasLocation] = useState(false);

  useEffect(() => {
    if (currentUser?.location?.latitude && currentUser?.location?.longitude) {
      setMapCenter([currentUser.location.latitude, currentUser.location.longitude]);
      setHasLocation(true);
    }
  }, [currentUser]);

  if (loading || !hasLocation) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
        <FiMapPin className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-gray-600 font-medium">Loading map...</p>
        <p className="text-sm text-gray-500">Waiting for your location</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <MapContainer
        center={mapCenter}
        zoom={17}
        style={{ height: '400px', width: '100%' }}
        className="z-10"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Current User Marker */}
        {currentUser?.location && (
          <Marker
            position={[currentUser.location.latitude, currentUser.location.longitude]}
            icon={currentUserIcon}
          >
            <Popup className="custom-popup">
              <div className="p-3 min-w-max">
                <h3 className="font-semibold text-gray-900">{currentUser.name}</h3>
                <p className="text-sm text-gray-600">You</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Nearby Users Markers */}
        {nearbyUsers.map((user) => (
          <Marker
            key={user._id}
            position={[user.location.latitude, user.location.longitude]}
            icon={nearbyUserIcon}
          >
            <Popup className="custom-popup">
              <div className="p-3 min-w-xs">
                <h3 className="font-semibold text-gray-900 mb-1">{user.name}</h3>
                {user.skills && user.skills.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-600 mb-1">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {user.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mb-3">
                  {user.distance ? `${user.distance}m away` : 'Nearby'}
                </p>
                <button
                  onClick={() => onUserClick?.(user)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  <FiArrowRight className="w-4 h-4" />
                  View Profile
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="bg-white p-4 border-t border-gray-200">
        <div className="flex gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 border-2 border-white rounded-full shadow"></div>
            <span className="text-sm font-medium text-gray-700">You</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-600 border-2 border-white rounded-full shadow"></div>
            <span className="text-sm font-medium text-gray-700">Nearby Users ({nearbyUsers.length})</span>
          </div>
          {nearbyUsers.length === 0 && (
            <p className="text-sm text-gray-500 italic">No users nearby at the moment</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
