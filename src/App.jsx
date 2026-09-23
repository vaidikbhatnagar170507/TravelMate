import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { useEffect } from "react";

import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Planner from "./pages/Planner";
import MyTrips from "./pages/MyTrips";
import TripDetails from "./pages/TripDetails";
import Assistant from "./pages/Assistant";
import Reminders from "./pages/Reminders";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import ProtectedRoute from "./Components/ProtectedRoute";
import Navbar from "./Components/Navbar";

import "./App.css";

/* =========================================================
   SCROLL TO TOP
   ---------------------------------------------------------
   Whenever the user navigates to another route, the new
   page automatically starts from the top/header.
========================================================= */

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}


/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>

      {/* Automatically reset scroll position on navigation */}
      <ScrollToTop />

      {/* Global Android-style navigation */}
      <Navbar />

      <Routes>

        {/* =================================================
            PUBLIC PAGES
        ================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/discover"
          element={<Discover />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* =================================================
            ABOUT & PRIVACY
        ================================================== */}

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/privacy-policy"
          element={<PrivacyPolicy />}
        />


        {/* =================================================
            PROTECTED PAGES
        ================================================== */}

        <Route
          path="/planner"
          element={
            <ProtectedRoute>
              <Planner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-trips"
          element={
            <ProtectedRoute>
              <MyTrips />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trip-details"
          element={
            <ProtectedRoute>
              <TripDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <Assistant />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            PERSONAL REMINDERS
        ================================================== */}

        <Route
          path="/reminders"
          element={
            <ProtectedRoute>
              <Reminders />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            FALLBACK
        ================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;