import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    currentUser,
    logout,
    deleteAccount,
  } = useAuth();

  const [isProfileMenuOpen, setIsProfileMenuOpen] =
    useState(false);

  const [isDeletingAccount, setIsDeletingAccount] =
    useState(false);

  const handleLogout = async () => {
    try {
      setIsProfileMenuOpen(false);

      await logout();

      navigate("/", { replace: true });
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );

      window.alert(
        "Unable to sign out right now. Please try again."
      );
    }
  };

  const handlePrivacyPolicy = () => {
    setIsProfileMenuOpen(false);

    window.open(
      "https://sites.google.com/view/travelmateofficial/privacy-policy",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleAbout = () => {
    setIsProfileMenuOpen(false);

    window.open(
      "https://sites.google.com/view/travelmateofficial/about-travelmate",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleDeleteAccount = async () => {
    if (isDeletingAccount) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your TravelMate account?\n\nYour saved trips, itineraries, reminders and associated account data will be permanently deleted.\n\nThis action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeletingAccount(true);
      setIsProfileMenuOpen(false);

      await deleteAccount();

      window.alert(
        "Your TravelMate account and associated data have been permanently deleted."
      );

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Account deletion failed:",
        error
      );

      window.alert(
        error?.message ||
          "Unable to delete your account right now. Please try again."
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  const openProfileMenu = () => {
    if (isDeletingAccount) {
      return;
    }

    setIsProfileMenuOpen(true);
  };

  const closeProfileMenu = () => {
    if (isDeletingAccount) {
      return;
    }

    setIsProfileMenuOpen(false);
  };

  return (
    <>
      {/* =====================================================
          DESKTOP NAVBAR
      ====================================================== */}

      <nav className="navbar">
        <Link to="/" className="brand">
          <span className="brand-mark">
            ✈
          </span>

          <span>
            Travel<span>Mate</span>
          </span>
        </Link>

        <div className="nav-links">
          <Link
            to="/"
            className={
              isActive("/")
                ? "active-nav"
                : ""
            }
          >
            Home
          </Link>

          <Link
            to="/discover"
            className={
              isActive("/discover")
                ? "active-nav"
                : ""
            }
          >
            Discover
          </Link>

          <Link
            to="/planner"
            className={
              isActive("/planner")
                ? "active-nav"
                : ""
            }
          >
            Plan a Trip
          </Link>

          <Link
            to="/my-trips"
            className={
              isActive("/my-trips")
                ? "active-nav"
                : ""
            }
          >
            My Trips
          </Link>

          <Link
            to="/reminders"
            className={
              isActive("/reminders")
                ? "active-nav"
                : ""
            }
          >
            Reminders
          </Link>

          <Link
            to="/assistant"
            className={
              isActive("/assistant")
                ? "active-nav"
                : ""
            }
          >
            AI Assistant
          </Link>
        </div>

        <div className="nav-actions">
          {currentUser ? (
            <button
              type="button"
              className="nav-user profile-trigger"
              onClick={openProfileMenu}
              aria-label="Open profile menu"
              aria-expanded={isProfileMenuOpen}
              disabled={isDeletingAccount}
            >
              <div className="nav-user-avatar">
                {(
                  currentUser.email?.charAt(0) ||
                  "U"
                ).toUpperCase()}
              </div>

              <span className="nav-user-name">
                {currentUser.email}
              </span>
            </button>
          ) : (
            <Link
              to="/login"
              className="login-button"
            >
              Log in
            </Link>
          )}

          <Link
            to="/planner"
            className="nav-cta"
          >
            Plan a Trip
            <span>→</span>
          </Link>
        </div>
      </nav>


      {/* =====================================================
          MOBILE TOP BAR
      ====================================================== */}

      <header className="mobile-navbar">
        <Link
          to="/"
          className="mobile-brand"
        >
          <span className="mobile-brand-mark">
            ✈
          </span>

          <span>
            Travel<span>Mate</span>
          </span>
        </Link>

        {currentUser ? (
          <button
            type="button"
            className="mobile-user-button"
            onClick={openProfileMenu}
            aria-label="Open profile menu"
            aria-expanded={isProfileMenuOpen}
            disabled={isDeletingAccount}
          >
            {(
              currentUser.email?.charAt(0) ||
              "U"
            ).toUpperCase()}
          </button>
        ) : (
          <Link
            to="/login"
            className="mobile-login-button"
          >
            Log in
          </Link>
        )}
      </header>


      {/* =====================================================
          PROFILE SIDE DRAWER
      ====================================================== */}

      {isProfileMenuOpen && (
        <div
          className="profile-drawer-overlay"
          onClick={closeProfileMenu}
        >
          <aside
            className="profile-drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
            aria-label="Profile menu"
          >
            {/* HEADER */}

            <div className="profile-drawer-header">
              <div>
                <p className="profile-drawer-title">
                  Account
                </p>

                <p className="profile-drawer-email">
                  {currentUser?.email}
                </p>
              </div>

              <button
                type="button"
                className="profile-drawer-close"
                onClick={closeProfileMenu}
                aria-label="Close profile menu"
              >
                ×
              </button>
            </div>


            {/* PROFILE */}

            <div className="profile-drawer-profile">
              <div className="profile-drawer-avatar">
                {(
                  currentUser?.email?.charAt(0) ||
                  "U"
                ).toUpperCase()}
              </div>

              <div>
                <p className="profile-drawer-user-label">
                  Signed in as
                </p>

                <p className="profile-drawer-user-email">
                  {currentUser?.email}
                </p>
              </div>
            </div>


            {/* MENU OPTIONS */}

            <div className="profile-drawer-menu">

              {/* ABOUT TRAVELMATE */}

              <button
                type="button"
                className="profile-drawer-item"
                onClick={handleAbout}
                disabled={isDeletingAccount}
              >
                <span className="profile-drawer-icon">
                  ℹ️
                </span>

                <span className="profile-drawer-item-content">
                  <span className="profile-drawer-item-title">
                    About TravelMate
                  </span>

                  <span className="profile-drawer-item-description">
                    About the app and its features
                  </span>
                </span>

                <span className="profile-drawer-arrow">
                  →
                </span>
              </button>


              {/* PRIVACY POLICY */}

              <button
                type="button"
                className="profile-drawer-item"
                onClick={handlePrivacyPolicy}
                disabled={isDeletingAccount}
              >
                <span className="profile-drawer-icon">
                  🔒
                </span>

                <span className="profile-drawer-item-content">
                  <span className="profile-drawer-item-title">
                    Privacy Policy
                  </span>

                  <span className="profile-drawer-item-description">
                    How TravelMate handles your data
                  </span>
                </span>

                <span className="profile-drawer-arrow">
                  →
                </span>
              </button>


              {/* SIGN OUT */}

              <button
                type="button"
                className="profile-drawer-item"
                onClick={handleLogout}
                disabled={isDeletingAccount}
              >
                <span className="profile-drawer-icon">
                  🚪
                </span>

                <span className="profile-drawer-item-content">
                  <span className="profile-drawer-item-title">
                    Sign Out
                  </span>

                  <span className="profile-drawer-item-description">
                    Sign out of your TravelMate account
                  </span>
                </span>

                <span className="profile-drawer-arrow">
                  →
                </span>
              </button>


              {/* DELETE ACCOUNT */}

              <button
                type="button"
                className="profile-drawer-item profile-drawer-delete"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
              >
                <span className="profile-drawer-icon">
                  🗑️
                </span>

                <span className="profile-drawer-item-content">
                  <span className="profile-drawer-item-title">
                    {isDeletingAccount
                      ? "Deleting Account..."
                      : "Delete Account"}
                  </span>

                  <span className="profile-drawer-item-description">
                    {isDeletingAccount
                      ? "Please wait while your account and data are deleted"
                      : "Permanently delete your account and data"}
                  </span>
                </span>

                <span className="profile-drawer-arrow">
                  →
                </span>
              </button>

            </div>


            {/* FOOTER */}

            <div className="profile-drawer-footer">
              <span>
                TravelMate
              </span>

              <span>
                Your journey, simplified.
              </span>
            </div>
          </aside>
        </div>
      )}


      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
          Android-style primary navigation
      ====================================================== */}

      <nav
        className="mobile-bottom-nav"
        aria-label="Primary navigation"
      >
        {/* HOME */}

        <Link
          to="/"
          className={
            isActive("/")
              ? "mobile-bottom-item active"
              : "mobile-bottom-item"
          }
        >
          <span className="mobile-bottom-icon">
            ⌂
          </span>

          <span>
            Home
          </span>
        </Link>


        {/* DISCOVER */}

        <Link
          to="/discover"
          className={
            isActive("/discover")
              ? "mobile-bottom-item active"
              : "mobile-bottom-item"
          }
        >
          <span className="mobile-bottom-icon">
            ◉
          </span>

          <span>
            Discover
          </span>
        </Link>


        {/* PLAN */}

        <Link
          to="/planner"
          className={
            isActive("/planner")
              ? "mobile-bottom-item planner-item active"
              : "mobile-bottom-item planner-item"
          }
        >
          <span className="mobile-plan-button">
            ✦
          </span>

          <span>
            Plan
          </span>
        </Link>


        {/* MY TRIPS */}

        <Link
          to="/my-trips"
          className={
            isActive("/my-trips")
              ? "mobile-bottom-item active"
              : "mobile-bottom-item"
          }
        >
          <span className="mobile-bottom-icon">
            ✈
          </span>

          <span>
            Trips
          </span>
        </Link>


        {/* REMINDERS */}

        <Link
          to="/reminders"
          className={
            isActive("/reminders")
              ? "mobile-bottom-item active"
              : "mobile-bottom-item"
          }
        >
          <span className="mobile-bottom-icon">
            ♧
          </span>

          <span>
            Reminders
          </span>
        </Link>
      </nav>
    </>
  );
}

export default Navbar;