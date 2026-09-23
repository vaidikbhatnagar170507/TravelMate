function TripCard({
  trip,
  type = "upcoming",
  onViewTrip,
  onTrackTrip,
  onEditTrip,
  onDeleteTrip,
}) {
  const handleDelete = () => {
    if (onDeleteTrip) {
      onDeleteTrip(trip);
    }
  };

  // --------------------------------------------------
  // RECENT TRIP CARD
  // --------------------------------------------------

  if (type === "recent") {
    return (
      <div className="recent-trip">
        <div className="recent-icon">
          {trip.icon || trip.emoji || "✈️"}
        </div>

        <div className="recent-trip-info">
          <strong>
            {trip.destination || "Untitled trip"}
          </strong>

          <span>
            {trip.duration || "Trip"} ·{" "}
            {trip.date || "Recently planned"}
          </span>
        </div>

        <div className="recent-trip-right">
          <b>
            {trip.budget || "₹0"}
          </b>

          <div className="recent-trip-actions">
            {onViewTrip && (
              <button
                type="button"
                className="recent-view-button"
                onClick={() =>
                  onViewTrip(trip)
                }
              >
                View trip →
              </button>
            )}

            {onEditTrip && (
              <button
                type="button"
                className="recent-edit-button"
                onClick={() =>
                  onEditTrip(trip)
                }
              >
                Edit
              </button>
            )}

            {onDeleteTrip && (
              <button
                type="button"
                className="recent-delete-button"
                onClick={handleDelete}
                disabled={trip.isDeleting}
                aria-label={`Delete ${
                  trip.destination || "trip"
                }`}
              >
                {trip.isDeleting
                  ? "..."
                  : "×"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // UPCOMING / CURRENT TRIP CARD
  // --------------------------------------------------

  return (
    <section className="upcoming-card">
      <div className="upcoming-image">
        <img
          src={trip.image}
          alt={
            trip.destination || "Trip"
          }
        />

        <span>
          {trip.status || "UPCOMING"}
        </span>
      </div>

      <div className="upcoming-content">
        <div className="section-kicker">
          {trip.label ||
            "NEXT ADVENTURE"}
        </div>

        <h2>
          {trip.destination ||
            "Untitled trip"}

          {trip.country
            ? `, ${trip.country}`
            : ""}
        </h2>

        <p>
          {trip.duration || "Trip"} ·{" "}
          {trip.travelers || 0} travellers ·{" "}
          {trip.style ||
            "Balanced experience"}
        </p>

        <div className="trip-meta">
          <div>
            <span>DATES</span>

            <strong>
              {trip.date ||
                "Recently planned"}
            </strong>
          </div>

          <div>
            <span>BUDGET</span>

            <strong>
              {trip.budget || "₹0"}
            </strong>
          </div>

          <div>
            <span>STATUS</span>

            <strong className="status-ready">
              {trip.planningStatus ||
                "Planning"}
            </strong>
          </div>
        </div>

        <div className="trip-actions">
          {onViewTrip && (
            <button
              type="button"
              onClick={() =>
                onViewTrip(trip)
              }
            >
              View trip →
            </button>
          )}

          {onEditTrip && (
            <button
              type="button"
              onClick={() =>
                onEditTrip(trip)
              }
            >
              Edit
            </button>
          )}

          {onTrackTrip && (
            <button
              type="button"
              onClick={() =>
                onTrackTrip(trip)
              }
            >
              Track
            </button>
          )}

          {onDeleteTrip && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={trip.isDeleting}
            >
              {trip.isDeleting
                ? "Deleting..."
                : "Delete"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default TripCard;