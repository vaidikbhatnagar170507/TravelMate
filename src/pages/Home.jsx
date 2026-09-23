import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Home() {
  const navigate = useNavigate();

  const { currentUser } = useAuth();

  const userName =
    currentUser?.displayName?.split(" ")[0] ||
    currentUser?.name?.split(" ")[0] ||
    currentUser?.email?.split("@")[0] ||
    "Traveller";

  const [showPlanner, setShowPlanner] = useState(false);
  const [travellers, setTravellers] = useState(2);
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState(50000);
  const [tripDestination, setTripDestination] =
    useState("Bali");

  const destinations = [
    {
      id: 1,
      name: "Bali",
      country: "Indonesia",
      image:
        "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: 2,
      name: "Dubai",
      country: "UAE",
      image:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: 3,
      name: "Manali",
      country: "India",
      image:
        "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: 4,
      name: "Jaipur",
      country: "India",
      image:
        "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=85",
    },
  ];

  const openPlanner = () => {
    setTripDestination("Bali");
    setShowPlanner(true);
  };

  const generateTrip = (event) => {
    event.preventDefault();

    setShowPlanner(false);

    navigate("/planner", {
      state: {
        destination: tripDestination,
        travellers,
        days,
        budget,
      },
    });
  };

  return (
    <div className="home-page">
      <main className="home-main">

        {/* =================================================
            WELCOME
        ================================================= */}

        <section className="home-welcome">

          <div className="home-welcome-copy">

            <span className="home-kicker">
              Hi {userName} 👋
            </span>

            <h1>
              Ready for your
              <br />
              <em>next adventure?</em>
            </h1>

            <p>
              Discover places, plan unforgettable
              journeys and keep everything you need
              for your trip in one place.
            </p>

          </div>

          <div className="home-quick-actions">

            <button
              className="home-primary-action"
              type="button"
              onClick={openPlanner}
            >
              <span className="home-action-icon">
                ✦
              </span>

              <span>
                <strong>
                  Plan a Trip
                </strong>

                <small>
                  Create your itinerary
                </small>
              </span>

              <span className="home-action-arrow">
                →
              </span>
            </button>

            <Link
              className="home-secondary-action"
              to="/discover"
            >
              <span className="home-action-icon">
                ◉
              </span>

              <span>
                <strong>
                  Discover
                </strong>

                <small>
                  Find your next destination
                </small>
              </span>

              <span className="home-action-arrow">
                →
              </span>
            </Link>

          </div>

        </section>


        {/* =================================================
            TRAVELMATE AI CARD
        ================================================= */}

        <section className="home-ai-card">

          <div className="home-ai-glow" />

          <div className="home-ai-icon">
            ✦
          </div>

          <div className="home-ai-content">

            <span>
              TRAVELMATE AI
            </span>

            <h2>
              Plan smarter.
              <br />
              <em>Travel better.</em>
            </h2>

            <p>
              Get help with your itinerary,
              destinations, budget and trip plans.
            </p>

            <Link
              to="/assistant"
              className="home-ai-link"
            >
              Ask TravelMate AI
              <span>→</span>
            </Link>

          </div>

          <div className="home-ai-decoration">
            <span>✦</span>
            <span>✈</span>
            <span>◌</span>
          </div>

        </section>


        {/* =================================================
            POPULAR DESTINATIONS
        ================================================= */}

        <section className="home-section">

          <div className="home-section-heading">

            <div>
              <span className="home-kicker">
                GET INSPIRED
              </span>

              <h2>
                Popular destinations
              </h2>
            </div>

            <Link
              to="/discover"
              className="home-view-all"
            >
              <span>
                View all
              </span>

              <span>
                →
              </span>
            </Link>

          </div>

          <div className="home-destination-scroll">

            {destinations.map((destination) => (
              <button
                className="home-destination-card"
                key={destination.id}
                type="button"
                onClick={() =>
                  navigate("/planner", {
                    state: {
                      destination:
                        destination.name,
                      lockedDestination: true,
                    },
                  })
                }
              >

                <img
                  src={destination.image}
                  alt={destination.name}
                />

                <div className="home-destination-overlay" />

                <div className="home-destination-info">

                  <strong>
                    {destination.name}
                  </strong>

                  <span>
                    {destination.country}
                  </span>

                </div>

                <span className="home-destination-arrow">
                  →
                </span>

              </button>
            ))}

          </div>

        </section>


        {/* =================================================
            WHY TRAVELMATE
        ================================================= */}

        <section className="home-section home-why-section">

          <div className="home-section-heading home-heading-stack">

            <span className="home-kicker">
              WHY TRAVELMATE
            </span>

            <h2>
              Everything for your
              <br />
              <em>journey.</em>
            </h2>

            <p>
              From the first idea to the final day,
              TravelMate keeps your travel organized.
            </p>

          </div>

          <div className="home-feature-grid">

            <div className="home-feature-card">

              <div className="home-feature-icon">
                ✦
              </div>

              <span>
                01
              </span>

              <h3>
                Smart planning
              </h3>

              <p>
                Build personalized itineraries
                around your destination, dates,
                budget and travel style.
              </p>

            </div>


            <div className="home-feature-card">

              <div className="home-feature-icon">
                ◷
              </div>

              <span>
                02
              </span>

              <h3>
                Stay organized
              </h3>

              <p>
                Keep your itinerary, stays,
                expenses and checklist together
                inside every trip.
              </p>

            </div>


            <div className="home-feature-card">

              <div className="home-feature-icon">
                ₹
              </div>

              <span>
                03
              </span>

              <h3>
                Control your budget
              </h3>

              <p>
                Track your planned budget and
                actual expenses without switching
                between different apps.
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            FINAL CTA
        ================================================= */}

        <section className="home-final-cta">

          <div>

            <span className="home-kicker">
              YOUR NEXT JOURNEY
            </span>

            <h2>
              Where will you
              <br />
              <em>go next?</em>
            </h2>

          </div>

          <button
            type="button"
            onClick={openPlanner}
            className="home-final-button"
          >
            Start Planning
            <span>→</span>
          </button>

        </section>

      </main>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="home-footer">

        <Link
          to="/"
          className="home-footer-brand"
        >
          <span className="brand-mark">
            ✈
          </span>

          <span>
            Travel<span>Mate</span>
          </span>
        </Link>

        <p>
          Travel smarter. Explore further.
        </p>

        <span>
          © 2026 TravelMate
        </span>

      </footer>


      {/* =================================================
          QUICK PLANNER MODAL
      ================================================= */}

      {showPlanner && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowPlanner(false);
            }
          }}
        >

          <div className="planner-modal">

            <button
              className="modal-close"
              type="button"
              onClick={() =>
                setShowPlanner(false)
              }
              aria-label="Close planner"
            >
              ×
            </button>


            <div className="modal-kicker">
              ✦ SMART TRIP PLANNER
            </div>


            <h2>
              Let's build your{" "}
              <em>
                next adventure.
              </em>
            </h2>


            <p>
              Give us a few details and
              TravelMate will prepare your
              starting itinerary.
            </p>


            <form
              onSubmit={generateTrip}
            >

              <label>
                Where do you want to go?

                <select
                  value={tripDestination}
                  onChange={(event) =>
                    setTripDestination(
                      event.target.value
                    )
                  }
                >

                  {destinations.map(
                    (destination) => (
                      <option
                        key={destination.id}
                        value={
                          destination.name
                        }
                      >
                        {destination.name},{" "}
                        {destination.country}
                      </option>
                    )
                  )}

                </select>

              </label>


              <div className="form-grid">

                <label>
                  Travellers

                  <div className="stepper">

                    <button
                      type="button"
                      onClick={() =>
                        setTravellers(
                          (value) =>
                            Math.max(
                              1,
                              value - 1
                            )
                        )
                      }
                    >
                      −
                    </button>

                    <strong>
                      {travellers}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        setTravellers(
                          (value) =>
                            Math.min(
                              12,
                              value + 1
                            )
                        )
                      }
                    >
                      +
                    </button>

                  </div>

                </label>


                <label>
                  Days

                  <div className="stepper">

                    <button
                      type="button"
                      onClick={() =>
                        setDays(
                          (value) =>
                            Math.max(
                              1,
                              value - 1
                            )
                        )
                      }
                    >
                      −
                    </button>

                    <strong>
                      {days}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        setDays(
                          (value) =>
                            Math.min(
                              30,
                              value + 1
                            )
                        )
                      }
                    >
                      +
                    </button>

                  </div>

                </label>

              </div>


              <label>
                Approx. budget

                <div className="budget-label">

                  <strong>
                    ₹
                    {budget.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                  <span>
                    for the whole trip
                  </span>

                </div>


                <input
                  className="range"
                  type="range"
                  min="10000"
                  max="200000"
                  step="5000"
                  value={budget}
                  onChange={(event) =>
                    setBudget(
                      Number(
                        event.target.value
                      )
                    )
                  }
                />


                <div className="range-labels">

                  <span>
                    ₹10k
                  </span>

                  <span>
                    ₹2L+
                  </span>

                </div>

              </label>


              <button
                className="modal-submit"
                type="submit"
              >
                Continue to planner
                <span>
                  →
                </span>
              </button>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Home;