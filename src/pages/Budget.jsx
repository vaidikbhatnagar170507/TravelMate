import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";

import {
  createDefaultBudget,
  getStoredTrip,
} from "../utils/tripStorage";

function Budget() {
  const navigate = useNavigate();

  const [trip, setTrip] =
    useState(null);

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

  const totalBudget = Number(
    trip?.budget || 50000
  );

  const travellers = Number(
    trip?.travellers || 2
  );

  const days = Number(
    trip?.days || 5
  );

  const destination =
    trip?.destination ||
    "Bali";

  const expenses =
    Array.isArray(trip?.expenses)
      ? trip.expenses
      : [];

  const budgetCategories =
    useMemo(() => {
      if (
        trip?.budgetPlan &&
        typeof trip.budgetPlan ===
          "object"
      ) {
        const plan = {
          Accommodation:
            Number(
              trip.budgetPlan
                .Accommodation
            ) || 0,

          Transport:
            Number(
              trip.budgetPlan
                .Transport
            ) || 0,

          Food:
            Number(
              trip.budgetPlan.Food
            ) || 0,

          Activities:
            Number(
              trip.budgetPlan
                .Activities
            ) || 0,

          Other:
            Number(
              trip.budgetPlan.Other
            ) || 0,
        };

        const planTotal =
          Object.values(
            plan
          ).reduce(
            (sum, value) =>
              sum + value,
            0
          );

        if (
          planTotal === totalBudget
        ) {
          return plan;
        }
      }

      return createDefaultBudget(
        totalBudget
      );
    }, [trip, totalBudget]);

  const categorySpent =
    useMemo(() => {
      const result = {
        Accommodation: 0,
        Transport: 0,
        Food: 0,
        Activities: 0,
        Other: 0,
      };

      expenses.forEach(
        (expense) => {
          const category =
            expense.category ||
            "Other";

          if (
            Object.prototype.hasOwnProperty.call(
              result,
              category
            )
          ) {
            result[category] +=
              Number(
                expense.amount
              ) || 0;
          } else {
            result.Other +=
              Number(
                expense.amount
              ) || 0;
          }
        }
      );

      return result;
    }, [expenses]);

  const totalSpent =
    expenses.reduce(
      (sum, expense) =>
        sum +
        (Number(
          expense.amount
        ) || 0),
      0
    );

  const remainingBudget =
    totalBudget -
    totalSpent;

  const spentPercentage =
    totalBudget > 0
      ? Math.min(
          100,
          Math.round(
            (totalSpent /
              totalBudget) *
              100
          )
        )
      : 0;

  const formatCurrency = (
    value
  ) =>
    `₹${Math.max(
      0,
      Number(value) || 0
    ).toLocaleString(
      "en-IN"
    )}`;

  const categoryList = [
    {
      name: "Accommodation",
      icon: "🏨",
      description:
        "Hotels, stays and accommodation",
    },
    {
      name: "Transport",
      icon: "🚕",
      description:
        "Flights, trains, cabs and local travel",
    },
    {
      name: "Food",
      icon: "🍽️",
      description:
        "Meals, cafes and dining",
    },
    {
      name: "Activities",
      icon: "🎟️",
      description:
        "Tours, tickets and experiences",
    },
    {
      name: "Other",
      icon: "✦",
      description:
        "Shopping, documents and miscellaneous",
    },
  ];

  const getCategoryPercentage = (
    category
  ) => {
    if (!totalBudget) {
      return 0;
    }

    return Math.round(
      (budgetCategories[
        category
      ] /
        totalBudget) *
        100
    );
  };

  const getSpentPercentage = (
    category
  ) => {
    const planned =
      budgetCategories[
        category
      ] || 0;

    if (!planned) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (categorySpent[
          category
        ] /
          planned) *
          100
      )
    );
  };

  const handleAdjustTrip = () => {
    if (trip) {
      navigate("/planner", {
        state: {
          destination:
            trip.destination,

          travellers:
            trip.travellers,

          days:
            trip.days,

          budget:
            trip.budget,

          style:
            trip.style,

          generated: true,

          trip,
        },
      });

      return;
    }

    navigate("/planner");
  };

  const budgetMessage =
    totalSpent === 0
      ? "You haven't recorded any expenses yet."
      : remainingBudget >= 0
      ? `You have ${formatCurrency(
          remainingBudget
        )} remaining from your planned budget.`
      : `You're ${formatCurrency(
          Math.abs(
            remainingBudget
          )
        )} over your planned budget.`;

  return (
    <div className="app inner-page">

      <main className="section dashboard-page">

        <div className="page-heading-row">

          <div>

            <div className="section-kicker">
              TRAVEL FINANCES
            </div>

            <h1>
              Smart <em>Budget.</em>
            </h1>

            <p>
              Know what your trip costs
              before you leave.
            </p>

          </div>

          <button
            className="primary-button"
            type="button"
            onClick={
              handleAdjustTrip
            }
          >
            Adjust trip
          </button>

        </div>

        <section className="budget-overview">

          <div className="budget-total">

            <span>
              TOTAL PLANNED BUDGET
            </span>

            <strong>
              {formatCurrency(
                totalBudget
              )}
            </strong>

            <small>
              {trip
                ? `${destination} · ${travellers} travellers · ${days} days`
                : "Sample trip · 2 travellers · 5 days"}
            </small>

            <div className="budget-progress">

              <div
                style={{
                  width: `${spentPercentage}%`,
                }}
              />

            </div>

            <p>
              {budgetMessage}
            </p>

          </div>

          <div className="budget-breakdown">

            {categoryList.map(
              (category) => {
                const planned =
                  budgetCategories[
                    category.name
                  ];

                const spent =
                  categorySpent[
                    category.name
                  ];

                return (
                  <div
                    key={
                      category.name
                    }
                  >

                    <div className="budget-category-title">

                      <span>
                        {
                          category.icon
                        }{" "}
                        {
                          category.name
                        }
                      </span>

                      <strong>
                        {formatCurrency(
                          planned
                        )}
                      </strong>

                    </div>

                    <small className="budget-category-description">
                      {
                        category.description
                      }
                    </small>

                    <div>

                      <i
                        style={{
                          width: `${getCategoryPercentage(
                            category.name
                          )}%`,
                        }}
                      />

                    </div>

                    <small className="budget-category-spent">

                      {spent > 0
                        ? `${formatCurrency(
                            spent
                          )} spent · ${getSpentPercentage(
                            category.name
                          )}% of category`
                        : "No expenses recorded yet"}

                    </small>

                  </div>
                );
              }
            )}

          </div>

        </section>

        <section className="budget-stats-grid">

          <div className="budget-stat-card">

            <span>
              PLANNED
            </span>

            <strong>
              {formatCurrency(
                totalBudget
              )}
            </strong>

            <small>
              Your trip budget
            </small>

          </div>

          <div className="budget-stat-card">

            <span>
              SPENT
            </span>

            <strong>
              {formatCurrency(
                totalSpent
              )}
            </strong>

            <small>
              Recorded expenses
            </small>

          </div>

          <div
            className={`budget-stat-card ${
              remainingBudget <
              0
                ? "over-budget"
                : ""
            }`}
          >

            <span>
              {remainingBudget <
              0
                ? "OVER BUDGET"
                : "REMAINING"}
            </span>

            <strong>
              {remainingBudget <
              0
                ? `-${formatCurrency(
                    Math.abs(
                      remainingBudget
                    )
                  )}`
                : formatCurrency(
                    remainingBudget
                  )}
            </strong>

            <small>
              {spentPercentage}%
              of budget used
            </small>

          </div>

        </section>

        <section className="budget-tips">

          <div className="tip-icon">
            ✦
          </div>

          <div>

            <div className="section-kicker">
              TRAVELMATE INSIGHT
            </div>

            {totalSpent ===
            0 ? (
              <>
                <strong>
                  Your budget is
                  ready to use.
                </strong>

                <p>
                  Add expenses from
                  Trip Details as you
                  book hotels,
                  transport, food and
                  activities. TravelMate
                  will keep your
                  remaining budget
                  updated automatically.
                </p>
              </>
            ) : remainingBudget >=
              0 ? (
              <>
                <strong>
                  You're within your
                  planned budget.
                </strong>

                <p>
                  You have{" "}
                  {formatCurrency(
                    remainingBudget
                  )}{" "}
                  left to spend across
                  your remaining trip
                  plans.
                </p>
              </>
            ) : (
              <>
                <strong>
                  Your trip is over
                  budget.
                </strong>

                <p>
                  Review your expenses
                  in Trip Details and
                  consider adjusting
                  accommodation,
                  transport or
                  activities.
                </p>
              </>
            )}

          </div>

        </section>

        {trip && (
          <section className="budget-page-actions">

            <button
              className="secondary-button"
              type="button"
              onClick={() =>
                navigate(
                  "/trip-details"
                )
              }
            >
              View Trip Details →
            </button>

            <button
              className="secondary-button"
              type="button"
              onClick={() =>
                navigate(
                  "/my-trips"
                )
              }
            >
              My Trips →
            </button>

          </section>
        )}

      </main>

    </div>
  );
}

export default Budget;