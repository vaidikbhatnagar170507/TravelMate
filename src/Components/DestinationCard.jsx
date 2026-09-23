function DestinationCard({
  destination,
  isFavourite,
  onFavourite,
  onPlanTrip,
}) {
  const priceValue = String(
    destination.price ?? ""
  ).replace(/[₹,\s]/g, "");

  const formattedPrice = Number(
    priceValue
  ).toLocaleString("en-IN");

  return (
    <article className="destination-card">
      <div className="destination-image">
        <img
          src={destination.image}
          alt={destination.name}
        />

        <span className="destination-tag">
          {destination.category ||
            destination.tag}
        </span>

        <button
          className={`heart-button ${
            isFavourite ? "liked" : ""
          }`}
          type="button"
          onClick={() =>
            onFavourite(destination.id)
          }
          aria-label={
            isFavourite
              ? `Remove ${destination.name} from favourites`
              : `Add ${destination.name} to favourites`
          }
        >
          {isFavourite ? "♥" : "♡"}
        </button>
      </div>

      <div className="destination-info">
        <div className="destination-main-info">
          <h3>{destination.name}</h3>

          <p>
            ◎ {destination.country}
          </p>

          <div className="destination-rating-inline">
            <span>★</span>
            {destination.rating}
          </div>
        </div>

        <div className="destination-price">
          <small>From</small>

          <strong>
            ₹{formattedPrice}
          </strong>

          <span>/ person</span>
        </div>
      </div>

      <button
        className="card-plan-button"
        type="button"
        onClick={() =>
          onPlanTrip(destination)
        }
      >
        <span>Plan Trip</span>
        <span>→</span>
      </button>
    </article>
  );
}

export default DestinationCard;