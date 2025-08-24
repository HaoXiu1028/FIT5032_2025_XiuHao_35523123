// src/composables/useAuth.js
import { ref, onUnmounted } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// This is a reactive variable that will hold the current user's state.
// It's defined outside the function, so it acts as a singleton (shared across the app).
const user = ref(null);

const auth = getAuth();

// 'onAuthStateChanged' is Firebase's magic listener.
// It automatically triggers whenever the user logs in or out.
// We only need to set it up ONCE for the entire application.
const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    // User is signed in.
    user.value = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      // You can add other properties you need here
    };
  } else {
    // User is signed out.
    user.value = null;
  }
});

// We export a function that components can call to get access to the shared user state.
export function useAuth() {
  // It's good practice to clean up the listener when the app is eventually torn down,
  // although in a single-page app this is less critical.
  onUnmounted(() => {
    unsubscribe();
  });

  return { user };
}