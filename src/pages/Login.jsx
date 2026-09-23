import "../auth.css";
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();

  const {
    currentUser,
    login,
    loading: authLoading,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  /* =================================================
     ALREADY LOGGED IN
     ================================================= */

  useEffect(() => {
    if (!authLoading && currentUser) {
      navigate("/", {
        replace: true,
      });
    }
  }, [
    currentUser,
    authLoading,
    navigate,
  ]);


  /* =================================================
     LOGIN
     ================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    const cleanEmail =
      email.trim();

    if (!cleanEmail || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      await login(
        cleanEmail,
        password
      );

      /*
        Login successful
        → Always go to Home
      */

      navigate("/", {
        replace: true,
      });

    } catch (firebaseError) {
      console.error(
        "Login error:",
        firebaseError
      );

      switch (
        firebaseError.code
      ) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setError(
            "Incorrect email or password."
          );
          break;

        case "auth/invalid-email":
          setError(
            "Please enter a valid email address."
          );
          break;

        case "auth/too-many-requests":
          setError(
            "Too many attempts. Please try again later."
          );
          break;

        case "auth/user-disabled":
          setError(
            "This account has been disabled."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "Network error. Please check your internet connection."
          );
          break;

        default:
          setError(
            "Unable to log in right now. Please try again."
          );
      }

    } finally {
      setLoading(false);
    }
  };


  /* =================================================
     AUTH LOADING
     ================================================= */

  if (
    authLoading ||
    currentUser
  ) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />

        <p>
          Loading TravelMate...
        </p>
      </div>
    );
  }


  /* =================================================
     LOGIN PAGE
     ================================================= */

  return (
    <div className="auth-page">

      <div className="auth-card">

        <Link
          to="/"
          className="auth-brand"
        >
          <span className="auth-brand-mark">
            ✈
          </span>

          <span>
            Travel<span>Mate</span>
          </span>
        </Link>


        <div className="auth-header">

          <p className="auth-kicker">
            WELCOME BACK
          </p>

          <h1>
            Log in to
            <br />
            <em>TravelMate.</em>
          </h1>

          <p>
            Continue planning your next
            journey.
          </p>

        </div>


        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <label>
            Email

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              autoComplete="email"
              disabled={loading}
            />
          </label>


          <label>
            Password

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              autoComplete="current-password"
              disabled={loading}
            />
          </label>


          {error && (
            <div
              className="auth-error"
              role="alert"
            >
              {error}
            </div>
          )}


          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Log in"}
          </button>

        </form>


        <p className="auth-switch">
          Don't have an account?{" "}

          <Link to="/signup">
            Create one
          </Link>
        </p>


        <Link
          to="/"
          className="auth-back"
        >
          ← Back to TravelMate
        </Link>

      </div>

    </div>
  );
}

export default Login;