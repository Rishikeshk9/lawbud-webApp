import { initializeApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyCD9RgP1uygEs-DkAMP9zIG8JIxNEucTko',
  authDomain: 'lawbud-797dc.firebaseapp.com',
  projectId: 'lawbud-797dc',
  storageBucket: 'lawbud-797dc.appspot.com',
  messagingSenderId: '75412950563',
  appId: '1:75412950563:web:0b735b553cabf923aa6b96',
  measurementId: 'G-RKWHCXPJY8',
};

const firebaseApp = initializeApp(firebaseConfig);

let messaging = null;

export const initializeMessaging = async () => {
  if (await isSupported()) {
    messaging = getMessaging(firebaseApp);
    console.log('Firebase Messaging initialized');
  } else {
    console.warn('This browser does not support Firebase Messaging.');
  }
};

export const requestPermission = async () => {
  if (!messaging) {
    console.warn('Firebase Messaging is not initialized.');
    return null;
  }

  try {
    const status = await Notification.requestPermission();
    if (status === 'granted') {
      const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js'
      );
      const token = await getToken(messaging, {
        vapidKey:
          'BA73R_ipHkm9yruXnpMVfrvmmnJxZ3w69JBot1QqQ_vJRc8QLoJ7ybR4zlWoFYV79Dt3fWd8p6Omik1QEVB5COU',
        serviceWorkerRegistration: registration,
      });
      console.log('FCM Token:', token);
      return token;
    } else {
      console.warn('Notification permissions were not granted.');
    }
  } catch (error) {
    console.error('Error requesting permission:', error);
  }
  return null;
};

export const onMessageListener = () => {
  if (!messaging) {
    console.warn('Firebase Messaging is not initialized.');
    return null;
  }
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};
