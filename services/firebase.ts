import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// @ts-ignore Firebase's React Native export is missing from the public TypeScript declaration
import { initializeAuth } from "firebase/auth";

import  ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
const firebaseConfig = {
  apiKey: "AIzaSyCickhHlzA6oSnAxpAITAGb4J3uRKPtzdU",
  authDomain: "solve-it-d4338.firebaseapp.com",
  projectId: "solve-it-d4338",
  storageBucket: "solve-it-d4338.firebasestorage.app",
  messagingSenderId: "1066273066975",
  appId: "1:1066273066975:web:1096f1f1e4df202e38be6a",
  
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

const { getReactNativePersistence } = require("firebase/auth");

const appStorage = ReactNativeAsyncStorage;

import { getAuth } from "firebase/auth";

let authInstance;

try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(appStorage),
  });
} catch (error: any) {
  if (error.code === "auth/already-initialized") {
    authInstance = getAuth(app);
  } else {
    throw error;
  }
}

export const auth = authInstance;