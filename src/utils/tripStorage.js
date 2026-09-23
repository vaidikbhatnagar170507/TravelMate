const TRIP_STORAGE_KEY = "travelmateTrip";

export const DEFAULT_BUDGET_ALLOCATION = {
  Accommodation: 0.36,
  Transport: 0.28,
  Food: 0.18,
  Activities: 0.12,
  Other: 0.06,
};

export function createDefaultBudget(budget) {
  const total = Number(budget) || 0;

  return {
    Accommodation: Math.round(
      total * DEFAULT_BUDGET_ALLOCATION.Accommodation
    ),
    Transport: Math.round(
      total * DEFAULT_BUDGET_ALLOCATION.Transport
    ),
    Food: Math.round(
      total * DEFAULT_BUDGET_ALLOCATION.Food
    ),
    Activities: Math.round(
      total * DEFAULT_BUDGET_ALLOCATION.Activities
    ),
    Other: Math.round(
      total * DEFAULT_BUDGET_ALLOCATION.Other
    ),
  };
}

export function getStoredTrip() {
  const storedTrip =
    localStorage.getItem(TRIP_STORAGE_KEY);

  if (!storedTrip) {
    return null;
  }

  try {
    return JSON.parse(storedTrip);
  } catch {
    localStorage.removeItem(TRIP_STORAGE_KEY);
    return null;
  }
}

export function saveTrip(trip) {
  localStorage.setItem(
    TRIP_STORAGE_KEY,
    JSON.stringify(trip)
  );

  return trip;
}

export function removeStoredTrip() {
  localStorage.removeItem(TRIP_STORAGE_KEY);
}

export function updateStoredTrip(updater) {
  const currentTrip = getStoredTrip();

  if (!currentTrip) {
    return null;
  }

  const updatedTrip =
    typeof updater === "function"
      ? updater(currentTrip)
      : {
          ...currentTrip,
          ...updater,
        };

  saveTrip(updatedTrip);

  return updatedTrip;
}

export function createBudgetForTotal(
  budget,
  existingBudgetPlan = null
) {
  const total = Number(budget) || 0;

  if (
    existingBudgetPlan &&
    typeof existingBudgetPlan === "object"
  ) {
    const currentTotal =
      Object.values(existingBudgetPlan).reduce(
        (sum, value) =>
          sum + (Number(value) || 0),
        0
      );

    if (currentTotal === total) {
      return {
        Accommodation:
          Number(
            existingBudgetPlan.Accommodation
          ) || 0,

        Transport:
          Number(
            existingBudgetPlan.Transport
          ) || 0,

        Food:
          Number(
            existingBudgetPlan.Food
          ) || 0,

        Activities:
          Number(
            existingBudgetPlan.Activities
          ) || 0,

        Other:
          Number(
            existingBudgetPlan.Other
          ) || 0,
      };
    }
  }

  return createDefaultBudget(total);
}