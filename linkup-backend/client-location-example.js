// Example: React Native location tracking
import Geolocation from '@react-native-community/geolocation';

// Location tracking service
class LocationService {
  constructor() {
    this.watchId = null;
    this.lastLocation = null;
    this.updateInterval = 30000; // 30 seconds
    this.minDistance = 50; // 50 meters minimum movement
  }

  startTracking(userToken) {
    // Request location permissions
    Geolocation.requestAuthorization();

    // Start watching position
    this.watchId = Geolocation.watchPosition(
      (position) => {
        this.handleLocationUpdate(position, userToken);
      },
      (error) => {
        console.error('Location error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: this.updateInterval,
        fastestInterval: 10000, // 10 seconds
      }
    );
  }

  async handleLocationUpdate(position, userToken) {
    const { latitude, longitude, accuracy } = position.coords;

    // Check if user has moved minimum distance
    if (this.lastLocation) {
      const distance = this.calculateDistance(
        this.lastLocation.latitude,
        this.lastLocation.longitude,
        latitude,
        longitude
      );

      if (distance < this.minDistance) {
        return; // Don't update if movement is too small
      }
    }

    try {
      // Send location update to backend
      const response = await fetch('http://localhost:5000/api/location/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          latitude,
          longitude,
          accuracy,
        }),
      });

      if (response.ok) {
        this.lastLocation = { latitude, longitude };
        console.log('Location updated successfully');
      }
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula implementation
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  stopTracking() {
    if (this.watchId) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}

// Usage in React Native component
const locationService = new LocationService();

// Start tracking when user logs in
useEffect(() => {
  if (userToken) {
    locationService.startTracking(userToken);
  }

  return () => {
    locationService.stopTracking();
  };
}, [userToken]);