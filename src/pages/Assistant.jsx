import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../utils/api";

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

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString(
    "en-IN"
  )}`;
}

function getTripContext(trip) {
  if (!trip) {
    return null;
  }

  const daysPlan = Array.isArray(
    trip.daysPlan
  )
    ? trip.daysPlan
    : [];

  const expenses = Array.isArray(
    trip.expenses
  )
    ? trip.expenses
    : [];

  const checklist = Array.isArray(
    trip.checklist
  )
    ? trip.checklist
    : [];

  const savedPlaces = Array.isArray(
    trip.savedPlaces
  )
    ? trip.savedPlaces
    : [];

  const totalSpent =
    expenses.reduce(
      (total, expense) =>
        total +
        Number(
          expense.amount || 0
        ),
      0
    );

  const remainingBudget =
    Number(trip.budget || 0) -
    totalSpent;

  const completedChecklist =
    checklist.filter(
      (item) => item.completed
    ).length;

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

  return {
    destination:
      trip.destination ||
      "your destination",

    country:
      trip.country || "",

    days:
      Number(trip.days) || 0,

    travellers:
      Number(trip.travellers) || 0,

    budget:
      Number(trip.budget) || 0,

    style:
      trip.style || "Balanced",

    daysPlan,

    expenses,

    checklist,

    savedPlaces,

    totalSpent,

    remainingBudget,

    completedChecklist,

    totalChecklist:
      checklist.length,

    totalActivities,
  };
}

async function askTravelMate(
  message,
  context
) {
  const data =
    await apiRequest(
      "/api/assistant",
      {
        method: "POST",

        body: JSON.stringify({
          message,
          tripContext: context,
        }),
      }
    );

  if (!data?.reply) {
    throw new Error(
      "TravelMate AI returned an empty response."
    );
  }

  return data.reply;
}

function Assistant() {
  const [input, setInput] =
    useState("");

  const [trip, setTrip] =
    useState(null);

  const [messages, setMessages] =
    useState([
      {
        type: "ai",
        text: "Hey! I'm your TravelMate AI. Tell me what you'd like to know about your journey.",
      },
    ]);

  const [isTyping, setIsTyping] =
    useState(false);

  useEffect(() => {
    const loadTrip = () => {
      setTrip(
        getStoredTrip()
      );
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

  const context = useMemo(
    () =>
      getTripContext(trip),
    [trip]
  );

  const sendMessage = async (
    event
  ) => {
    event.preventDefault();

    const text =
      input.trim();

    if (!text || isTyping) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        type: "user",
        text,
      },
    ]);

    setInput("");
    setIsTyping(true);

    try {
      const response =
        await askTravelMate(
          text,
          context
        );

      setMessages((current) => [
        ...current,
        {
          type: "ai",
          text: response,
        },
      ]);
    } catch (error) {
      console.error(
        "TravelMate AI error:",
        error
      );

      setMessages((current) => [
        ...current,
        {
          type: "ai",
          text:
            error?.message ||
            "Sorry, I couldn't connect to TravelMate AI right now. Please make sure the TravelMate server is running.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = context
    ? [
        "Where am I going?",
        "What is my remaining budget?",
        "What is my plan for Day 3?",
        "Show my saved places",
      ]
    : [
        "Plan 5 days in Bali",
        "Help me save money",
        "What should I do in Jaipur?",
      ];

  const handleSuggestion = (
    suggestion
  ) => {
    setInput(suggestion);
  };

  return (
    <div className="app inner-page assistant-page">

      <main className="assistant-shell section">

        <div className="assistant-header">

          <div>
            <div className="section-kicker">
              YOUR TRAVEL COMPANION
            </div>

            <h1>
              Meet{" "}
              <em>
                TravelMate AI.
              </em>
            </h1>

            <p>
              Ask anything about your next
              journey.
            </p>
          </div>

          <div className="ai-status">
            <span />

            {context
              ? "Trip connected"
              : "AI online"}
          </div>

        </div>

        {context && (
          <div className="assistant-trip-context">

            <div>
              <span>
                CURRENT TRIP
              </span>

              <strong>
                {
                  context.destination
                }
              </strong>

              <small>
                {context.country}
              </small>
            </div>

            <div>
              <span>
                DURATION
              </span>

              <strong>
                {context.days} days
              </strong>
            </div>

            <div>
              <span>
                TRAVELLERS
              </span>

              <strong>
                {
                  context.travellers
                }
              </strong>
            </div>

            <div>
              <span>
                BUDGET
              </span>

              <strong>
                {formatCurrency(
                  context.budget
                )}
              </strong>
            </div>

            <div>
              <span>
                REMAINING
              </span>

              <strong>
                {formatCurrency(
                  context.remainingBudget
                )}
              </strong>
            </div>

          </div>
        )}

        <div className="chat-window">

          <div className="chat-messages">

            {messages.map(
              (
                message,
                index
              ) => (
                <div
                  className={`message ${message.type}`}
                  key={`${message.type}-${index}`}
                >

                  {message.type ===
                    "ai" && (
                    <div className="message-avatar">
                      ✦
                    </div>
                  )}

                  <div className="message-bubble">
                    {
                      message.text
                    }
                  </div>

                </div>
              )
            )}

            {isTyping && (
              <div className="message ai">

                <div className="message-avatar">
                  ✦
                </div>

                <div className="message-bubble assistant-typing">
                  <span />
                  <span />
                  <span />
                </div>

              </div>
            )}

          </div>

          <div className="suggestion-row">

            {suggestions.map(
              (
                suggestion
              ) => (
                <button
                  key={
                    suggestion
                  }
                  type="button"
                  onClick={() =>
                    handleSuggestion(
                      suggestion
                    )
                  }
                  disabled={
                    isTyping
                  }
                >
                  {
                    suggestion
                  }
                </button>
              )
            )}

          </div>

          <form
            className="chat-input"
            onSubmit={
              sendMessage
            }
          >

            <input
              value={input}
              onChange={(
                event
              ) =>
                setInput(
                  event.target
                    .value
                )
              }
              placeholder={
                context
                  ? "Ask about your trip..."
                  : "Ask TravelMate anything..."
              }
              disabled={
                isTyping
              }
            />

            <button
              type="submit"
              disabled={
                isTyping ||
                !input.trim()
              }
              aria-label="Send message"
            >
              →
            </button>

          </form>

        </div>

      </main>

    </div>
  );
}

export default Assistant;