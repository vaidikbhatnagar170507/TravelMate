import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../utils/api";

function MyTrips() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] =
    useState("upcoming");
  const [completingTripId, setCompletingTripId] =
    useState(null);

  // ---------------------------------------------------------
  // LOAD TRIPS
  // ---------------------------------------------------------

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/api/trips");

      const loadedTrips = Array.isArray(data)
        ? data
        : Array.isArray(data?.trips)
        ? data.trips
        : [];

      setTrips(loadedTrips);
    } catch (requestError) {
      console.error(
        "Failed to load trips:",
        requestError
      );

      setError(
        requestError?.message ||
          "Unable to load your trips."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  // ---------------------------------------------------------
  // DATE HELPERS
  // ---------------------------------------------------------

  const formatDate = (value) => {
    if (!value) {
      return "";
    }

    if (
      typeof value === "object" &&
      value?._seconds
    ) {
      const date = new Date(
        value._seconds * 1000
      );

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }

      return "";
    }

    const stringValue = String(value);

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        stringValue
      )
    ) {
      const [year, month, day] =
        stringValue
          .split("-")
          .map(Number);

      const date = new Date(
        Date.UTC(
          year,
          month - 1,
          day
        )
      );

      return date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }
      );
    }

    const date = new Date(stringValue);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    }

    return stringValue;
  };

  const parseDate = (value) => {
    if (!value) {
      return null;
    }

    if (
      typeof value === "object" &&
      value?._seconds
    ) {
      const date = new Date(
        value._seconds * 1000
      );

      return Number.isNaN(
        date.getTime()
      )
        ? null
        : date;
    }

    const stringValue = String(value);

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        stringValue
      )
    ) {
      const [year, month, day] =
        stringValue
          .split("-")
          .map(Number);

      return new Date(
        Date.UTC(
          year,
          month - 1,
          day
        )
      );
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  };

  const getStartDate = (trip) => {
    return (
      trip?.startDate ||
      trip?.fromDate ||
      trip?.travelStartDate ||
      null
    );
  };

  const getEndDate = (trip) => {
    return (
      trip?.endDate ||
      trip?.toDate ||
      trip?.travelEndDate ||
      null
    );
  };

  // ---------------------------------------------------------
  // COMPLETED TRIP RETENTION
  // ---------------------------------------------------------

  const getCompletedDate = (trip) => {
    // Prefer the actual date when the user
    // manually marked the trip completed.
    if (trip?.completedAt) {
      return parseDate(
        trip.completedAt
      );
    }

    // For older trips that were automatically
    // considered completed because their end date
    // passed, use the end date as the fallback.
    const endDate = getEndDate(trip);

    if (endDate) {
      return parseDate(endDate);
    }

    return null;
  };

  const addTwoMonths = (date) => {
    if (!date) {
      return null;
    }

    const result = new Date(date);

    result.setMonth(
      result.getMonth() + 2
    );

    return result;
  };

  const isCompletedTripExpired = (
    trip
  ) => {
    const completedDate =
      getCompletedDate(trip);

    if (!completedDate) {
      return false;
    }

    const expiryDate =
      addTwoMonths(
        completedDate
      );

    if (!expiryDate) {
      return false;
    }

    return new Date() >= expiryDate;
  };

  // ---------------------------------------------------------
  // TRIP STATUS
  // ---------------------------------------------------------

  const getTripStatus = (trip) => {
    const status = String(
      trip?.status || ""
    ).toUpperCase();

    if (
      status === "COMPLETED" ||
      status === "COMPLETE" ||
      trip?.completed === true
    ) {
      return "completed";
    }

    const startDate = parseDate(
      getStartDate(trip)
    );

    const endDate = parseDate(
      getEndDate(trip)
    );

    if (startDate && endDate) {
      const today = new Date();

      const todayDate = new Date(
        Date.UTC(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        )
      );

      if (
        todayDate >= startDate &&
        todayDate <= endDate
      ) {
        return "ongoing";
      }

      if (todayDate > endDate) {
        return "completed";
      }

      return "upcoming";
    }

    return "upcoming";
  };

  // ---------------------------------------------------------
  // TRIP HELPERS
  // ---------------------------------------------------------

  const getTripImage = (trip) => {
    if (trip?.image) {
      return trip.image;
    }

    return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=85";
  };

  const getDuration = (trip) => {
    if (trip?.days) {
      return `${trip.days} ${
        Number(trip.days) === 1
          ? "day"
          : "days"
      }`;
    }

    if (
      getStartDate(trip) &&
      getEndDate(trip)
    ) {
      const start = parseDate(
        getStartDate(trip)
      );

      const end = parseDate(
        getEndDate(trip)
      );

      if (start && end) {
        const difference =
          Math.round(
            (end.getTime() -
              start.getTime()) /
              86400000
          ) + 1;

        return `${difference} ${
          difference === 1
            ? "day"
            : "days"
        }`;
      }
    }

    return "Trip";
  };

  const getTripDates = (trip) => {
    const start = getStartDate(trip);
    const end = getEndDate(trip);

    if (start && end) {
      return `${formatDate(
        start
      )} — ${formatDate(end)}`;
    }

    if (start) {
      return formatDate(start);
    }

    if (trip?.date) {
      return formatDate(trip.date);
    }

    if (trip?.createdAt) {
      return `Planned ${formatDate(
        trip.createdAt
      )}`;
    }

    return "Dates not set";
  };

  const getCreatedTime = (trip) => {
    if (trip?.createdAt?._seconds) {
      return (
        trip.createdAt._seconds *
        1000
      );
    }

    if (trip?.createdAt) {
      const time = new Date(
        trip.createdAt
      ).getTime();

      if (!Number.isNaN(time)) {
        return time;
      }
    }

    return 0;
  };

  const getTripId = (
    trip,
    index
  ) => {
    return (
      trip?.id ||
      trip?.tripId ||
      `trip-${index}`
    );
  };

  // ---------------------------------------------------------
  // CATEGORIZE TRIPS
  // ---------------------------------------------------------

  const categorizedTrips = useMemo(() => {
    const sorted = [...trips].sort(
      (a, b) =>
        getCreatedTime(b) -
        getCreatedTime(a)
    );

    const categories = {
      upcoming: [],
      ongoing: [],
      completed: [],
    };

    sorted.forEach((trip, index) => {
      const status =
        getTripStatus(trip);

      // Completed trips older than two months
      // are intentionally hidden from My Trips.
      if (
        status === "completed" &&
        isCompletedTripExpired(trip)
      ) {
        return;
      }

      const preparedTrip = {
        ...trip,
        id: getTripId(
          trip,
          index
        ),
        image: getTripImage(trip),
      };

      categories[status].push(
        preparedTrip
      );
    });

    return categories;
  }, [trips]);

  const visibleTrips =
    categorizedTrips[activeTab] || [];

  // ---------------------------------------------------------
  // VIEW TRIP
  // ---------------------------------------------------------

  const handleViewTrip = (
    trip
  ) => {
    if (!trip?.id) {
      setError(
        "This trip does not have a valid ID."
      );
      return;
    }

    localStorage.setItem(
      "travelmateCurrentTripId",
      String(trip.id)
    );

    navigate("/trip-details", {
      state: {
        trip,
      },
    });
  };

  // ---------------------------------------------------------
  // COMPLETE TRIP
  // ---------------------------------------------------------

  const handleCompleteTrip = async (
    trip
  ) => {
    if (
      !trip?.id ||
      completingTripId
    ) {
      return;
    }

    try {
      setCompletingTripId(
        trip.id
      );

      setError("");

      const completedAt =
        new Date().toISOString();

      const updatedTrip = {
        ...trip,

        status: "COMPLETED",

        completed: true,

        completedAt,
      };

      const response =
        await apiRequest(
          `/api/trips/${encodeURIComponent(
            trip.id
          )}`,
          {
            method: "PUT",
            body: JSON.stringify({
              trip: updatedTrip,
            }),
          }
        );

      const savedTrip =
        response?.trip ||
        updatedTrip;

      setTrips(
        (currentTrips) =>
          currentTrips.map(
            (currentTrip) => {
              const currentId =
                currentTrip.id ||
                currentTrip.tripId;

              if (
                String(
                  currentId
                ) ===
                String(trip.id)
              ) {
                return savedTrip;
              }

              return currentTrip;
            }
          )
      );

      setActiveTab("completed");
    } catch (requestError) {
      console.error(
        "Failed to complete trip:",
        requestError
      );

      setError(
        requestError?.message ||
          "Unable to mark this trip as completed."
      );
    } finally {
      setCompletingTripId(
        null
      );
    }
  };

  // ---------------------------------------------------------
  // EMPTY STATE
  // ---------------------------------------------------------

  const renderEmptyState = () => {
    const content = {
      upcoming: {
        kicker:
          "NO UPCOMING TRIPS",
        title:
          "Your next adventure starts here.",
        text:
          "Plan a journey and it will appear here automatically.",
        button:
          "Plan a trip →",
      },

      ongoing: {
        kicker:
          "NO ONGOING TRIPS",
        title:
          "No trip is happening right now.",
        text:
          "Your active journey will appear here while you're travelling.",
        button:
          "Explore destinations →",
      },

      completed: {
        kicker:
          "NO COMPLETED TRIPS",
        title:
          "Your travel memories start here.",
        text:
          "Completed journeys stay here for two months after completion.",
        button:
          "Plan a new trip →",
      },
    };

    const current =
      content[activeTab];

    return (
      <div className="my-trips-empty">
        <div className="my-trips-empty-icon">
          {activeTab ===
          "completed"
            ? "✓"
            : activeTab ===
              "ongoing"
            ? "✦"
            : "✈"}
        </div>

        <span className="section-kicker">
          {current.kicker}
        </span>

        <h2>
          {current.title}
        </h2>

        <p>
          {current.text}
        </p>

        <button
          type="button"
          className="my-trips-empty-button"
          onClick={() =>
            navigate(
              activeTab ===
                "ongoing"
                ? "/discover"
                : "/planner"
            )
          }
        >
          {current.button}
        </button>
      </div>
    );
  };

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <div className="app inner-page my-trips-app">
      <main className="my-trips-page section">

        {/* HEADER */}

        <section className="my-trips-header">
          <div>
            <span className="section-kicker">
              YOUR JOURNEYS
            </span>

            <h1>
              My <em>Trips.</em>
            </h1>

            <p>
              Everything you've planned,
              in one place.
            </p>
          </div>

          <button
            className="my-trips-new-button"
            type="button"
            onClick={() =>
              navigate("/planner")
            }
          >
            <span>+</span>
            New trip
          </button>
        </section>

        {/* ERROR */}

        {error && (
          <div className="my-trips-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={loadTrips}
            >
              Try again
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="my-trips-loading">
            <div className="my-trips-spinner" />

            <strong>
              Loading your trips...
            </strong>

            <p>
              Fetching your saved journeys.
            </p>
          </div>
        ) : (
          <>
            {/* TABS */}

            <div className="my-trips-tabs">
              <button
                type="button"
                className={
                  activeTab ===
                  "upcoming"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "upcoming"
                  )
                }
              >
                <span>
                  Upcoming
                </span>

                <b>
                  {
                    categorizedTrips
                      .upcoming
                      .length
                  }
                </b>
              </button>

              <button
                type="button"
                className={
                  activeTab ===
                  "ongoing"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "ongoing"
                  )
                }
              >
                <span>
                  Ongoing
                </span>

                <b>
                  {
                    categorizedTrips
                      .ongoing
                      .length
                  }
                </b>
              </button>

              <button
                type="button"
                className={
                  activeTab ===
                  "completed"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "completed"
                  )
                }
              >
                <span>
                  Completed
                </span>

                <b>
                  {
                    categorizedTrips
                      .completed
                      .length
                  }
                </b>
              </button>
            </div>

            {/* CONTENT */}

            {visibleTrips.length ===
            0 ? (
              renderEmptyState()
            ) : (
              <div className="my-trips-list">
                {visibleTrips.map(
                  (trip) => (
                    <article
                      className="my-trip-card"
                      key={trip.id}
                    >
                      {/* IMAGE */}

                      <div className="my-trip-image">
                        <img
                          src={trip.image}
                          alt={
                            trip.destination ||
                            "Trip destination"
                          }
                        />

                        <div className="my-trip-image-overlay" />

                        <span
                          className={`my-trip-status ${activeTab}`}
                        >
                          {activeTab ===
                          "ongoing"
                            ? "ONGOING"
                            : activeTab ===
                              "completed"
                            ? "COMPLETED"
                            : "UPCOMING"}
                        </span>
                      </div>

                      {/* CONTENT */}

                      <div className="my-trip-content">
                        <div className="my-trip-top">
                          <div>
                            <h2>
                              {trip.destination ||
                                "Untitled trip"}
                            </h2>

                            {trip.country && (
                              <span className="my-trip-country">
                                ◎{" "}
                                {
                                  trip.country
                                }
                              </span>
                            )}
                          </div>

                          <span className="my-trip-duration">
                            {getDuration(
                              trip
                            )}
                          </span>
                        </div>

                        <div className="my-trip-details">
                          <div>
                            <span>
                              DATES
                            </span>

                            <strong>
                              {getTripDates(
                                trip
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              TRAVELLERS
                            </span>

                            <strong>
                              {trip.travellers ||
                                trip.travelers ||
                                1}{" "}
                              {Number(
                                trip.travellers ||
                                  trip.travelers ||
                                  1
                              ) === 1
                                ? "person"
                                : "people"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              STYLE
                            </span>

                            <strong>
                              {trip.style ||
                                "Balanced"}
                            </strong>
                          </div>
                        </div>

                        {/* ACTIONS */}

                        <div className="my-trip-actions">
                          <button
                            type="button"
                            className="my-trip-view-button"
                            onClick={() =>
                              handleViewTrip(
                                trip
                              )
                            }
                          >
                            View trip
                            <span>
                              →
                            </span>
                          </button>

                          {activeTab !==
                            "completed" && (
                            <button
                              type="button"
                              className="my-trip-complete-button"
                              disabled={
                                completingTripId ===
                                trip.id
                              }
                              onClick={() =>
                                handleCompleteTrip(
                                  trip
                                )
                              }
                            >
                              {completingTripId ===
                              trip.id
                                ? "..."
                                : "Complete"}
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default MyTrips;