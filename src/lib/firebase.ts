import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAvnwXrfGMhx002ZL3uBTwbpvQyx5J7vkU",
  authDomain: "vatsal-portfolio-5699f.firebaseapp.com",
  projectId: "vatsal-portfolio-5699f",
  storageBucket: "vatsal-portfolio-5699f.firebasestorage.app",
  messagingSenderId: "794035958468",
  appId: "1:794035958468:web:95a40e905c18ebec6f8f91",
  measurementId: "G-P2M1V2TBTV"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true });
export const storage = getStorage(app);
