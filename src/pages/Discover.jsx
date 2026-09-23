import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import destinations from "../data/destinations";

function Discover() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("All");
  const [favorites, setFavorites] = useState([]);

  const filters = [
    "All",
    "Beach Escape",
    "Mountains",
    "Luxury",
    "Culture",
    "Romantic",
    "Island",
  ];

  const results = useMemo(() => {
    return destinations.filter((destination) => {
      return (
        filter === "All" ||
        destination.tag === filter
      );
    });
  }, [filter]);

  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const planTrip = (destination) => {
    navigate("/planner", {
      state: {
        destination: destination.name,
        lockedDestination: true,
      },
    });
  };

  return (
    <div className="app inner-page discover-app">
      <main>
        {/* HERO */}

        <section className="discover-hero section">
          <div className="section-kicker">
            DISCOVER THE WORLD
          </div>

          <h1>
            Find somewhere
            <br />
            <em>worth remembering.</em>
          </h1>

          <p>
            Explore destinations, discover new experiences
            and find the perfect place for your next journey.
          </p>
        </section>

        {/* DISCOVER CONTENT */}

        <section className="discover-page section">
          {/* FILTERS */}

          <div className="discover-filter-scroll">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  filter === item
                    ? "active"
                    : ""
                }
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {/* RESULT HEADER */}

          <div className="discover-result-header">
            <div>
              <span className="section-kicker">
                EXPLORE
              </span>

              <strong>
                {results.length}{" "}
                {results.length === 1
                  ? "destination"
                  : "destinations"}
              </strong>
            </div>

            <span>
              Curated for your next adventure
            </span>
          </div>

          {/* DESTINATIONS */}

          {results.length > 0 ? (
            <div className="discover-destination-list">
              {results.map((destination) => {
                const isFavorite =
                  favorites.includes(
                    destination.id
                  );

                return (
                  <article
                    className="discover-destination-card"
                    key={destination.id}
                  >
                    {/* IMAGE */}

                    <div className="discover-card-image">
                      <img
                        src={destination.image}
                        alt={destination.name}
                      />

                      <div className="discover-card-image-overlay" />

                      <span className="discover-destination-tag">
                        {destination.tag}
                      </span>

                      <button
                        className={`discover-heart-button ${
                          isFavorite
                            ? "liked"
                            : ""
                        }`}
                        type="button"
                        onClick={() =>
                          toggleFavorite(
                            destination.id
                          )
                        }
                        aria-label={
                          isFavorite
                            ? `Remove ${destination.name} from favorites`
                            : `Add ${destination.name} to favorites`
                        }
                      >
                        {isFavorite
                          ? "♥"
                          : "♡"}
                      </button>

                      <div className="discover-card-image-title">
                        <h2>
                          {destination.name}
                        </h2>

                        <span>
                          ◎ {destination.country}
                        </span>
                      </div>
                    </div>

                    {/* CONTENT */}

                    <div className="discover-card-content">
                      <div className="discover-card-meta">
                        <span>
                          ★ {destination.rating}
                        </span>

                        <span>
                          {destination.tag}
                        </span>
                      </div>

                      <p className="discover-description">
                        {destination.description}
                      </p>

                      <button
                        className="discover-plan-button"
                        type="button"
                        onClick={() =>
                          planTrip(destination)
                        }
                      >
                        <span>
                          Plan this trip
                        </span>

                        <span>→</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="discover-empty-state">
              <span>✦</span>

              <h3>
                No destinations found
              </h3>

              <p>
                Try another category.
              </p>

              <button
                type="button"
                onClick={() => setFilter("All")}
              >
                Show all destinations
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Discover;