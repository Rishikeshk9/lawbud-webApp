import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: 'lawbud-797dc.firebaseapp.com',
  projectId: 'lawbud-797dc',
  storageBucket: 'lawbud-797dc.appspot.com',
  messagingSenderId: '75412950563',
  appId: '1:75412950563:web:0b735b553cabf923aa6b96',
  measurementId: 'G-RKWHCXPJY8',
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object
const messaging = getMessaging(firebaseApp);

// Handle background messages
onBackgroundMessage(messaging, (payload) => {
  console.log('Received background message: ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png', // Replace with your custom icon path
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
