import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBAlrF7bCPZ8VkMFHMQeXfD0FzW8Ovn2u0",
  authDomain: "signup-firebase-5768a.firebaseapp.com",
  projectId: "signup-firebase-5768a",
  storageBucket: "signup-firebase-5768a.firebasestorage.app",
  messagingSenderId: "1040714203005",
  appId: "1:1040714203005:web:b152bcfa0d7584e7895614"
};

// firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// firebase 인증 객체 생성
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;