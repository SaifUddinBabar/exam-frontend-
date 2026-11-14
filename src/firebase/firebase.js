import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// Exact Firebase Web Configuration provided by user
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBzqEMhVOvICOROZNSCU24cv85gEd90n7Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "exam-platform-cf110.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "exam-platform-cf110",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "exam-platform-cf110.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "170089984907",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:170089984907:web:d3bf7d861b32d13659758e",
};

// Singleton Firebase App initialization
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth Instance
export const auth = getAuth(app);
auth.useDeviceLanguage();

// Google Auth Provider configured with prompt for account selection
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/**
 * Trigger Firebase Google Authentication popup
 * Returns { user, idToken }
 */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return {
    user: result.user,
    idToken,
  };
}

/**
 * Safely sign out the authenticated user from Firebase and clear all Examino session storage
 */
export async function signOutUser() {
  try {
    if (auth && auth.currentUser) {
      await signOut(auth);
    }
  } catch (err) {
    console.warn("Firebase signOut error:", err);
  }
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("examino_memberships");
  window.location.href = "/login";
}

/**
 * Format local Bangladeshi mobile numbers to standard E.164 (+8801XXXXXXXXX)
 */
export function formatBdPhoneE164(rawPhone) {
  if (!rawPhone) return "";
  let digits = String(rawPhone).replace(/[^0-9]/g, "");

  if (digits.startsWith("880")) {
    return `+${digits}`;
  }
  if (digits.startsWith("0")) {
    return `+88${digits}`;
  }
  if (digits.length === 10 && digits.startsWith("1")) {
    return `+880${digits}`;
  }
  return `+88${digits}`;
}

/**
 * Clear existing RecaptchaVerifier instance
 */
export function clearRecaptcha(containerId = "recaptcha-container") {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      console.warn("Error clearing RecaptchaVerifier:", e);
    }
    window.recaptchaVerifier = null;
  }
  const el = document.getElementById(containerId);
  if (el) {
    el.innerHTML = "";
  }
}

/**
 * Initialize reCAPTCHA Verifier
 * Defaults to 'invisible', with fallback handling for 'normal' if required.
 */
export function initRecaptcha(containerId = "recaptcha-container", options = {}) {
  clearRecaptcha(containerId);

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: options.size || "invisible",
    callback: () => {
      // reCAPTCHA solved
      if (options.onSuccess) options.onSuccess();
    },
    "expired-callback": () => {
      if (options.onExpired) options.onExpired();
    },
    ...options,
  });

  window.recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Send SMS OTP using Firebase Phone Authentication
 */
export async function sendFirebaseOtp(phone, containerId = "recaptcha-container") {
  const e164Phone = formatBdPhoneE164(phone);
  if (!e164Phone || e164Phone.length < 13) {
    throw new Error("Please enter a valid 11-digit Bangladeshi mobile number.");
  }

  // Ensure verifier is ready
  let verifier = window.recaptchaVerifier;
  if (!verifier) {
    verifier = initRecaptcha(containerId);
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, e164Phone, verifier);
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  } catch (error) {
    // Reset reCAPTCHA on failure so user can retry immediately
    clearRecaptcha(containerId);
    throw error;
  }
}

export {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
};
