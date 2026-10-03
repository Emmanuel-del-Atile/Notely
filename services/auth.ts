import { 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithEmailAndPassword ,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "./firebase";


// Register function
export async function registerUser(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    console.log("User created!");
    console.log("UID:", user.uid);
    console.log("Email:", user.email);

    return user;
  } catch (error) {
    console.error("Registration error:", error);
    return null;
  }
}

export async function loginUser(
  email: string,
  password: string
) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    console.log("User signed in!");
    console.log("UID:", user.uid);
    console.log("Email:", user.email);

    return user;

  } catch (error) {
    console.error("Login error:", error);

    throw error;
  }
}

// logout function
export async function logOutUser() {
  try {
    await signOut(auth);
    console.log("User signed out!");

  } catch (error) {
    console.error("Sign out error:", error);
  }
}

//Password Reset function
export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);

    console.log("Password reset email sent!");

    return true;
  } catch (error) {
    console.error("Password reset error:", error);

    return false;
  }
}