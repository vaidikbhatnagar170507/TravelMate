import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const FALLBACK_TRIP = {
  destination: "Bali",
  country: "Indonesia",
  travellers: 2,
  days: 5,
  budget: 50000,
  style: "Balanced",
  daysPlan: [],
  savedPlaces: [],
  checklist: [],
  selectedStay: null,
};

function getStoredTrip() {
  const storedTrip =
    localStorage.getItem("travelmateTrip");

  if (!storedTrip) {
    return null;
  }

  try {
    return JSON.parse(storedTrip);
  } catch {
    localStorage.removeItem(
      "travelmateTrip"
    );

    return null;
  }
}

function Tracking() {
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);

  const [activeDay, setActiveDay] =
    useState(1);

  useEffect(() => {
    const loadTrip = () => {
      const storedTrip =
        getStoredTrip();

      if (storedTrip) {
        setTrip(storedTrip);
      } else {
        setTrip(null);
      }
    };

    loadTrip();

    window.addEventListener(
      "storage",
      loadTrip
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadTrip
      );
    };
  }, []);

  const currentTrip =
    trip || FALLBACK_TRIP;

  const daysPlan = Array.isArray(
    currentTrip.daysPlan
  )
    ? currentTrip.daysPlan
    : [];

  const savedPlaces = Array.isArray(
    currentTrip.savedPlaces
  )
    ? currentTrip.savedPlaces
    : [];

  const checklist = Array.isArray(
    currentTrip.checklist
  )
    ? currentTrip.checklist
    : [];

  /*
   * =========================================================
   * SELECTED STAY
   * =========================================================
   *
   * Priority:
   *
   * 1. trip.selectedStay
   * 2. A saved place with type === "stay"
   * 3. No accommodation
   *
   * We intentionally DO NOT use savedPlaces[0].
   * This prevents restaurants/attractions from appearing
   * as the hotel in Tracking.
   */

  const selectedStay =
    currentTrip.selectedStay &&
    typeof currentTrip.selectedStay ===
      "object"
      ? currentTrip.selectedStay
      : null;

  const savedStay =
    savedPlaces.find(
      (place) =>
        place?.type === "stay"
    ) || null;

  const currentStay =
    selectedStay || savedStay || null;

  const stayName =
    currentStay?.name ||
    "Accommodation";

  const stayDetails =
    currentStay?.address ||
    currentStay?.area ||
    currentStay?.note ||
    "Add your preferred stay in Trip Details.";

  const stayRating =
    currentStay?.rating
      ? `★ ${currentStay.rating}${
          currentStay.ratingCount
            ? ` (${currentStay.ratingCount})`
            : ""
        }`
      : "";

  const stayPrice =
    currentStay?.priceText ||
    (currentStay?.pricePerNight
      ? `₹${Number(
          currentStay.pricePerNight
        ).toLocaleString(
          "en-IN"
        )}/night`
      : "");

  const completedChecklist =
    checklist.filter(
      (item) => item.completed
    ).length;

  const preparationProgress =
    checklist.length > 0
      ? Math.round(
          (completedChecklist /
            checklist.length) *
            100
        )
      : 0;

  const totalActivities =
    daysPlan.reduce(
      (total, day) =>
        total +
        (Array.isArray(
          day.activities
        )
          ? day.activities.length
          : 0),
      0
    );

  const activeDayData =
    daysPlan.find(
      (day) =>
        Number(day.day) ===
        Number(activeDay)
    ) ||
    daysPlan[0] ||
    null;

  const nextActivity =
    activeDayData?.activities?.[0] ||
    null;

  const nextDayNumber =
    activeDayData?.day ||
    1;

  const nextDayTitle =
    activeDayData?.title ||
    "Trip itinerary";

  const nextActivityDescription =
    nextActivity?.description ||
    "Your next planned activity will appear here.";

  const nextActivityTime =
    nextActivity?.time ||
    "Flexible";

  const tripDuration =
    Number(currentTrip.days) || 0;

  const travellerCount =
    Number(
      currentTrip.travellers
    ) || 0;

  const routeProgress =
    tripDuration > 0
      ? Math.round(
          (Math.min(
            nextDayNumber,
            tripDuration
          ) /
            tripDuration) *
            100
        )
      : 0;

  const statusText =
    trip && daysPlan.length > 0
      ? "Plan ready"
      : "Planning";

  const statusDescription =
    trip && daysPlan.length > 0
      ? "Your itinerary is ready to follow."
      : "Complete your trip plan to start tracking.";

  const handleViewItinerary = () => {
    navigate(
      "/trip-details"
    );
  };

  const handleViewBudget = () => {
    navigate("/budget");
  };

  const handleEditTrip = () => {
    if (!trip) {
      navigate("/planner");
      return;
    }

    navigate("/planner", {
      state: {
        destination:
          trip.destination,
        travellers:
          trip.travellers,
        days: trip.days,
        budget: trip.budget,
        style: trip.style,
        generated: true,
        trip,
      },
    });
  };

  const handleViewStay = () => {
    navigate("/trip-details", {
      state: {
        activeTab: "stays",
      },
    });
  };

  const dayButtons = useMemo(
    () => daysPlan,
    [daysPlan]
  );

  if (!trip) {
    return (
      <div className="app inner-page">

        <main className="section dashboard-page">

          <div className="page-heading-row">
            <div>
              <div className="section-kicker">
                JOURNEY TRACKING
              </div>

              <h1>
                Trip <em>Tracking.</em>
              </h1>

              <p>
                Your journey progress will appear
                here once you create a trip.
              </p>
            </div>
          </div>

          <div className="ui-state">

            <div className="ui-state-icon">
              ✈
            </div>

            <h3>
              No trip to track yet
            </h3>

            <p>
              Create and save a trip first.
              TravelMate will then show your
              itinerary progress, upcoming
              activities and travel details here.
            </p>

            <button
              className="primary-button"
              type="button"
              onClick={() =>
                navigate(
                  "/planner"
                )
              }
            >
              Start planning →
            </button>

          </div>

        </main>

      </div>
    );
  }

  return (
    <div className="app inner-page">

      <main className="section dashboard-page">

        <div className="page-heading-row">

          <div>

            <div className="section-kicker">
              JOURNEY TRACKING
            </div>

            <h1>
              Trip <em>Tracking.</em>
            </h1>

            <p>
              Keep every important part of your
              {" "}
              {currentTrip.destination}
              {" "}
              journey in view.
            </p>

          </div>

          <div className="live-pill">
            <span />
            {statusText}
          </div>

        </div>

        {/* JOURNEY OVERVIEW */}

        <section className="tracking-overview">

          <div className="tracking-overview-main">

            <div className="section-kicker">
              YOUR JOURNEY
            </div>

            <div className="tracking-destination-row">

              <div>

                <span className="tracking-small-label">
                  DESTINATION
                </span>

                <h2>
                  {
                    currentTrip.destination
                  }
                </h2>

                <p>
                  📍{" "}
                  {
                    currentTrip.country ||
                    "Your destination"
                  }
                </p>

              </div>

              <div className="tracking-destination-icon">
                ✈
              </div>

            </div>

            <div className="tracking-progress-header">

              <span>
                Journey progress
              </span>

              <strong>
                {routeProgress}%
              </strong>

            </div>

            <div className="tracking-progress-bar">

              <div
                style={{
                  width: `${routeProgress}%`,
                }}
              />

            </div>

            <div className="tracking-progress-labels">

              <span>
                Day 1
              </span>

              <span>
                Day {tripDuration || 1}
              </span>

            </div>

          </div>

          <div className="tracking-overview-stats">

            <div>
              <span>
                DURATION
              </span>

              <strong>
                {tripDuration}
              </strong>

              <small>
                days
              </small>
            </div>

            <div>
              <span>
                TRAVELLERS
              </span>

              <strong>
                {travellerCount}
              </strong>

              <small>
                people
              </small>
            </div>

            <div>
              <span>
                ACTIVITIES
              </span>

              <strong>
                {totalActivities}
              </strong>

              <small>
                planned
              </small>
            </div>

            <div>
              <span>
                PREPARATION
              </span>

              <strong>
                {preparationProgress}%
              </strong>

              <small>
                complete
              </small>
            </div>

          </div>

        </section>

        {/* DAY SELECTOR */}

        {dayButtons.length > 0 && (
          <section className="tracking-day-section">

            <div className="tracking-section-heading">

              <div>

                <div className="section-kicker">
                  DAY BY DAY
                </div>

                <h2>
                  Follow your{" "}
                  <em>journey.</em>
                </h2>

              </div>

              <span>
                {daysPlan.length} planned days
              </span>

            </div>

            <div className="tracking-day-selector">

              {dayButtons.map(
                (day) => (
                  <button
                    type="button"
                    key={day.day}
                    className={
                      Number(
                        activeDay
                      ) ===
                      Number(
                        day.day
                      )
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveDay(
                        day.day
                      )
                    }
                  >

                    <small>
                      DAY
                    </small>

                    <strong>
                      {day.day}
                    </strong>

                  </button>
                )
              )}

            </div>

          </section>
        )}

        <section className="tracking-layout">

          <div className="tracking-main">

            {/* JOURNEY ROUTE */}

            <div className="tracking-route">

              <div className="route-point completed">

                <span>
                  ✓
                </span>

                <div>

                  <strong>
                    Start
                  </strong>

                  <small>
                    Trip begins
                  </small>

                </div>

              </div>

              <div className="route-line">
                <div />
              </div>

              <div className="route-point current">

                <span>
                  ✦
                </span>

                <div>

                  <strong>
                    Day{" "}
                    {
                      nextDayNumber
                    }
                  </strong>

                  <small>
                    {
                      nextDayTitle
                    }
                  </small>

                </div>

              </div>

              <div className="route-line">
                <div className="empty-line" />
              </div>

              <div className="route-point">

                <span>
                  ◎
                </span>

                <div>

                  <strong>
                    {
                      currentTrip.destination
                    }
                  </strong>

                  <small>
                    Destination
                  </small>

                </div>

              </div>

            </div>

            {/* NEXT EVENT */}

            <div className="tracking-card">

              <div className="tracking-card-top">

                <div>

                  <span className="section-kicker">
                    NEXT EVENT
                  </span>

                  <h2>
                    {nextActivity?.name ||
                      "Your itinerary"}
                  </h2>

                </div>

                <strong>
                  {nextActivityTime}
                </strong>

              </div>

              <div className="tracking-event-body">

                <div className="tracking-event-icon">
                  ✦
                </div>

                <div>

                  <strong>
                    Day{" "}
                    {
                      nextDayNumber
                    }
                    {" "}
                    ·{" "}
                    {
                      nextDayTitle
                    }
                  </strong>

                  <p>
                    {
                      nextActivityDescription
                    }
                  </p>

                </div>

              </div>

              <div className="tracking-card-actions">

                <button
                  type="button"
                  className="primary-button"
                  onClick={
                    handleViewItinerary
                  }
                >
                  View full itinerary →
                </button>

              </div>

            </div>

            {/* SELECTED DAY ACTIVITIES */}

            {activeDayData &&
              Array.isArray(
                activeDayData.activities
              ) && (
                <div className="tracking-activities-card">

                  <div className="tracking-section-heading">

                    <div>

                      <div className="section-kicker">
                        DAY{" "}
                        {
                          activeDayData.day
                        }
                      </div>

                      <h2>
                        {
                          activeDayData.title
                        }
                      </h2>

                    </div>

                  </div>

                  <p className="tracking-day-description">
                    {
                      activeDayData.description
                    }
                  </p>

                  <div className="tracking-activity-list">

                    {activeDayData.activities
                      .length > 0 ? (
                      activeDayData.activities.map(
                        (
                          activity,
                          index
                        ) => (
                          <div
                            className={`tracking-activity-row ${
                              index ===
                              0
                                ? "next"
                                : ""
                            }`}
                            key={
                              activity.id ||
                              `${activeDayData.day}-${index}`
                            }
                          >

                            <div className="tracking-activity-time">
                              {
                                activity.time ||
                                "--"
                              }
                            </div>

                            <div className="tracking-activity-dot">
                              {index ===
                              0
                                ? "→"
                                : "•"}
                            </div>

                            <div className="tracking-activity-content">

                              <strong>
                                {
                                  activity.name
                                }
                              </strong>

                              <span>
                                {
                                  activity.description ||
                                  "Planned activity"
                                }
                              </span>

                            </div>

                          </div>
                        )
                      )
                    ) : (
                      <div className="empty-list">

                        <span className="empty-list-icon">
                          ✦
                        </span>

                        <strong>
                          No activities planned
                          for this day
                        </strong>

                        <p>
                          Add activities from
                          Trip Details to make
                          this day more useful.
                        </p>

                      </div>
                    )}

                  </div>

                </div>
              )}

          </div>

          {/* SIDE PANEL */}

          <aside className="tracking-side">

            {/* SELECTED STAY */}

            <div className="side-card tracking-stay-card">

              <span>
                STAY
              </span>

              <strong>
                {stayName}
              </strong>

              <small>
                {stayDetails}
              </small>

              {stayRating && (
                <small className="tracking-stay-meta">
                  {stayRating}
                </small>
              )}

              {stayPrice && (
                <small className="tracking-stay-meta">
                  {stayPrice}
                </small>
              )}

              {currentStay && (
                <button
                  type="button"
                  className="side-card-action"
                  onClick={
                    handleViewStay
                  }
                >
                  View selected stay →
                </button>
              )}

            </div>

            {/* TRAVEL STYLE */}

            <div className="side-card">

              <span>
                TRAVEL STYLE
              </span>

              <strong>
                {
                  currentTrip.style ||
                  "Balanced"
                }
              </strong>

              <small>
                Personalized trip experience
              </small>

            </div>

            {/* TRIP PREPARATION */}

            <div className="side-card">

              <span>
                TRIP PREPARATION
              </span>

              <strong>
                {
                  preparationProgress
                }
                % complete
              </strong>

              <small>
                {
                  completedChecklist
                }{" "}
                of{" "}
                {
                  checklist.length
                }{" "}
                checklist items completed.
              </small>

              <button
                type="button"
                className="side-card-action"
                onClick={() =>
                  navigate(
                    "/trip-details"
                  )
                }
              >
                Open checklist →
              </button>

            </div>

            {/* TRAVELMATE AI */}

            <div className="side-card tracking-ai-card">

              <span>
                TRAVELMATE AI
              </span>

              <strong>
                {statusText ===
                "Plan ready"
                  ? "Your journey is organized."
                  : "Your journey is taking shape."}
              </strong>

              <small>
                {statusDescription}
              </small>

            </div>

          </aside>

        </section>

        {/* QUICK ACTIONS */}

        <section className="tracking-quick-actions">

          <div className="section-kicker">
            QUICK ACTIONS
          </div>

          <div className="quick-actions-grid">

            <button
              type="button"
              onClick={
                handleViewItinerary
              }
            >

              <span>
                ✦
              </span>

              <strong>
                View itinerary
              </strong>

              <small>
                Check every planned day
              </small>

            </button>

            <button
              type="button"
              onClick={
                handleViewBudget
              }
            >

              <span>
                ₹
              </span>

              <strong>
                Check budget
              </strong>

              <small>
                See your current spending
              </small>

            </button>

            <button
              type="button"
              onClick={
                handleEditTrip
              }
            >

              <span>
                ✎
              </span>

              <strong>
                Edit trip
              </strong>

              <small>
                Change your journey plan
              </small>

            </button>

          </div>

        </section>

        {/* FOOTER */}

        <section className="trip-details-footer-card">

          <div>

            <span className="section-kicker">
              TRAVELMATE
            </span>

            <h2>
              One journey.
              <em>
                {" "}
                One place.
              </em>
            </h2>

            <p>
              Keep your itinerary, preparation
              and travel plans together as your
              journey gets closer.
            </p>

          </div>

          <button
            className="primary-button"
            type="button"
            onClick={
              handleViewItinerary
            }
          >
            Continue planning →
          </button>

        </section>

      </main>

    </div>
  );
}

export default Tracking;