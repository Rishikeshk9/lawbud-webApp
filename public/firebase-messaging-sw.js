importScripts('https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js');
importScripts(
  'https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging.js'
);

// Initialize Firebase
firebase.initializeApp({
  apiKey: 'AIzaSyCD9RgP1uygEs-DkAMP9zIG8JIxNEucTko',
  authDomain: 'lawbud-797dc.firebaseapp.com',
  projectId: 'lawbud-797dc',
  storageBucket: 'lawbud-797dc.firebasestorage.app',
  messagingSenderId: '75412950563',
  appId: '1:75412950563:web:0b735b553cabf923aa6b96',
  measurementId: 'G-RKWHCXPJY8',
});

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png', // Replace with your icon path
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
