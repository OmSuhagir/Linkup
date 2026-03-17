import { useEffect, useState, useRef, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const useLocation = (enabled = true, updateInterval = 30000) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);
  const updateIntervalRef = useRef(null);

  // Get location once
  const getLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setError(null);
          resolve({ latitude, longitude });
        },
        (error) => {
          let errorMessage = 'Failed to get location.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred.';
          }
          setError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  // Update location on backend
  const updateLocationOnBackend = useCallback(async (lat, lon) => {
    try {
      await api.post('/location/update', {
        latitude: lat,
        longitude: lon
      });
    } catch (err) {
      console.error('Error updating location on backend:', err);
    }
  }, []);

  // Initialize location and setup auto-update
  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const initializeLocation = async () => {
      try {
        const { latitude, longitude } = await getLocation();
        if (isMounted) {
          setLoading(false);
          await updateLocationOnBackend(latitude, longitude);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
          toast.error(err.message);
        }
      }
    };

    initializeLocation();

    // Setup periodic location update
    if (updateInterval > 0) {
      updateIntervalRef.current = setInterval(() => {
        if (isMounted) {
          getLocation()
            .then(({ latitude, longitude }) => {
              if (isMounted) {
                updateLocationOnBackend(latitude, longitude);
              }
            })
            .catch((err) => {
              console.error('Auto-location update error:', err);
            });
        }
      }, updateInterval);
    }

    return () => {
      isMounted = false;
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [enabled, updateInterval, getLocation, updateLocationOnBackend]);

  return { location, loading, error };
};

export default useLocation;
