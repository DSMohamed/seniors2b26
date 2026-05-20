import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyBq9UCaWBqXce6CoauUMw-BRiFm8lWjv_Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "seniors2b26.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "seniors2b26",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "seniors2b26.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "407765766637",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:407765766637:web:0b04f5049b9f42d21017e4",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-WH6MF35VK0",
};

export const firebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);

export async function initAnalytics() {
  if (typeof window === "undefined") return null;
  if (!(await isSupported())) return null;
  return getAnalytics(firebaseApp);
}

