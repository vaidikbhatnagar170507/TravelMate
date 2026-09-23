import { useNavigate } from "react-router-dom";

function About() {
  const navigate = useNavigate();

  return (
    <main className="about-page">
      <div className="about-page-container">

        {/* HEADER */}
        <section className="about-hero">
          <button
            type="button"
            className="about-back-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <div className="about-logo">
            ✈
          </div>

          <h1>
            Travel<span>Mate</span>
          </h1>

          <p className="about-tagline">
            Plan smarter. Travel better.
          </p>

          <span className="about-version">
            Version 1.0.0
          </span>
        </section>

        {/* ABOUT */}
        <section className="about-card">
          <h2>About TravelMate</h2>

          <p>
            TravelMate is a smart travel planning application designed
            to make planning and managing trips simple, organized and
            enjoyable.
          </p>

          <p>
            From discovering destinations and creating personalized
            itineraries to managing budgets, trips and reminders,
            TravelMate brings your travel planning experience together
            in one place.
          </p>
        </section>

        {/* FEATURES */}
        <section className="about-card">
          <h2>What you can do</h2>

          <div className="about-feature-list">

            <div className="about-feature-item">
              <span>✦</span>
              <div>
                <h3>Plan Trips</h3>
                <p>Create personalized travel itineraries.</p>
              </div>
            </div>

            <div className="about-feature-item">
              <span>◉</span>
              <div>
                <h3>Discover Places</h3>
                <p>Explore destinations and find places to visit.</p>
              </div>
            </div>

            <div className="about-feature-item">
              <span>₹</span>
              <div>
                <h3>Manage Your Budget</h3>
                <p>Keep track of your planned travel expenses.</p>
              </div>
            </div>

            <div className="about-feature-item">
              <span>♧</span>
              <div>
                <h3>Travel Reminders</h3>
                <p>Keep important trip reminders organized.</p>
              </div>
            </div>

            <div className="about-feature-item">
              <span>✈</span>
              <div>
                <h3>My Trips</h3>
                <p>Save and manage your planned journeys.</p>
              </div>
            </div>

          </div>
        </section>

        {/* AI */}
        <section className="about-card about-ai-card">
          <div className="about-ai-icon">
            ✦
          </div>

          <div>
            <h2>TravelMate AI</h2>

            <p>
              TravelMate includes AI-powered features that help
              simplify trip planning and create useful travel
              itineraries based on your requirements.
            </p>
          </div>
        </section>

        {/* DEVELOPER */}
        <section className="about-card">
          <h2>Developer</h2>

          <div className="about-developer">
            <div className="about-developer-avatar">
              V
            </div>

            <div>
              <h3>Vaidik Bhatnagar</h3>
              <p>Developer & Creator of TravelMate</p>
            </div>
          </div>
        </section>

        {/* LINKS */}
        <section className="about-links">

          <button
            type="button"
            onClick={() => navigate("/privacy-policy")}
          >
            Privacy Policy
            <span>→</span>
          </button>

        </section>

        {/* FOOTER */}
        <footer className="about-footer">
          <p>
            © {new Date().getFullYear()} TravelMate
          </p>

          <p>
            Made for better journeys.
          </p>
        </footer>

      </div>
    </main>
  );
}

export default About;