
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import {
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import { auth } from "./firebase";

GoogleSignin.configure({
  webClientId:
    "1066273066975-unclldbjrcghbn7j3j6cuaopbj6oo7lf.apps.googleusercontent.com",
});

export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();

    const response = await GoogleSignin.signIn();

    if (response.type !== "success") {
      return null;
    }

    const idToken = response.data.idToken;

    if (!idToken) {
      throw new Error("Google did not return an ID token.");
    }

    const credential = GoogleAuthProvider.credential(idToken);

    const userCredential = await signInWithCredential(
      auth,
      credential
    );

    return userCredential.user;
  } catch (error) {
    if (
      isErrorWithCode(error) &&
      error.code === statusCodes.SIGN_IN_CANCELLED
    ) {
      return null;
    }

    console.error("Google sign-in error:", error);
    throw error;
  }
}
