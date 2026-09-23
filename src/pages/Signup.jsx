import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Signup() {
  const navigate = useNavigate();

  const { signup } = useAuth();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError(
        "Please fill in all fields."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      await signup(
        name,
        email.trim(),
        password
      );

      navigate("/planner", {
        replace: true,
      });
    } catch (firebaseError) {
      console.error(firebaseError);

      switch (
        firebaseError.code
      ) {
        case "auth/email-already-in-use":
          setError(
            "An account with this email already exists."
          );
          break;

        case "auth/invalid-email":
          setError(
            "Please enter a valid email address."
          );
          break;

        case "auth/weak-password":
          setError(
            "Please choose a stronger password."
          );
          break;

        default:
          setError(
            "Unable to create your account right now. Please try again."
          );
      }
    } finally {
      setLoading(false);
    }
  };

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
            GET STARTED
          </p>

          <h1>
            Create your
            <br />
            <em>TravelMate.</em>
          </h1>

          <p>
            Your trips will be saved to
            your account and available
            across devices.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label>
            Name
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              autoComplete="name"
              disabled={loading}
            />
          </label>

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
              placeholder="At least 6 characters"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              autoComplete="new-password"
              disabled={loading}
            />
          </label>

          <label>
            Confirm password
            <input
              type="password"
              placeholder="Enter password again"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              autoComplete="new-password"
              disabled={loading}
            />
          </label>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">
            Log in
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

export default Signup;