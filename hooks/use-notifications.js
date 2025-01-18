import { useEffect, useState } from 'react';
import {
  requestPermission,
  onMessageListener,
  initializeMessaging,
} from '../lib/firebase';

const useNotifications = () => {
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      await initializeMessaging(); // Ensure messaging is initialized
      const token = await requestPermission();
      if (token) {
        setToken(token);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (onMessageListener) {
      const listener = onMessageListener()
        ?.then((payload) => {
          if (payload) {
            setNotification({
              title: payload.notification?.title || 'No title',
              body: payload.notification?.body || 'No body',
            });
          }
        })
        .catch((error) => console.error('Error in onMessageListener:', error));

      return () => {
        listener && listener(); // Clean up listener if it exists
      };
    }
  }, []);

  return { token, notification };
};

export default useNotifications;
