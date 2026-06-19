import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA2-Tvv6sEfsMIbK0eNrkF4jIVsKpDjSS4",
  authDomain: "wired-tuner-pln7n.firebaseapp.com",
  projectId: "wired-tuner-pln7n",
  storageBucket: "wired-tuner-pln7n.firebasestorage.app",
  messagingSenderId: "1082642861849",
  appId: "1:1082642861849:web:5badb919dec877c6a33f88"
};

const app = initializeApp(firebaseConfig);

// Use the custom firestoreDatabaseId specified in your config
export const db = getFirestore(app, "ai-studio-679a77ab-9224-45dc-a713-ea867967c80d");

export const auth = getAuth(app);
auth.useDeviceLanguage(); // Set SMS language to the device language
