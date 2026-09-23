import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";

function Reminders() {
  const [eventType, setEventType] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // REMINDERS LIST
  // =========================

  const [reminders, setReminders] = useState([]);
  const [loadingReminders, setLoadingReminders] =
    useState(true);
  const [remindersError, setRemindersError] =
    useState("");

  const [updatingReminderId, setUpdatingReminderId] =
    useState(null);

  const [deletingReminderId, setDeletingReminderId] =
    useState(null);

  // =========================
  // LOAD REMINDERS
  // =========================

  const loadReminders = async () => {
    try {
      setLoadingReminders(true);
      setRemindersError("");

      const response = await apiRequest(
        "/api/reminders"
      );

      setReminders(
        Array.isArray(response.reminders)
          ? response.reminders
          : []
      );
    } catch (error) {
      console.error(
        "Load reminders error:",
        error
      );

      setRemindersError(
        error.message ||
          "Unable to load your reminders."
      );
    } finally {
      setLoadingReminders(false);
    }
  };

  // =========================
  // LOAD ON PAGE OPEN
  // =========================

  useEffect(() => {
    loadReminders();
  }, []);

  // =========================
  // SAVE REMINDER
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !eventType.trim() ||
      !title.trim() ||
      !date ||
      !time
    ) {
      setError(
        "Please fill in all required fields."
      );

      return;
    }

    try {
      setSaving(true);

      const response = await apiRequest(
        "/api/reminders",
        {
          method: "POST",

          body: JSON.stringify({
            eventType:
              eventType.trim(),

            title:
              title.trim(),

            date,

            time,

            note:
              note.trim(),
          }),
        }
      );

      console.log(
        "Reminder saved:",
        response.reminder
      );

      setMessage(
        "Reminder saved successfully."
      );

      setEventType("");
      setTitle("");
      setDate("");
      setTime("");
      setNote("");

      await loadReminders();
    } catch (error) {
      console.error(
        "Save reminder error:",
        error
      );

      setError(
        error.message ||
          "Unable to save reminder."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // UPDATE COMPLETED STATUS
  // =========================

  const handleToggleComplete = async (
    reminder
  ) => {
    try {
      setUpdatingReminderId(
        reminder.id
      );

      setRemindersError("");

      const newCompletedStatus =
        !reminder.completed;

      const response =
        await apiRequest(
          `/api/reminders/${reminder.id}`,
          {
            method: "PUT",

            body: JSON.stringify({
              completed:
                newCompletedStatus,
            }),
          }
        );

      console.log(
        "Reminder updated:",
        response.reminder
      );

      setReminders(
        (currentReminders) =>
          currentReminders.map(
            (item) =>
              item.id === reminder.id
                ? {
                    ...item,
                    completed:
                      newCompletedStatus,
                    updatedAt:
                      response
                        .reminder
                        ?.updatedAt ||
                      item.updatedAt,
                  }
                : item
          )
      );
    } catch (error) {
      console.error(
        "Update reminder error:",
        error
      );

      setRemindersError(
        error.message ||
          "Unable to update your reminder."
      );
    } finally {
      setUpdatingReminderId(null);
    }
  };

  // =========================
  // DELETE REMINDER
  // =========================

  const handleDeleteReminder = async (
    reminder
  ) => {
    const shouldDelete =
      window.confirm(
        `Delete "${reminder.title}" permanently?`
      );

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingReminderId(
        reminder.id
      );

      setRemindersError("");

      await apiRequest(
        `/api/reminders/${reminder.id}`,
        {
          method: "DELETE",
        }
      );

      console.log(
        "Reminder deleted:",
        reminder.id
      );

      setReminders(
        (currentReminders) =>
          currentReminders.filter(
            (item) =>
              item.id !== reminder.id
          )
      );
    } catch (error) {
      console.error(
        "Delete reminder error:",
        error
      );

      setRemindersError(
        error.message ||
          "Unable to delete your reminder."
      );
    } finally {
      setDeletingReminderId(null);
    }
  };

  return (
    <div className="app inner-page">

      <main className="section reminders-page">

        {/* =========================
            PAGE HEADER
        ========================== */}

        <div className="reminders-header">
          <div className="section-kicker">
            PERSONAL REMINDERS
          </div>

          <h1>
            Stay on <em>schedule.</em>
          </h1>

          <p>
            Create reminders for anything important during your journey.
            TravelMate will keep them organized in one place.
          </p>
        </div>

        {/* =========================
            REMINDER FORM
        ========================== */}

        <section className="reminder-form-card">

          <div className="reminder-form-heading">
            <div className="section-kicker">
              NEW REMINDER
            </div>

            <h2>
              What do you want to remember?
            </h2>

            <p>
              Add the details now and save your reminder permanently.
            </p>
          </div>

          <form
            className="reminder-form"
            onSubmit={handleSubmit}
          >

            <div className="reminder-form-grid">

              {/* EVENT TYPE */}

              <label>
                Event Type

                <input
                  type="text"
                  value={eventType}
                  onChange={(event) =>
                    setEventType(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Flight, Hotel, Activity"
                  required
                />
              </label>

              {/* TITLE */}

              <label>
                Title

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Check-in for flight"
                  required
                />
              </label>

              {/* DATE */}

              <label>
                Date

                <input
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(
                      event.target.value
                    )
                  }
                  required
                />
              </label>

              {/* TIME */}

              <label>
                Time

                <input
                  type="time"
                  value={time}
                  onChange={(event) =>
                    setTime(
                      event.target.value
                    )
                  }
                  required
                />
              </label>

            </div>

            {/* NOTE */}

            <label>
              Note / Description{" "}
              <span style={{ opacity: 0.55 }}>
                (Optional)
              </span>

              <textarea
                value={note}
                onChange={(event) =>
                  setNote(
                    event.target.value
                  )
                }
                placeholder="Add any extra details..."
                rows={4}
              />
            </label>

            {/* STATUS */}

            {message && (
              <div className="reminder-success">
                {message}
              </div>
            )}

            {error && (
              <div className="reminder-error">
                {error}
              </div>
            )}

            {/* ACTION */}

            <div className="reminder-form-actions">

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Reminder"}

                {!saving && (
                  <span>→</span>
                )}
              </button>

            </div>

          </form>

        </section>

        {/* =========================
            SAVED REMINDERS
        ========================== */}

        <section className="reminders-list-section">

          <div className="reminders-list-heading">
            <div className="section-kicker">
              YOUR REMINDERS
            </div>

            <h2>
              Upcoming reminders
            </h2>
          </div>

          {/* LOADING */}

          {loadingReminders && (
            <div className="reminders-list-status">
              Loading your reminders...
            </div>
          )}

          {/* ERROR */}

          {!loadingReminders &&
            remindersError && (
              <div className="reminder-error">
                {remindersError}
              </div>
            )}

          {/* EMPTY */}

          {!loadingReminders &&
            !remindersError &&
            reminders.length === 0 && (
              <div className="reminders-list-status">
                No reminders saved yet.
              </div>
            )}

          {/* LIST */}

          {!loadingReminders &&
            !remindersError &&
            reminders.length > 0 && (
              <div className="reminders-list">

                {reminders.map(
                  (reminder) => (
                    <article
                      className={`reminder-card ${
                        reminder.completed
                          ? "completed"
                          : ""
                      }`}
                      key={reminder.id}
                    >

                      <div className="reminder-card-main">

                        <div className="reminder-card-type">
                          {reminder.eventType}
                        </div>

                        <h3>
                          {reminder.title}
                        </h3>

                        {reminder.note && (
                          <p>
                            {reminder.note}
                          </p>
                        )}

                      </div>

                      <div className="reminder-card-meta">

                        <div>
                          <strong>
                            {reminder.date}
                          </strong>
                        </div>

                        <div>
                          {reminder.time}
                        </div>

                        {/* ACTIONS */}

                        <div className="reminder-card-actions">

                          {/* COMPLETE */}

                          <button
                            type="button"
                            className={`reminder-complete-button ${
                              reminder.completed
                                ? "completed"
                                : ""
                            }`}
                            onClick={() =>
                              handleToggleComplete(
                                reminder
                              )
                            }
                            disabled={
                              updatingReminderId ===
                                reminder.id ||
                              deletingReminderId ===
                                reminder.id
                            }
                          >
                            {updatingReminderId ===
                            reminder.id
                              ? "Updating..."
                              : reminder.completed
                                ? "✓ Completed"
                                : "Mark complete"}
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            className="reminder-delete-button"
                            onClick={() =>
                              handleDeleteReminder(
                                reminder
                              )
                            }
                            disabled={
                              updatingReminderId ===
                                reminder.id ||
                              deletingReminderId ===
                                reminder.id
                            }
                            aria-label={`Delete ${reminder.title}`}
                          >
                            {deletingReminderId ===
                            reminder.id
                              ? "Deleting..."
                              : "🗑 Delete"}
                          </button>

                        </div>

                      </div>

                    </article>
                  )
                )}

              </div>
            )}

        </section>

      </main>
    </div>
  );
}

export default Reminders;