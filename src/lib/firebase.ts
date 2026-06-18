import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvnwXrfGMhx002ZL3uBTwbpvQyx5J7vkU",
  authDomain: "vatsal-portfolio-5699f.firebaseapp.com",
  projectId: "vatsal-portfolio-5699f",
  messagingSenderId: "794035958468",
  appId: "1:794035958468:web:95a40e905c18ebec6f8f91",
  measurementId: "G-P2M1V2TBTV"
};

export const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true });
