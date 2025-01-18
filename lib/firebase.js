import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyCD9RgP1uygEs-DkAMP9zIG8JIxNEucTko',
  authDomain: 'lawbud-797dc.firebaseapp.com',
  projectId: 'lawbud-797dc',
  storageBucket: 'lawbud-797dc.firebasestorage.app',
  messagingSenderId: '75412950563',
  appId: '1:75412950563:web:0b735b553cabf923aa6b96',
  measurementId: 'G-RKWHCXPJY8',
};

const firebaseApp = initializeApp(firebaseConfig);
export const messaging = getMessaging(firebaseApp);

// Request permission and get the token
export const requestPermission = async () => {
  try {
    console.log('Requesting notification permission...');
    const status = await Notification.requestPermission();

    if (status === 'granted') {
      console.log('Notification permission granted.');

      console.log('Registering service worker...');
      const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js'
      );
      console.log('Service worker registered successfully:', registration);

      console.log('Fetching FCM token...');
      const token = await getToken(messaging, {
        vapidKey:
          'BA73R_ipHkm9yruXnpMVfrvmmnJxZ3w69JBot1QqQ_vJRc8QLoJ7ybR4zlWoFYV79Dt3fWd8p6Omik1QEVB5COU',
        serviceWorkerRegistration: registration,
      });
      console.log('FCM Token:', token);

      return token;
    } else {
      console.error('Permission not granted for notifications.');
    }
  } catch (error) {
    console.error('Error during notification setup:', error);
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
