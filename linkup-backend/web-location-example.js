// Example: Web browser location tracking
class WebLocationService {
  constructor() {
    this.watchId = null;
    this.lastLocation = null;
    this.updateInterval = 30000; // 30 seconds
    this.minDistance = 50; // 50 meters
  }

  startTracking(userToken) {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported');
      return;
    }

    // Start watching position
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.handleLocationUpdate(position, userToken);
      },
      (error) => {
        console.error('Location error:', error);
        this.handleLocationError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000, // Accept cached position up to 30 seconds old
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
        return; // Skip update if movement is too small
      }
    }

    try {
      const response = await fetch('/api/location/update', {
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

      const data = await response.json();

      if (response.ok) {
        this.lastLocation = { latitude, longitude };
        console.log('Location updated:', data.location);

        // Optional: Update UI with new location
        this.updateLocationUI(data.location);
      } else {
        console.error('Location update failed:', data.message);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  }

  handleLocationError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        console.error('User denied location access');
        break;
      case error.POSITION_UNAVAILABLE:
        console.error('Location unavailable');
        break;
      case error.TIMEOUT:
        console.error('Location request timeout');
        break;
      default:
        console.error('Unknown location error');
        break;
    }
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
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

  updateLocationUI(location) {
    // Update UI elements with new location
    const locationElement = document.getElementById('current-location');
    if (locationElement) {
      locationElement.textContent = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    }
  }

  stopTracking() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Manual location update (for testing)
  async updateLocationNow(userToken) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await this.handleLocationUpdate(position, userToken);
          resolve(position);
        },
        (error) => {
          this.handleLocationError(error);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }
}

// Usage in web application
const locationService = new WebLocationService();

// Start tracking when user logs in
function startLocationTracking(userToken) {
  locationService.startTracking(userToken);
}

// Stop tracking when user logs out
function stopLocationTracking() {
  locationService.stopTracking();
}

// Manual update button
document.getElementById('update-location-btn')?.addEventListener('click', async () => {
  const userToken = localStorage.getItem('token');
  if (userToken) {
    try {
      await locationService.updateLocationNow(userToken);
      console.log('Manual location update completed');
    } catch (error) {
      console.error('Manual location update failed');
    }
  }
});