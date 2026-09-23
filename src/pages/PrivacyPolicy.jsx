import { useNavigate } from "react-router-dom";

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <main className="privacy-page">
      <div className="privacy-page-container">

        {/* HEADER */}
        <section className="privacy-header">
          <button
            type="button"
            className="privacy-back-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <div className="privacy-icon">
            🔒
          </div>

          <h1>Privacy Policy</h1>

          <p>
            How TravelMate handles and protects your information.
          </p>

          <span className="privacy-updated">
            Last updated: September 2026
          </span>
        </section>

        {/* INTRODUCTION */}
        <section className="privacy-card">
          <h2>1. Introduction</h2>

          <p>
            TravelMate respects your privacy and is committed to
            protecting the information you provide while using the
            application.
          </p>

          <p>
            This Privacy Policy explains what information TravelMate
            may collect, how that information is used, and the choices
            available to you.
          </p>
        </section>

        {/* INFORMATION */}
        <section className="privacy-card">
          <h2>2. Information We Collect</h2>

          <p>
            When you create and use a TravelMate account, the
            application may handle the following information:
          </p>

          <ul>
            <li>
              <strong>Account information:</strong> Your email address
              and authentication information.
            </li>

            <li>
              <strong>Trip information:</strong> Destinations,
              itineraries, travel plans and related trip details that
              you save in the application.
            </li>

            <li>
              <strong>Budget information:</strong> Travel budget and
              expense-related information that you choose to store.
            </li>

            <li>
              <strong>Reminder information:</strong> Travel reminders
              and related details created by you.
            </li>
          </ul>
        </section>

        {/* USE */}
        <section className="privacy-card">
          <h2>3. How We Use Your Information</h2>

          <p>
            Information handled by TravelMate may be used to:
          </p>

          <ul>
            <li>Provide and maintain TravelMate features.</li>
            <li>Save and display your trips and travel plans.</li>
            <li>Provide personalized travel planning features.</li>
            <li>Manage reminders and related travel information.</li>
            <li>Authenticate and secure your account.</li>
            <li>Improve the application's functionality and experience.</li>
          </ul>
        </section>

        {/* AI */}
        <section className="privacy-card">
          <h2>4. AI-Powered Features</h2>

          <p>
            TravelMate provides AI-powered travel planning features.
            Information required to generate an itinerary may be
            processed by the service used to provide these features.
          </p>

          <p>
            TravelMate does not display the underlying AI provider
            directly within the application interface.
          </p>
        </section>

        {/* FIREBASE */}
        <section className="privacy-card">
          <h2>5. Data Storage and Security</h2>

          <p>
            TravelMate uses Firebase services for account
            authentication and cloud data storage.
          </p>

          <p>
            Reasonable technical measures are used to protect account
            and application data. However, no method of electronic
            storage or transmission can be guaranteed to be completely
            secure.
          </p>
        </section>

        {/* SHARING */}
        <section className="privacy-card">
          <h2>6. Sharing of Information</h2>

          <p>
            TravelMate does not sell your personal information.
          </p>

          <p>
            Information may be processed by third-party services when
            required to provide specific application functionality,
            such as authentication, cloud storage or AI-powered
            features.
          </p>
        </section>

        {/* RETENTION */}
        <section className="privacy-card">
          <h2>7. Data Retention</h2>

          <p>
            Your account and saved application data may remain stored
            while your TravelMate account is active.
          </p>

          <p>
            You may request deletion of your account and associated
            application data through the account deletion option
            provided in TravelMate.
          </p>
        </section>

        {/* DELETE */}
        <section className="privacy-card privacy-delete-card">
          <h2>8. Account Deletion</h2>

          <p>
            You can request permanent deletion of your TravelMate
            account and associated data from the account section of
            the application.
          </p>

          <p>
            Account deletion is intended to permanently remove your
            TravelMate account and associated stored application data,
            subject to any information that may be required to be
            retained by law.
          </p>
        </section>

        {/* CHILDREN */}
        <section className="privacy-card">
          <h2>9. Children's Privacy</h2>

          <p>
            TravelMate is not specifically designed for children.
            Users should provide information only when they are
            permitted to use the application under applicable laws and
            platform requirements.
          </p>
        </section>

        {/* CHANGES */}
        <section className="privacy-card">
          <h2>10. Changes to This Policy</h2>

          <p>
            This Privacy Policy may be updated from time to time as
            TravelMate develops new features or changes how information
            is handled.
          </p>

          <p>
            Any updated version will be made available through
            TravelMate.
          </p>
        </section>

        {/* CONTACT */}
        <section className="privacy-card">
          <h2>11. Contact</h2>

          <p>
            If you have questions or concerns regarding this Privacy
            Policy or your personal data, you can contact the
            TravelMate developer.
          </p>

          <p>
            <strong>Developer:</strong> Vaidik Bhatnagar
          </p>
        </section>

        {/* FOOTER */}
        <footer className="privacy-footer">
          <p>
            © {new Date().getFullYear()} TravelMate
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
          >
            Back to TravelMate
          </button>
        </footer>

      </div>
    </main>
  );
}

export default PrivacyPolicy;