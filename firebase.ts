import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// 👇👇👇 这里所有的内容，请用你刚才复制的 firebaseConfig 替换！ 👇👇👇
// Import the functions you need from the SDKs you need
const firebaseConfig = {
  apiKey: "AIzaSyBK68wc3Jzxi1HzoeXXLvtM3LmKWqYchDc",
  authDomain: "englishstudy-d5574.firebaseapp.com",
  projectId: "englishstudy-d5574",
  storageBucket: "englishstudy-d5574.firebasestorage.app",
  messagingSenderId: "808106421780",
  appId: "1:808106421780:web:6cc2e6f14e0e8740550101",
  measurementId: "G-LH414XCFHD"
};

// 👆👆👆 替换结束 👆👆👆

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
