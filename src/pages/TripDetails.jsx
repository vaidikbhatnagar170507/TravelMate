import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { apiRequest } from "../utils/api";
import "./TripDetails.css";

const DEFAULT_CHECKLIST = [
  { id: "passport", label: "Passport / ID ready", completed: false },
  { id: "tickets", label: "Travel tickets confirmed", completed: false },
  { id: "stay", label: "Accommodation confirmed", completed: false },
  { id: "documents", label: "Important documents saved", completed: false },
  { id: "packing", label: "Packing completed", completed: false },
];

const fallbackTrip = {
  destination: "Bali",
  country: "Indonesia",
  emoji: "🌴",
  travellers: 2,
  days: 5,
  budget: 50000,
  style: "Balanced",
  summary: "A 5-day balanced trip to Bali for 2 travellers.",
  daysPlan: [
    {
      day: 1,
      title: "Arrival in Bali",
      dateLabel: "Day 1",
      description: "Arrive in Bali, settle in and enjoy a relaxed evening.",
      activities: [
        {
          id: "fallback-1",
          name: "Airport pickup",
          time: "09:00",
          description: "Transfer from the airport to your accommodation.",
        },
        {
          id: "fallback-2",
          name: "Hotel check-in",
          time: "13:00",
          description: "Check in and take some time to relax.",
        },
        {
          id: "fallback-3",
          name: "Sunset dinner",
          time: "18:00",
          description: "Enjoy your first evening with a local dinner.",
        },
      ],
    },
  ],
};

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getTripDays(startDate, endDate, fallbackDays = 1) {
  if (!startDate || !endDate) {
    return Math.max(Number(fallbackDays) || 1, 1);
  }

  const start = new Date(`${String(startDate).slice(0, 10)}T00:00:00`);
  const end = new Date(`${String(endDate).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return Math.max(Number(fallbackDays) || 1, 1);
  }

  const difference = Math.round((end - start) / 86400000) + 1;
  return difference > 0 ? difference : Math.max(Number(fallbackDays) || 1, 1);
}

function createDefaultBudget(budget) {
  const total = Number(budget) || 0;
  const accommodation = Math.round(total * 0.36);
  const transport = Math.round(total * 0.28);
  const food = Math.round(total * 0.18);
  const activities = Math.round(total * 0.12);

  return {
    Accommodation: accommodation,
    Transport: transport,
    Food: food,
    Activities: activities,
    Other: total - accommodation - transport - food - activities,
  };
}

function normalizeBudgetPlan(budget, budgetPlan) {
  const total = Number(budget) || 0;

  if (budgetPlan && typeof budgetPlan === "object") {
    const normalized = {
      Accommodation: Number(budgetPlan.Accommodation || budgetPlan.accommodation || 0),
      Transport: Number(budgetPlan.Transport || budgetPlan.transport || 0),
      Food: Number(budgetPlan.Food || budgetPlan.food || 0),
      Activities: Number(budgetPlan.Activities || budgetPlan.activities || 0),
      Other: Number(budgetPlan.Other || budgetPlan.other || 0),
    };

    const planTotal = Object.values(normalized).reduce(
      (sum, value) => sum + (Number(value) || 0),
      0
    );

    if (planTotal === total) {
      return normalized;
    }
  }

  return createDefaultBudget(total);
}

function normalizeTrip(rawTrip) {
  const merged = {
    ...fallbackTrip,
    ...(rawTrip || {}),
  };

  const budget = Number(merged.budget) || 50000;
  const days = getTripDays(merged.startDate, merged.endDate, merged.days);

  return {
    ...merged,
    travellers: Number(merged.travellers) || 1,
    days,
    budget,
    daysPlan: Array.isArray(merged.daysPlan) ? merged.daysPlan : [],
    checklist: Array.isArray(merged.checklist)
      ? merged.checklist
      : DEFAULT_CHECKLIST.map((item) => ({ ...item })),
    budgetPlan: normalizeBudgetPlan(budget, merged.budgetPlan),
    hotelRecommendations: Array.isArray(merged.hotelRecommendations)
      ? merged.hotelRecommendations
      : [],
  };
}

function getStoredTrip() {
  const stored = localStorage.getItem("travelmateTrip");

  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem("travelmateTrip");
    return null;
  }
}

function saveStoredTrip(trip) {
  localStorage.setItem("travelmateTrip", JSON.stringify(trip));
}

function TripDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const cloudSaveQueueRef = useRef(Promise.resolve());

  const [trip, setTrip] = useState(() => normalizeTrip(fallbackTrip));
  const [activeTab, setActiveTab] = useState("itinerary");
  const [openDay, setOpenDay] = useState(1);

  const [editingActivity, setEditingActivity] = useState(null);
  const [editName, setEditName] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [addingToDay, setAddingToDay] = useState(null);
  const [newName, setNewName] = useState("");
  const [newTime, setNewTime] = useState("10:00");
  const [newDescription, setNewDescription] = useState("");

  const [checklistInput, setChecklistInput] = useState("");

  const [selectedStay, setSelectedStay] = useState(null);
  const [stayLoading, setStayLoading] = useState(false);
  const [stayError, setStayError] = useState("");
  const [showAddStay, setShowAddStay] = useState(false);
  const [completionSaving, setCompletionSaving] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadTrip = async () => {
      const selectedTrip = location.state?.trip;

      if (selectedTrip && typeof selectedTrip === "object") {
        const normalized = normalizeTrip(selectedTrip);
        setTrip(normalized);
        setSelectedStay(normalized.selectedStay?.name || null);

        if (normalized.id) {
          localStorage.setItem("travelmateCurrentTripId", String(normalized.id));
        }
      }

      const currentTripId = localStorage.getItem("travelmateCurrentTripId");

      if (currentTripId) {
        try {
          const response = await apiRequest(`/api/trips/${currentTripId}`);
          const cloudTrip = response?.trip;

          if (cloudTrip && !cancelled) {
            const normalized = normalizeTrip(cloudTrip);
            saveStoredTrip(normalized);
            setTrip(normalized);
            setSelectedStay(normalized.selectedStay?.name || null);
            setOpenDay((current) => {
              const firstDay = normalized.daysPlan?.[0]?.day;
              return firstDay ?? current;
            });
            return;
          }
        } catch (error) {
          console.error("Unable to load selected trip from cloud:", error);
        }
      }

      const storedTrip = getStoredTrip();

      if (storedTrip && !cancelled) {
        const normalized = normalizeTrip(storedTrip);
        setTrip(normalized);
        setSelectedStay(normalized.selectedStay?.name || null);
        setOpenDay((current) => normalized.daysPlan?.[0]?.day ?? current);
      }
    };

    loadTrip();

    return () => {
      cancelled = true;
    };
  }, [location.state?.trip]);

  const persistTrip = (updatedTrip) => {
    const normalized = normalizeTrip(updatedTrip);

    setTrip(normalized);
    saveStoredTrip(normalized);

    if (normalized.id) {
      localStorage.setItem("travelmateCurrentTripId", String(normalized.id));
    } else {
      return;
    }

    cloudSaveQueueRef.current = cloudSaveQueueRef.current
      .catch(() => {})
      .then(async () => {
        try {
          await apiRequest(`/api/trips/${normalized.id}`, {
            method: "PUT",
            body: JSON.stringify({ trip: normalized }),
          });
        } catch (error) {
          console.error("Unable to save Trip Details changes:", error);
        }
      });
  };

  const completedChecklist = trip.checklist.filter((item) => item.completed).length;
  const planningProgress = trip.checklist.length
    ? Math.round((completedChecklist / trip.checklist.length) * 100)
    : 0;

  const stayRecommendations = Array.isArray(trip.hotelRecommendations)
    ? trip.hotelRecommendations
    : [];

  const expenses = Array.isArray(trip.expenses) ? trip.expenses : [];
  const totalSpent = expenses.reduce(
    (sum, expense) => sum + (Number(expense?.amount) || 0),
    0
  );
  const remainingBudget = Number(trip.budget || 0) - totalSpent;
  const spentPercentage = Number(trip.budget) > 0 ? Math.min((totalSpent / Number(trip.budget)) * 100, 100) : 0;

  const accommodationBudget = Number(trip.budgetPlan?.Accommodation || 0);
  const estimatedNightlyBudget =
    accommodationBudget / Math.max(Number(trip.days) || 1, 1);

  const addExpense = (event) => {
    event.preventDefault();

    const name = expenseName.trim();
    const amount = Number(expenseAmount);

    if (!name || !Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const expense = {
      id: `${Date.now()}-${Math.random()}`,
      name,
      amount,
      date: expenseDate || new Date().toISOString().slice(0, 10),
    };

    persistTrip({
      ...trip,
      expenses: [...expenses, expense],
    });

    setExpenseName("");
    setExpenseAmount("");
    setExpenseDate("");
    setShowExpenseForm(false);
  };

  const deleteExpense = (expenseId) => {
    persistTrip({
      ...trip,
      expenses: expenses.filter((expense) => expense.id !== expenseId),
    });
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setStayError("");
    setShowAddStay(false);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const startEditing = (dayNumber, activity) => {
    setEditingActivity({ dayNumber, activityId: activity.id });
    setEditName(activity.name || "");
    setEditTime(activity.time || "");
    setEditDescription(activity.description || "");
  };

  const cancelEditing = () => {
    setEditingActivity(null);
    setEditName("");
    setEditTime("");
    setEditDescription("");
  };

  const saveEditedActivity = () => {
    if (!editingActivity || !editName.trim()) return;

    const updatedDays = trip.daysPlan.map((day) => {
      if (day.day !== editingActivity.dayNumber) return day;

      return {
        ...day,
        activities: (day.activities || []).map((activity) =>
          activity.id === editingActivity.activityId
            ? {
                ...activity,
                name: editName.trim(),
                time: editTime,
                description: editDescription.trim(),
              }
            : activity
        ),
      };
    });

    persistTrip({ ...trip, daysPlan: updatedDays });
    cancelEditing();
  };

  const deleteActivity = (dayNumber, activityId) => {
    if (!window.confirm("Delete this activity?")) return;

    const updatedDays = trip.daysPlan.map((day) =>
      day.day === dayNumber
        ? {
            ...day,
            activities: (day.activities || []).filter(
              (activity) => activity.id !== activityId
            ),
          }
        : day
    );

    persistTrip({ ...trip, daysPlan: updatedDays });
  };

  const openAddActivity = (dayNumber) => {
    setAddingToDay(dayNumber);
    setNewName("");
    setNewTime("10:00");
    setNewDescription("");
  };

  const cancelAddActivity = () => {
    setAddingToDay(null);
    setNewName("");
    setNewTime("10:00");
    setNewDescription("");
  };

  const addActivity = () => {
    if (!addingToDay || !newName.trim()) return;

    const updatedDays = trip.daysPlan.map((day) =>
      day.day === addingToDay
        ? {
            ...day,
            activities: [
              ...(day.activities || []),
              {
                id: `${Date.now()}-${Math.random()}`,
                name: newName.trim(),
                time: newTime,
                description:
                  newDescription.trim() ||
                  "Custom activity added to your itinerary.",
              },
            ],
          }
        : day
    );

    persistTrip({ ...trip, daysPlan: updatedDays });
    cancelAddActivity();
  };

  const toggleChecklist = (id) => {
    persistTrip({
      ...trip,
      checklist: trip.checklist.map((item) =>
        item.id === id
          ? { ...item, completed: !item.completed }
          : item
      ),
    });
  };

  const addChecklistItem = (event) => {
    event.preventDefault();
    if (!checklistInput.trim()) return;

    persistTrip({
      ...trip,
      checklist: [
        ...trip.checklist,
        {
          id: `${Date.now()}-${Math.random()}`,
          label: checklistInput.trim(),
          completed: false,
        },
      ],
    });

    setChecklistInput("");
  };

  const deleteChecklistItem = (id) => {
    persistTrip({
      ...trip,
      checklist: trip.checklist.filter((item) => item.id !== id),
    });
  };

  useEffect(() => {
    if (activeTab !== "stays" && !showAddStay) return undefined;

    const destination = String(trip.destination || "").trim();
    if (!destination) return undefined;

    if (
      stayRecommendations.length > 0 &&
      trip.hotelRecommendationsDestination === destination &&
      Number(trip.hotelRecommendationsBudget) === accommodationBudget &&
      Number(trip.hotelRecommendationsDays) === Number(trip.days)
    ) {
      return undefined;
    }

    const controller = new AbortController();

    const fetchHotels = async () => {
      setStayLoading(true);
      setStayError("");

      try {
        const response = await fetch("http://localhost:5000/api/hotels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination,
            country: trip.country,
            days: trip.days,
            travellers: trip.travellers,
            style: trip.style,
            totalBudget: trip.budget,
            accommodationBudget,
            estimatedNightlyBudget,
          }),
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Could not load hotel recommendations.");
        }

        const hotels = Array.isArray(data?.hotels) ? data.hotels : [];

        if (!hotels.length) {
          throw new Error("No suitable hotel recommendations were found.");
        }

        persistTrip({
          ...trip,
          hotelRecommendations: hotels,
          hotelRecommendationsDestination: destination,
          hotelRecommendationsBudget: accommodationBudget,
          hotelRecommendationsDays: Number(trip.days) || 1,
        });
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error("Hotel recommendation error:", error);
        setStayError(error?.message || "Could not load hotel recommendations.");
      } finally {
        if (!controller.signal.aborted) setStayLoading(false);
      }
    };

    fetchHotels();
    return () => controller.abort();
  }, [
    activeTab,
    showAddStay,
    trip.destination,
    trip.country,
    trip.days,
    trip.travellers,
    trip.style,
    trip.budget,
    trip.hotelRecommendationsDestination,
    trip.hotelRecommendationsBudget,
    trip.hotelRecommendationsDays,
    accommodationBudget,
    estimatedNightlyBudget,
    stayRecommendations.length,
  ]);

  const browseStay = (stay) => {
    const query = `${stay?.name || "hotels"} ${trip.destination}`;
    const url =
      stay?.sourceUrl ||
      stay?.bookingUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const saveRecommendedStay = (stay) => {
    if (!stay) return;

    const stayId = `${Date.now()}-${Math.random()}`;
    const stayName = `Stay at ${stay.name}`;
    const priceText = stay.priceRange || stay.priceNote || "Check current rates";
    const stayDescription = `${stay.area || ""}${stay.area ? " · " : ""}${priceText}${
      stay.tag ? ` · ${stay.tag}` : ""
    }`;

    const dayCount = trip.daysPlan.length;

    const updatedDays = trip.daysPlan.map((day, index) => {
      const isFirstDay = index === 0;
      const isLastDay = index === dayCount - 1;

      if (!isFirstDay && !isLastDay) return day;

      const cleanedActivities = (day.activities || []).filter((activity) => {
        const name = String(activity.name || "").trim();
        return !name.toLowerCase().startsWith("stay at ") &&
          !(isFirstDay && /check[- ]?in/i.test(name) && /hotel/i.test(name)) &&
          !(isLastDay && /check[- ]?out/i.test(name) && /hotel/i.test(name));
      });

      return {
        ...day,
        activities: [
          ...cleanedActivities,
          {
            id: `${stayId}-${day.day}`,
            name: stayName,
            time: isFirstDay ? "13:00" : "11:00",
            description: isFirstDay
              ? `Check in at ${stay.name}. ${stayDescription}`
              : `Check out from ${stay.name}. ${stayDescription}`,
          },
        ],
      };
    });

    persistTrip({
      ...trip,
      daysPlan: updatedDays,
      selectedStay: {
        name: stay.name,
        rating: stay.rating || null,
        area: stay.area || "",
        priceRange: priceText,
        sourceUrl: stay.sourceUrl || stay.bookingUrl || null,
      },
    });

    setSelectedStay(stay.name);
    setShowAddStay(false);
  };

  const completeTrip = async () => {
    if (!trip.id || completionSaving) return;

    try {
      setCompletionSaving(true);

      const completedAt = new Date().toISOString();
      const updatedTrip = {
        ...trip,
        status: "COMPLETED",
        completed: true,
        completedAt,
      };

      const response = await apiRequest(`/api/trips/${encodeURIComponent(trip.id)}`, {
        method: "PUT",
        body: JSON.stringify({ trip: updatedTrip }),
      });

      const savedTrip = normalizeTrip(response?.trip || updatedTrip);
      setTrip(savedTrip);
      saveStoredTrip(savedTrip);
      setActiveTab("complete");
    } catch (error) {
      console.error("Unable to complete trip:", error);
      window.alert(error?.message || "Could not mark this trip as completed.");
    } finally {
      setCompletionSaving(false);
    }
  };

  const renderBudget = () => (
    <section className="tm-trip-panel tm-budget-panel">
      <div className="tm-panel-heading">
        <div>
          <span className="tm-kicker">TRIP BUDGET</span>
          <h2>Manage your <em>expenses.</em></h2>
          <p>Add expenses as you spend. Nothing is allocated into categories.</p>
        </div>
      </div>
      <div className="tm-budget-overview-grid">
        <div><span>TOTAL BUDGET</span><strong>{formatCurrency(trip.budget)}</strong></div>
        <div><span>TOTAL SPENT</span><strong>{formatCurrency(totalSpent)}</strong></div>
        <div className={remainingBudget < 0 ? "is-over" : ""}>
          <span>{remainingBudget < 0 ? "OVER BUDGET" : "REMAINING"}</span>
          <strong>{formatCurrency(Math.abs(remainingBudget))}</strong>
        </div>
      </div>
      <div className="tm-budget-progress"><div style={{ width: `${spentPercentage}%` }} /></div>
      <button type="button" className="tm-add-expense-button" onClick={() => setShowExpenseForm((current) => !current)}>+ Add expense</button>
      {showExpenseForm && (
        <form className="tm-expense-form" onSubmit={addExpense}>
          <input value={expenseName} onChange={(event) => setExpenseName(event.target.value)} placeholder="Expense name" required />
          <input type="number" min="1" step="1" value={expenseAmount} onChange={(event) => setExpenseAmount(event.target.value)} placeholder="Amount (₹)" required />
          <input type="date" value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} />
          <div className="tm-expense-form-actions">
            <button type="submit">Save expense</button>
            <button type="button" onClick={() => setShowExpenseForm(false)}>Cancel</button>
          </div>
        </form>
      )}
      {expenses.length > 0 ? (
        <div className="tm-expense-list">
          {expenses.map((expense) => (
            <div className="tm-expense-item" key={expense.id}>
              <div><strong>{expense.name}</strong><small>{expense.date || "No date"}</small></div>
              <div className="tm-expense-item-right">
                <strong>{formatCurrency(expense.amount)}</strong>
                <button type="button" onClick={() => deleteExpense(expense.id)} aria-label={`Delete ${expense.name}`}>×</button>
              </div>
            </div>
          ))}
        </div>
      ) : <div className="tm-no-expenses">No expenses added yet.</div>}
    </section>
  );

  const renderComplete = () => (
    <section className="tm-trip-panel tm-complete-panel">
      <div className="tm-complete-icon">✓</div>
      <span className="tm-kicker">TRIP COMPLETE</span>
      <h2>{trip.completed ? "Trip marked as completed." : "Finished with your trip?"}</h2>
      <p>
        {trip.completed
          ? "This trip is now marked as completed and will appear in your Completed trips."
          : "Mark this trip as completed when your journey is finished. You can still keep the trip in your history."}
      </p>

      {!trip.completed ? (
        <button
          type="button"
          className="tm-complete-button"
          onClick={completeTrip}
          disabled={completionSaving}
        >
          {completionSaving ? "Saving..." : "Mark trip as completed"}
        </button>
      ) : (
        <button
          type="button"
          className="tm-complete-button"
          onClick={() => navigate("/my-trips")}
        >
          Back to Completed Trips →
        </button>
      )}
    </section>
  );

  const renderItinerary = () => (
    <section className="tm-trip-panel">
      <div className="tm-panel-heading">
        <div>
          <span className="tm-kicker">ITINERARY</span>
          <h2>Your trip, <em>day by day.</em></h2>
          <p>Open one day at a time to view or adjust your plan.</p>
        </div>
        <div className="tm-day-count">
          <strong>{trip.daysPlan.length}</strong>
          <span>days</span>
        </div>
      </div>

      <div className="tm-day-list">
        {trip.daysPlan.map((day) => {
          const isOpen = openDay === day.day;
          const activities = Array.isArray(day.activities) ? day.activities : [];

          return (
            <article className={`tm-day ${isOpen ? "is-open" : ""}`} key={day.day}>
              <button
                type="button"
                className="tm-day-header"
                onClick={() => setOpenDay(isOpen ? null : day.day)}
                aria-expanded={isOpen}
              >
                <div className="tm-day-number">
                  <span>DAY</span>
                  <strong>{String(day.day).padStart(2, "0")}</strong>
                </div>
                <div className="tm-day-title">
                  <span>{day.dateLabel || `Day ${day.day}`}</span>
                  <h3>{day.title || `Day ${day.day}`}</h3>
                  <small>{activities.length} {activities.length === 1 ? "activity" : "activities"}</small>
                </div>
                <span className="tm-day-chevron">{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen && (
                <div className="tm-day-body">
                  {day.description ? (
                    <p className="tm-day-description">{day.description}</p>
                  ) : null}

                  <div className="tm-activity-list">
                    {activities.map((activity) => {
                      const isEditing =
                        editingActivity?.dayNumber === day.day &&
                        editingActivity?.activityId === activity.id;

                      if (isEditing) {
                        return (
                          <div className="tm-edit-box" key={activity.id}>
                            <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Activity name" />
                            <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
                            <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description" />
                            <div className="tm-edit-actions">
                              <button type="button" onClick={saveEditedActivity}>Save</button>
                              <button type="button" onClick={cancelEditing}>Cancel</button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="tm-activity" key={activity.id}>
                          <div className="tm-activity-time">{activity.time || "Flexible"}</div>
                          <div className="tm-activity-info">
                            <strong>{activity.name}</strong>
                            {activity.description ? <p>{activity.description}</p> : null}
                          </div>
                          <div className="tm-activity-actions">
                            <button type="button" onClick={() => startEditing(day.day, activity)} aria-label="Edit activity">✎</button>
                            <button type="button" onClick={() => deleteActivity(day.day, activity.id)} aria-label="Delete activity">×</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {addingToDay === day.day ? (
                    <div className="tm-add-box">
                      <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Activity name" autoFocus />
                      <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                      <input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Short description" />
                      <div className="tm-edit-actions">
                        <button type="button" onClick={addActivity}>Add activity</button>
                        <button type="button" onClick={cancelAddActivity}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="tm-itinerary-actions">
                      <button type="button" onClick={() => openAddActivity(day.day)}>+ Add activity</button>
                      <button type="button" onClick={() => { setShowAddStay(true); setStayError(""); }}>+ Add stay</button>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {showAddStay && (
        <div className="tm-modal-backdrop" role="presentation">
          <div className="tm-modal" role="dialog" aria-modal="true" aria-label="Choose a stay">
            <button type="button" className="tm-modal-close" onClick={() => setShowAddStay(false)} aria-label="Close">×</button>
            <span className="tm-kicker">ADD A STAY</span>
            <h3>Choose your <em>stay.</em></h3>
            <p>Pick a recommendation and TravelMate will add it to the first and last day.</p>

            {stayLoading && <div className="tm-state">Finding suitable stays...</div>}
            {!stayLoading && stayError && (
              <div className="tm-state tm-error">
                <strong>Couldn’t load stays</strong>
                <p>{stayError}</p>
                <button type="button" onClick={() => { setShowAddStay(false); changeTab("stays"); }}>Open Stays</button>
              </div>
            )}
            {!stayLoading && !stayError && stayRecommendations.length === 0 && (
              <div className="tm-state">
                <strong>No stays available yet.</strong>
                <button type="button" onClick={() => { setShowAddStay(false); changeTab("stays"); }}>Open Stays</button>
              </div>
            )}
            {!stayLoading && !stayError && stayRecommendations.length > 0 && (
              <div className="tm-modal-stays">
                {stayRecommendations.slice(0, 5).map((stay, index) => (
                  <article className="tm-modal-stay" key={`${stay.name}-${index}`}>
                    <div>
                      <strong>{stay.name}</strong>
                      <small>★ {stay.rating || "—"}{stay.area ? ` · ${stay.area}` : ""}</small>
                      <span>{stay.priceRange || stay.priceNote || "Check current rates"}</span>
                    </div>
                    <button type="button" onClick={() => saveRecommendedStay(stay)}>
                      {selectedStay === stay.name ? "✓ Selected" : "Select"}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );

  const renderStays = () => (
    <section className="tm-trip-panel">
      <div className="tm-panel-heading tm-stay-heading">
        <div>
          <span className="tm-kicker">STAYS</span>
          <h2>Find your <em>stay.</em></h2>
          <p>Current hotel recommendations matched to your trip budget.</p>
        </div>
        <div className="tm-stay-budget">
          <span>ACCOMMODATION</span>
          <strong>{formatCurrency(accommodationBudget)}</strong>
          <small>≈ {formatCurrency(estimatedNightlyBudget)} / night</small>
        </div>
      </div>

      <div className="tm-stay-meta">
        <div><span>DESTINATION</span><strong>{trip.destination}{trip.country ? `, ${trip.country}` : ""}</strong></div>
        <div><span>TRIP</span><strong>{trip.days} days · {trip.travellers} travellers</strong></div>
      </div>

      {stayLoading && <div className="tm-state">Finding the best stays for {trip.destination}...</div>}

      {!stayLoading && stayError && (
        <div className="tm-state tm-error">
          <strong>Couldn’t load stays</strong>
          <p>{stayError}</p>
          <button type="button" onClick={() => setTrip((current) => ({ ...current, hotelRecommendations: [], hotelRecommendationsDestination: "", hotelRecommendationsBudget: 0, hotelRecommendationsDays: 0 }))}>Try again</button>
        </div>
      )}

      {!stayLoading && !stayError && stayRecommendations.length > 0 && (
        <div className="tm-stay-grid">
          {stayRecommendations.map((stay, index) => (
            <article className="tm-stay-card" key={`${stay.name}-${index}`}>
              <div className="tm-stay-card-top">
                <span>#{stay.rank || index + 1}</span>
                <small>{stay.tag || "Budget match"}</small>
              </div>
              <h3>{stay.name}</h3>
              <div className="tm-stay-rating">★ {stay.rating || "—"}{stay.ratingCount ? ` · ${stay.ratingCount} reviews` : ""}</div>
              {stay.area ? <div className="tm-stay-area">📍 {stay.area}</div> : null}
              <strong>{stay.priceRange || stay.priceNote || "Check current rates"}</strong>
              {stay.description ? <p>{stay.description}</p> : null}
              <div className="tm-stay-actions">
                <button type="button" onClick={() => browseStay(stay)}>View hotel →</button>
                <button type="button" className="is-primary" onClick={() => saveRecommendedStay(stay)}>
                  {selectedStay === stay.name ? "✓ Selected" : "Select stay"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!stayLoading && !stayError && stayRecommendations.length === 0 && (
        <div className="tm-state">No stay recommendations are available yet.</div>
      )}

      <p className="tm-disclaimer">Hotel prices and availability can change. Verify the final rate before booking.</p>
    </section>
  );

  const renderChecklist = () => (
    <section className="tm-trip-panel">
      <div className="tm-panel-heading">
        <div>
          <span className="tm-kicker">CHECKLIST</span>
          <h2>Ready for <em>departure.</em></h2>
          <p>Keep the important preparation tasks in one place.</p>
        </div>
        <div className="tm-check-progress">
          <strong>{planningProgress}%</strong>
          <span>complete</span>
        </div>
      </div>

      <div className="tm-progress-track"><div style={{ width: `${planningProgress}%` }} /></div>

      <div className="tm-checklist">
        {trip.checklist.map((item) => (
          <div className={`tm-check-item ${item.completed ? "is-complete" : ""}`} key={item.id}>
            <button type="button" className="tm-check-button" onClick={() => toggleChecklist(item.id)} aria-label={`Mark ${item.label}`}>
              {item.completed ? "✓" : ""}
            </button>
            <span>{item.label}</span>
            <button type="button" className="tm-check-delete" onClick={() => deleteChecklistItem(item.id)} aria-label="Delete checklist item">×</button>
          </div>
        ))}
      </div>

      <form className="tm-check-add" onSubmit={addChecklistItem}>
        <input value={checklistInput} onChange={(e) => setChecklistInput(e.target.value)} placeholder="Add a checklist item..." />
        <button type="submit">Add</button>
      </form>
    </section>
  );

  return (
    <main className="tm-trip-page">
      <div className="tm-trip-shell">
        <button className="tm-back" type="button" onClick={() => navigate("/my-trips")}>← Back to My Trips</button>

        <header className="tm-trip-header">
          <div className="tm-trip-visual">
            <span>{trip.emoji || "✈️"}</span>
            <small>{trip.country || ""}</small>
          </div>

          <div className="tm-trip-intro">
            <span className="tm-kicker">YOUR TRIP</span>
            <h1>{trip.destination}<em>.</em></h1>
            <p className="tm-location">📍 {trip.country}</p>
            {trip.summary ? <p>{trip.summary}</p> : null}
            {trip.startDate && trip.endDate ? (
              <div className="tm-date-range">
                {String(trip.startDate).slice(0, 10)} → {String(trip.endDate).slice(0, 10)}
              </div>
            ) : null}
          </div>
        </header>

        <section className="tm-trip-summary">
          <div><span>DURATION</span><strong>{trip.days} days</strong></div>
          <div><span>TRAVELLERS</span><strong>{trip.travellers} people</strong></div>
          <div>
            <span>BUDGET</span>
            <strong>{formatCurrency(trip.budget)}</strong>
          </div>
          <div><span>STYLE</span><strong>{trip.style}</strong></div>
        </section>

        <nav className="tm-trip-tabs" aria-label="Trip sections">
          {[
            ["itinerary", "Itinerary"],
            ["stays", "Stays"],
            ["checklist", "Checklist"],
            ["budget", "Budget"],
            ["complete", "Complete"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`${activeTab === value ? "active" : ""} ${value === "complete" ? "tm-complete-tab" : ""}`}
              onClick={() => changeTab(value)}
            >
              {label}
            </button>
          ))}
        </nav>

        {activeTab === "itinerary" && renderItinerary()}
        {activeTab === "stays" && renderStays()}
        {activeTab === "checklist" && renderChecklist()}
        {activeTab === "budget" && renderBudget()}
        {activeTab === "complete" && renderComplete()}
      </div>
    </main>
  );
}

export default TripDetails;
