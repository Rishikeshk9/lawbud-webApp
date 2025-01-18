import { useEffect, useState } from 'react';
import { requestPermission, onMessageListener } from '../lib/firebase'; // Adjust path as necessary

const useNotifications = () => {
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Request notification permission and get token
    const getToken = async () => {
      try {
        const fetchedToken = await requestPermission();
        if (fetchedToken) {
          setToken(fetchedToken);
        }
      } catch (error) {
        console.error('Failed to get notification token:', error);
      }
    };

    getToken();
  }, []);

  useEffect(() => {
    // Listen for incoming messages
    const unsubscribe = onMessageListener().then((payload) => {
      setNotification({
        title: payload.notification.title,
        body: payload.notification.body,
      });
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  return { token, notification };
};

export default useNotifications;
