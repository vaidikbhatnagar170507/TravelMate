import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase";

import { apiRequest } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [authReady, setAuthReady] =
    useState(false);

  useEffect(() => {
    let unsubscribe = () => {};
    let mounted = true;

    const initializeAuth = async () => {
      try {
        await setPersistence(
          auth,
          browserLocalPersistence
        );

        if (!mounted) {
          return;
        }

        unsubscribe =
          onAuthStateChanged(
            auth,
            (user) => {
              if (!mounted) {
                return;
              }

              setCurrentUser(user);
              setLoading(false);
              setAuthReady(true);
            }
          );
      } catch (error) {
        console.error(
          "Firebase authentication initialization failed:",
          error
        );

        if (mounted) {
          setCurrentUser(
            auth.currentUser || null
          );

          setLoading(false);
          setAuthReady(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signup = async (
    email,
    password
  ) => {
    return createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
  };

  const login = async (
    email,
    password
  ) => {
    await setPersistence(
      auth,
      browserLocalPersistence
    );

    return signInWithEmailAndPassword(
      auth,
      email,
      password
    );
  };

  const logout = async () => {
    return signOut(auth);
  };

  const deleteAccount = async () => {
    if (!auth.currentUser) {
      throw new Error(
        "No authenticated user found."
      );
    }

    /*
     * The backend gets the authenticated user's
     * UID from the Firebase ID token.
     *
     * It deletes:
     *
     * users/{uid}
     * users/{uid}/trips/*
     * users/{uid}/reminders/*
     *
     * and the Firebase Authentication account.
     */
    await apiRequest(
      "/api/account",
      {
        method: "DELETE",
      }
    );

    /*
     * The Admin SDK has already deleted the
     * Firebase Authentication account.
     *
     * Signing out locally clears the current
     * client authentication state as well.
     */
    try {
      await signOut(auth);
    } catch (error) {
      console.error(
        "Local sign out after account deletion failed:",
        error
      );
    }
  };

  const value = {
    currentUser,
    loading,
    authReady,
    signup,
    login,
    logout,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}