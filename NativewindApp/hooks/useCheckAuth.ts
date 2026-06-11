import { useState, useEffect } from 'react';
import { getJWTToken } from '../utils/tokenStorage';
import { DeviceEventEmitter } from 'react-native';

export function useCheckAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifyTokenPresence() {
      try {
        const token = await getJWTToken();
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error("Local token inspection error:", error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    }

    verifyTokenPresence();

    // Listen for background logout calls from the API layer
    const logoutSubscription = DeviceEventEmitter.addListener('auth:force_logout', () => {
      setIsLoggedIn(false);
    });

    return () => {
      logoutSubscription.remove();
    };
  }, []);

  return { 
    isLoggedIn, 
    isLoading 
  };
}