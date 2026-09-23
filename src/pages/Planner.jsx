import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  createBudgetForTotal,
  saveTrip,
} from "../utils/tripStorage";

import { apiRequest } from "../utils/api";

import "./PlannerAccordion.css";

const getTodayInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeDateInputValue = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    const dateOnly = value.split("T")[0];

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      return dateOnly;
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateForInput = (value) =>
  normalizeDateInputValue(value);

const addDaysToDateInput = (dateValue, daysToAdd) => {
  const normalized = normalizeDateInputValue(dateValue);

  if (!normalized) {
    return "";
  }

  const [year, month, day] = normalized
    .split("-")
    .map(Number);

  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + daysToAdd);

  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");

  return `${nextYear}-${nextMonth}-${nextDay}`;
};

const calculateTripDays = (startValue, endValue) => {
  const start = normalizeDateInputValue(startValue);
  const end = normalizeDateInputValue(endValue);

  if (!start || !end) {
    return 0;
  }

  const [startYear, startMonth, startDay] = start
    .split("-")
    .map(Number);

  const [endYear, endMonth, endDay] = end
    .split("-")
    .map(Number);

  const startUtc = Date.UTC(
    startYear,
    startMonth - 1,
    startDay
  );

  const endUtc = Date.UTC(
    endYear,
    endMonth - 1,
    endDay
  );

  const difference = Math.round(
    (endUtc - startUtc) / (1000 * 60 * 60 * 24)
  );

  return difference >= 0 ? difference + 1 : 0;
};

function Planner() {
  const location = useLocation();
  const navigate = useNavigate();

  const initial = location.state || {};

  const MIN_BUDGET = 5000;
  const MAX_BUDGET = 5000000;

  const initialTrip = initial.trip || null;

  const destinationLocked =
    initial.lockedDestination === true;

  const [openItineraryDay, setOpenItineraryDay] =
    useState(initialTrip?.daysPlan?.[0]?.day || null);

  const [showAllItineraryDays, setShowAllItineraryDays] =
    useState(false);

  const initialBudget = Number(
    initial.budget ||
      initialTrip?.budget ||
      50000
  );

  const [destination, setDestination] = useState(
    initial.destination ||
      initialTrip?.destination ||
      "Bali"
  );

  const [travellers, setTravellers] = useState(
    Number(
      initial.travellers ||
        initialTrip?.travellers ||
        2
    )
  );

  const initialDays = Number(
    initial.days ||
      initialTrip?.days ||
      5
  );

  const initialStartDate =
    normalizeDateInputValue(
      initial.startDate ||
        initialTrip?.startDate ||
        initialTrip?.fromDate
    ) || getTodayInputValue();

  const initialEndDate =
    normalizeDateInputValue(
      initial.endDate ||
        initialTrip?.endDate ||
        initialTrip?.toDate
    ) ||
    addDaysToDateInput(
      initialStartDate,
      Math.max(0, initialDays - 1)
    );

  const [startDate, setStartDate] =
    useState(initialStartDate);

  const [endDate, setEndDate] =
    useState(initialEndDate);

  const days = calculateTripDays(
    startDate,
    endDate
  );

  const [budget, setBudget] =
    useState(initialBudget);

  const [budgetInput, setBudgetInput] =
    useState(String(initialBudget));

  const [style, setStyle] = useState(
    initial.style ||
      initialTrip?.style ||
      "Balanced"
  );

  const [generatedTrip, setGeneratedTrip] =
    useState(initialTrip || null);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showPlannerStayForm, setShowPlannerStayForm] =
    useState(false);

  const [plannerStayDay, setPlannerStayDay] =
    useState(null);

  const [plannerStayFrom, setPlannerStayFrom] =
    useState("");

  const [plannerStayTo, setPlannerStayTo] =
    useState("");

  const [plannerStayAddress, setPlannerStayAddress] =
    useState("");

  const [plannerStaySuggestions, setPlannerStaySuggestions] =
    useState([]);

  const [plannerStaySuggestionsLoading, setPlannerStaySuggestionsLoading] =
    useState(false);

  const [showPlannerStaySuggestions, setShowPlannerStaySuggestions] =
    useState(false);

  const plannerStayRequestRef =
    useRef(0);

  const plannerStayWrapperRef =
    useRef(null);

  // ---------------------------------------------------------
  // AUTO SCROLL TO GENERATED ITINERARY
  // ---------------------------------------------------------

  const itinerarySectionRef =
    useRef(null);

  useEffect(() => {
    if (!generatedTrip || loading) {
      return;
    }

    if (!generatedTrip.daysPlan?.length) {
      return;
    }

    const timer = setTimeout(() => {
      itinerarySectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [generatedTrip, loading]);

  // ---------------------------------------------------------
  // STAY / HOTEL AUTOCOMPLETE
  // ---------------------------------------------------------

  useEffect(() => {
    const query = plannerStayAddress.trim();

    if (!showPlannerStayForm || query.length < 2) {
      setPlannerStaySuggestions([]);
      setPlannerStaySuggestionsLoading(false);
      return undefined;
    }

    const requestId =
      plannerStayRequestRef.current + 1;

    plannerStayRequestRef.current = requestId;

    const timer = setTimeout(async () => {
      try {
        setPlannerStaySuggestionsLoading(true);

        const searchQuery = [
          query,
          destination,
        ]
          .filter(Boolean)
          .join(", ");

        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(
            searchQuery
          )}&limit=8&lang=en`
        );

        if (!response.ok) {
          throw new Error(
            "Unable to search stays."
          );
        }

        const data = await response.json();

        if (
          requestId !==
          plannerStayRequestRef.current
        ) {
          return;
        }

        const features = Array.isArray(
          data?.features
        )
          ? data.features
          : [];

        const suggestions = features
          .map((feature) => {
            const properties =
              feature?.properties || {};

            const name =
              properties.name ||
              properties.street ||
              properties.city ||
              "";

            const streetParts = [
              properties.housenumber,
              properties.street,
            ].filter(Boolean);

            const area =
              properties.city ||
              properties.district ||
              properties.state ||
              "";

            const country =
              properties.country || "";

            const addressParts = [
              streetParts.join(" "),
              area,
              country,
            ].filter(Boolean);

            if (
              !name &&
              !addressParts.length
            ) {
              return null;
            }

            const isHotel =
              String(
                properties.osm_key || ""
              ).toLowerCase() ===
                "tourism" &&
              String(
                properties.osm_value || ""
              ).toLowerCase() ===
                "hotel";

            return {
              id:
                properties.osm_id ||
                `${name}-${addressParts.join(
                  "-"
                )}`,
              name,
              address:
                addressParts.join(", "),
              label:
                addressParts.length &&
                name !== addressParts[0]
                  ? `${name}, ${addressParts.join(
                      ", "
                    )}`
                  : name ||
                    addressParts.join(", "),
              isHotel,
            };
          })
          .filter(Boolean)
          .sort(
            (a, b) =>
              Number(b.isHotel) -
              Number(a.isHotel)
          )
          .filter(
            (item, index, array) =>
              index ===
              array.findIndex(
                (other) =>
                  other.label === item.label
              )
          )
          .slice(0, 6);

        setPlannerStaySuggestions(
          suggestions
        );
      } catch (suggestionError) {
        console.error(
          "Stay search error:",
          suggestionError
        );

        if (
          requestId ===
          plannerStayRequestRef.current
        ) {
          setPlannerStaySuggestions([]);
        }
      } finally {
        if (
          requestId ===
          plannerStayRequestRef.current
        ) {
          setPlannerStaySuggestionsLoading(
            false
          );
        }
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [
    plannerStayAddress,
    destination,
    showPlannerStayForm,
  ]);

  useEffect(() => {
    const handleStayOutsideClick =
      (event) => {
        if (
          plannerStayWrapperRef.current &&
          !plannerStayWrapperRef.current.contains(
            event.target
          )
        ) {
          setShowPlannerStaySuggestions(
            false
          );
        }
      };

    document.addEventListener(
      "mousedown",
      handleStayOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleStayOutsideClick
      );
    };
  }, []);

  const selectPlannerStaySuggestion =
    (suggestion) => {
      setPlannerStayAddress(
        suggestion.label ||
          suggestion.address ||
          ""
      );

      setPlannerStaySuggestions([]);
      setShowPlannerStaySuggestions(false);
      setError("");
    };

  // ---------------------------------------------------------
  // DESTINATION AUTOCOMPLETE
  // ---------------------------------------------------------

  const [
    destinationSuggestions,
    setDestinationSuggestions,
  ] = useState([]);

  const [
    destinationLoading,
    setDestinationLoading,
  ] = useState(false);

  const [
    showDestinationSuggestions,
    setShowDestinationSuggestions,
  ] = useState(false);

  const destinationRequestRef =
    useRef(0);

  const destinationWrapperRef =
    useRef(null);

  useEffect(() => {
    if (destinationLocked) {
      setDestinationSuggestions([]);
      setDestinationLoading(false);
      return undefined;
    }

    const query = destination.trim();

    if (query.length < 2) {
      setDestinationSuggestions([]);
      setDestinationLoading(false);
      return;
    }

    const requestId =
      destinationRequestRef.current + 1;

    destinationRequestRef.current =
      requestId;

    const timer = setTimeout(async () => {
      try {
        setDestinationLoading(true);

        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(
            query
          )}&limit=8&lang=en`
        );

        if (!response.ok) {
          throw new Error(
            "Unable to search destinations."
          );
        }

        const data = await response.json();

        if (
          requestId !==
          destinationRequestRef.current
        ) {
          return;
        }

        const features = Array.isArray(
          data?.features
        )
          ? data.features
          : [];

        const formattedSuggestions =
          features
            .map((feature) => {
              const properties =
                feature?.properties || {};

              const city =
                properties.city ||
                properties.name ||
                properties.locality ||
                properties.district ||
                "";

              const country =
                properties.country || "";

              const state =
                properties.state || "";

              if (!city) {
                return null;
              }

              const displayParts = [
                city,
                state && state !== city
                  ? state
                  : "",
                country &&
                country !== city
                  ? country
                  : "",
              ].filter(Boolean);

              return {
                id:
                  properties.osm_id ||
                  `${city}-${country}-${state}`,
                city,
                country,
                state,
                label:
                  displayParts.join(", "),
              };
            })
            .filter(Boolean)
            .filter(
              (item, index, array) =>
                index ===
                array.findIndex(
                  (other) =>
                    other.label ===
                    item.label
                )
            );

        setDestinationSuggestions(
          formattedSuggestions
        );
      } catch (suggestionError) {
        console.error(
          "Destination search error:",
          suggestionError
        );

        if (
          requestId ===
          destinationRequestRef.current
        ) {
          setDestinationSuggestions([]);
        }
      } finally {
        if (
          requestId ===
          destinationRequestRef.current
        ) {
          setDestinationLoading(false);
        }
      }
    }, 300);

    return () =>
      clearTimeout(timer);
  }, [
    destination,
    destinationLocked,
  ]);

  useEffect(() => {
    const handleOutsideClick =
      (event) => {
        if (
          destinationWrapperRef.current &&
          !destinationWrapperRef.current.contains(
            event.target
          )
        ) {
          setShowDestinationSuggestions(
            false
          );
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const handleDestinationChange =
    (event) => {
      if (destinationLocked) {
        return;
      }

      const value =
        event.target.value;

      setDestination(value);
      setShowDestinationSuggestions(
        true
      );
      setError("");
    };

  const selectDestination =
    (suggestion) => {
      setDestination(
        suggestion.label
      );
      setDestinationSuggestions([]);
      setShowDestinationSuggestions(
        false
      );
      setError("");
    };

  // ---------------------------------------------------------
  // TRIP DATES
  // ---------------------------------------------------------

  const handleStartDateChange =
    (event) => {
      const value =
        event.target.value;

      setStartDate(value);
      setError("");

      if (
        endDate &&
        value &&
        endDate < value
      ) {
        setEndDate(value);
      }
    };

  const handleEndDateChange =
    (event) => {
      const value =
        event.target.value;

      if (
        startDate &&
        value &&
        value < startDate
      ) {
        setError(
          "Trip To cannot be before Trip From."
        );
        return;
      }

      setEndDate(value);
      setError("");
    };

  // ---------------------------------------------------------
  // BUDGET
  // ---------------------------------------------------------

  const updateBudgetFromInput =
    (event) => {
      const value =
        event.target.value;

      if (/^[0-9,]*$/.test(value)) {
        setBudgetInput(value);
      }
    };

  const applyBudgetInput = () => {
    if (
      budgetInput.trim() === ""
    ) {
      setBudgetInput(String(budget));
      return;
    }

    const numericValue =
      Number(
        budgetInput.replace(/,/g, "")
      );

    if (
      Number.isNaN(numericValue)
    ) {
      setBudgetInput(
        String(budget)
      );
      return;
    }

    const safeBudget =
      Math.min(
        MAX_BUDGET,
        Math.max(
          MIN_BUDGET,
          Math.round(numericValue)
        )
      );

    setBudget(safeBudget);
    setBudgetInput(
      String(safeBudget)
    );
  };

  const handleBudgetSlider =
    (event) => {
      const value =
        Number(
          event.target.value
        );

      setBudget(value);
      setBudgetInput(
        String(value)
      );
    };

  // ---------------------------------------------------------
  // GENERATE ITINERARY
  // ---------------------------------------------------------

  const generatePlan =
    async (event) => {
      event.preventDefault();

      if (loading || saving) {
        return;
      }

      if (!destination.trim()) {
        setError(
          "Please enter a destination."
        );
        return;
      }

      if (!startDate || !endDate) {
        setError(
          "Please select your Trip From and Trip To dates."
        );
        return;
      }

      if (
        endDate < startDate ||
        days < 1
      ) {
        setError(
          "Trip To must be on or after Trip From."
        );
        return;
      }

      const numericBudget =
        Number(
          budgetInput.replace(/,/g, "")
        );

      const finalBudget =
        Math.min(
          MAX_BUDGET,
          Math.max(
            MIN_BUDGET,
            Math.round(
              Number.isNaN(
                numericBudget
              )
                ? budget
                : numericBudget
            )
          )
        );

      if (
        !finalBudget ||
        finalBudget < MIN_BUDGET
      ) {
        setError(
          `Please enter a budget of at least ₹${MIN_BUDGET.toLocaleString(
            "en-IN"
          )}.`
        );
        return;
      }

      setBudget(finalBudget);
      setBudgetInput(
        String(finalBudget)
      );

      setLoading(true);
      setError("");
      setGeneratedTrip(null);
      setOpenItineraryDay(null);
      setShowAllItineraryDays(false);

      setShowDestinationSuggestions(
        false
      );

      try {
        const data =
          await apiRequest(
            "/api/generate-itinerary",
            {
              method: "POST",
              body: JSON.stringify({
                destination:
                  destination.trim(),
                travellers,
                days,
                budget: finalBudget,
                style,
              }),
            }
          );

        if (
          !data ||
          !data.daysPlan ||
          !Array.isArray(
            data.daysPlan
          )
        ) {
          throw new Error(
            "The itinerary response was incomplete."
          );
        }

        const previousTrip =
          initialTrip || null;

        const budgetPlan =
          createBudgetForTotal(
            finalBudget,
            previousTrip?.budgetPlan
          );

        const tripWithPersistence = {
          ...data,

          destination:
            data.destination ||
            destination.trim(),

          travellers:
            Number(
              data.travellers
            ) || travellers,

          days: days,

          startDate,

          endDate,

          budget:
            finalBudget,

          style:
            data.style || style,

          budgetPlan,

          expenses:
            previousTrip?.expenses ||
            [],

          checklist:
            previousTrip?.checklist ||
            [],

          savedPlaces:
            previousTrip?.savedPlaces ||
            [],

          ...(initialTrip?.id
            ? {
                id: initialTrip.id,
              }
            : {}),
        };

        setGeneratedTrip(
          tripWithPersistence
        );

        setShowAllItineraryDays(
          false
        );

        setOpenItineraryDay(
          tripWithPersistence
            .daysPlan?.[0]?.day ||
            null
        );
      } catch (requestError) {
        console.error(
          "Itinerary generation error:",
          requestError
        );

        setError(
          requestError?.message ||
            "TravelMate couldn't create your itinerary right now. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

  // ---------------------------------------------------------
  // SAVE TRIP TO CLOUD
  // ---------------------------------------------------------

  const saveToMyTrips =
    async () => {
      if (
        !generatedTrip ||
        saving
      ) {
        return;
      }

      const previousTrip =
        initialTrip || null;

      const finalBudget =
        Number(
          generatedTrip.budget
        ) || budget;

      const budgetChanged =
        Number(
          previousTrip?.budget
        ) !== finalBudget;

      const tripToSave = {
        ...generatedTrip,

        destination:
          generatedTrip.destination ||
          destination.trim(),

        travellers:
          Number(
            generatedTrip.travellers
          ) || travellers,

        days: days,

        startDate,

        endDate,

        budget:
          finalBudget,

        style:
          generatedTrip.style ||
          style,

        budgetPlan:
          budgetChanged
            ? createBudgetForTotal(
                finalBudget
              )
            : createBudgetForTotal(
                finalBudget,
                generatedTrip.budgetPlan
              ),

        expenses:
          previousTrip?.expenses ||
          generatedTrip.expenses ||
          [],

        checklist:
          previousTrip?.checklist ||
          generatedTrip.checklist ||
          [],

        savedPlaces:
          previousTrip?.savedPlaces ||
          generatedTrip.savedPlaces ||
          [],
      };

      try {
        setSaving(true);
        setError("");

        let response;

        if (generatedTrip.id) {
          response =
            await apiRequest(
              `/api/trips/${generatedTrip.id}`,
              {
                method: "PUT",
                body: JSON.stringify({
                  trip: tripToSave,
                }),
              }
            );
        } else {
          response =
            await apiRequest(
              "/api/trips",
              {
                method: "POST",
                body: JSON.stringify({
                  trip: tripToSave,
                }),
              }
            );
        }

        const savedCloudTrip =
          response?.trip;

        if (
          !savedCloudTrip ||
          typeof savedCloudTrip !==
            "object"
        ) {
          throw new Error(
            "The trip was saved, but no trip data was returned."
          );
        }

        saveTrip(
          savedCloudTrip
        );

        localStorage.setItem(
          "travelmateCurrentTripId",
          String(
            savedCloudTrip.id
          )
        );

        setGeneratedTrip(
          savedCloudTrip
        );

        navigate("/my-trips");
      } catch (saveError) {
        console.error(
          "Trip save error:",
          saveError
        );

        if (
          saveError?.message
            ?.toLowerCase()
            .includes(
              "unauthorized"
            ) ||
          saveError?.message
            ?.toLowerCase()
            .includes(
              "authentication"
            )
        ) {
          setError(
            "Your login session expired. Please log in again and try saving the trip."
          );
        } else {
          setError(
            saveError?.message ||
              "Unable to save your trip right now. Please try again."
          );
        }
      } finally {
        setSaving(false);
      }
    };

  const itineraryDays =
    Array.isArray(
      generatedTrip?.daysPlan
    )
      ? generatedTrip.daysPlan
      : [];

  const visibleItineraryDays =
    showAllItineraryDays
      ? itineraryDays
      : itineraryDays.slice(0, 2);

  const toggleItineraryDay =
    (dayNumber) => {
      setOpenItineraryDay(
        (currentDay) =>
          currentDay === dayNumber
            ? null
            : dayNumber
      );
    };

  const handleAddStay = () => {
    if (!generatedTrip) {
      return;
    }

    const firstDay =
      generatedTrip.daysPlan?.[0]
        ?.day || 1;

    const selectedDay =
      generatedTrip.daysPlan?.find(
        (day) =>
          day.day === firstDay
      );

    const dayDate =
      normalizeDateInputValue(
        selectedDay?.date ||
          selectedDay?.dateValue ||
          startDate
      ) || startDate;

    setPlannerStayDay(
      firstDay
    );

    setPlannerStayFrom(
      dayDate
    );

    setPlannerStayTo(
      dayDate
    );

    setPlannerStayAddress(
      ""
    );

    setError("");

    setShowPlannerStayForm(
      true
    );
  };

  const openPlannerStayForDay =
    (dayNumber) => {
      if (!generatedTrip) {
        return;
      }

      const selectedDay =
        generatedTrip.daysPlan?.find(
          (day) =>
            day.day === dayNumber
        );

      const dayDate =
        normalizeDateInputValue(
          selectedDay?.date ||
            selectedDay?.dateValue ||
            addDaysToDateInput(
              startDate,
              Number(dayNumber) - 1
            )
        ) || startDate;

      setPlannerStayDay(
        dayNumber
      );

      setPlannerStayFrom(
        dayDate
      );

      setPlannerStayTo(
        dayDate
      );

      setPlannerStayAddress(
        selectedDay?.stay?.address ||
          ""
      );

      setError("");

      setShowPlannerStayForm(
        true
      );
    };

  const closePlannerStayForm =
    () => {
      setShowPlannerStayForm(
        false
      );

      setPlannerStayDay(
        null
      );

      setPlannerStayFrom(
        ""
      );

      setPlannerStayTo(
        ""
      );

      setPlannerStayAddress(
        ""
      );

      setPlannerStaySuggestions(
        []
      );

      setShowPlannerStaySuggestions(
        false
      );
    };

  const savePlannerStay =
    () => {
      if (
        !generatedTrip ||
        !plannerStayDay
      ) {
        return;
      }

      if (
        !plannerStayFrom ||
        !plannerStayTo
      ) {
        setError(
          "Please select Stay From and Stay To."
        );
        return;
      }

      if (
        plannerStayTo <
        plannerStayFrom
      ) {
        setError(
          "Stay To cannot be before Stay From."
        );
        return;
      }

      if (
        !plannerStayAddress.trim()
      ) {
        setError(
          "Please enter the hotel or stay address."
        );
        return;
      }

      const updatedDays =
        generatedTrip.daysPlan.map(
          (day) =>
            day.day ===
            plannerStayDay
              ? {
                  ...day,
                  stay: {
                    from:
                      plannerStayFrom,
                    to:
                      plannerStayTo,
                    address:
                      plannerStayAddress.trim(),
                  },
                }
              : day
        );

      setGeneratedTrip({
        ...generatedTrip,
        daysPlan: updatedDays,
      });

      closePlannerStayForm();
    };

  return (
    <div className="app inner-page">
      <main className="planner-page section">

        <div className="page-hero compact">
          <div className="section-kicker">
            AI TRIP PLANNER
          </div>

          <h1>
            Build your
            <br />
            <em>perfect trip.</em>
          </h1>

          <p>
            Tell TravelMate what you want.
            We'll organize the journey
            around you.
          </p>
        </div>

        <div className="planner-layout">

          <form
            className="planner-panel"
            onSubmit={generatePlan}
          >

            <div className="planner-panel-heading">
              <span>01</span>

              <div>
                <strong>
                  Trip basics
                </strong>

                <small>
                  Where and how long?
                </small>
              </div>
            </div>

            <label>
              Destination

              <div
                className="destination-autocomplete"
                ref={destinationWrapperRef}
              >
                <input
                  value={destination}
                  onChange={
                    handleDestinationChange
                  }
                  onFocus={() => {
                    if (
                      !destinationLocked &&
                      destination.trim()
                        .length >= 2
                    ) {
                      setShowDestinationSuggestions(
                        true
                      );
                    }
                  }}
                  className={
                    destinationLocked
                      ? "destination-locked-input"
                      : ""
                  }
                  placeholder="Where do you want to go?"
                  required
                  autoComplete="off"
                  readOnly={
                    destinationLocked
                  }
                />

                {showDestinationSuggestions &&
                  destination.trim()
                    .length >= 2 && (
                    <div className="destination-suggestions">

                      {destinationLoading ? (
                        <div className="destination-suggestion-loading">
                          <span className="destination-spinner" />
                          Searching destinations...
                        </div>
                      ) : destinationSuggestions.length >
                        0 ? (
                        destinationSuggestions.map(
                          (suggestion) => (
                            <button
                              key={
                                suggestion.id
                              }
                              type="button"
                              className="destination-suggestion"
                              onMouseDown={(
                                event
                              ) => {
                                event.preventDefault();

                                selectDestination(
                                  suggestion
                                );
                              }}
                            >
                              <span className="destination-suggestion-icon">
                                🌍
                              </span>

                              <span className="destination-suggestion-content">
                                <strong>
                                  {
                                    suggestion.city
                                  }
                                </strong>

                                <small>
                                  {[
                                    suggestion.state,
                                    suggestion.country,
                                  ]
                                    .filter(
                                      Boolean
                                    )
                                    .filter(
                                      (
                                        value,
                                        index,
                                        array
                                      ) =>
                                        array.indexOf(
                                          value
                                        ) ===
                                        index
                                    )
                                    .join(
                                      ", "
                                    )}
                                </small>
                              </span>
                            </button>
                          )
                        )
                      ) : (
                        <div className="destination-no-results">
                          No matching destinations found.
                          Try another spelling.
                        </div>
                      )}

                    </div>
                  )}
              </div>
            </label>

            <div className="planner-date-row">

              <label>
                Trip From

                <input
                  className="planner-date-input"
                  type="date"
                  value={startDate}
                  onChange={
                    handleStartDateChange
                  }
                  aria-label="Trip start date"
                />
              </label>

              <label>
                Trip To

                <input
                  className="planner-date-input"
                  type="date"
                  value={endDate}
                  min={
                    startDate ||
                    undefined
                  }
                  onChange={
                    handleEndDateChange
                  }
                  aria-label="Trip end date"
                />
              </label>

            </div>

            <label className="planner-travellers-field">
              Travellers

              <div className="stepper">

                <button
                  type="button"
                  onClick={() =>
                    setTravellers(
                      (value) =>
                        Math.max(
                          1,
                          value - 1
                        )
                    )
                  }
                >
                  −
                </button>

                <strong>
                  {travellers}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    setTravellers(
                      (value) =>
                        Math.min(
                          12,
                          value + 1
                        )
                    )
                  }
                >
                  +
                </button>

              </div>
            </label>

            <div className="planner-auto-days">
              <span>
                Trip duration
              </span>

              <strong>
                {days > 0
                  ? `${days} ${
                      days === 1
                        ? "day"
                        : "days"
                    }`
                  : "Select valid dates"}
              </strong>
            </div>

            <div className="planner-panel-heading">
              <span>02</span>

              <div>
                <strong>
                  Travel style
                </strong>

                <small>
                  How do you want to travel?
                </small>
              </div>
            </div>

            <div className="style-options">

              {[
                "Budget",
                "Balanced",
                "Luxury",
              ].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={
                    style === option
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setStyle(
                      option
                    )
                  }
                >
                  {option}
                </button>
              ))}

            </div>

            <div className="planner-panel-heading">
              <span>03</span>

              <div>
                <strong>
                  Budget
                </strong>

                <small>
                  Set your comfort zone
                </small>
              </div>
            </div>

            <div className="budget-label">

              <div className="budget-input-wrapper">
                <span>₹</span>

                <input
                  className="budget-input"
                  type="text"
                  inputMode="numeric"
                  value={budgetInput}
                  onChange={
                    updateBudgetFromInput
                  }
                  onBlur={
                    applyBudgetInput
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      event.preventDefault();
                      applyBudgetInput();
                    }
                  }}
                  aria-label="Enter budget"
                />
              </div>

              <span>
                estimated total budget
              </span>

            </div>

            <input
              className="range"
              type="range"
              min={MIN_BUDGET}
              max={MAX_BUDGET}
              step="1000"
              value={budget}
              onChange={
                handleBudgetSlider
              }
              aria-label="Adjust budget"
            />

            <div className="budget-range-labels">
              <span>
                ₹
                {MIN_BUDGET.toLocaleString(
                  "en-IN"
                )}
              </span>

              <span>
                ₹
                {MAX_BUDGET.toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>

            <button
              className="planner-submit"
              type="submit"
              disabled={
                loading || saving
              }
            >
              {loading
                ? "Creating your itinerary..."
                : "Generate itinerary"}

              <span>✦</span>
            </button>

            {error && (
              <div className="planner-error">
                {error}
              </div>
            )}

          </form>

          <div className="planner-preview">

            {!generatedTrip &&
            !loading ? (
              <>
                <div className="preview-icon">
                  ✦
                </div>

                <div className="section-kicker">
                  AI PREVIEW
                </div>

                <h2>
                  Your itinerary
                  <br />
                  <em>
                    will appear here.
                  </em>
                </h2>

                <p>
                  Complete the trip details
                  and TravelMate will
                  prepare a personalized
                  itinerary for you.
                </p>

                <div className="preview-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </>
            ) : loading ? (
              <>
                <div className="preview-icon">
                  ✦
                </div>

                <div className="section-kicker">
                  TRAVELMATE AI
                </div>

                <h2>
                  Creating your
                  <br />
                  <em>
                    perfect journey...
                  </em>
                </h2>

                <p>
                  TravelMate is creating a
                  personalized {days}-day
                  itinerary for{" "}
                  <strong>
                    {destination}
                  </strong>
                  .
                </p>

                <div className="preview-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </>
            ) : (
              <>
                <div
                  ref={
                    itinerarySectionRef
                  }
                  className="planner-ai-itinerary-intro"
                >
                  <span className="section-kicker">
                    AI ITINERARY
                  </span>
                </div>

                <div className="planner-ai-itinerary">

                  <div className="planner-ai-days">

                    {visibleItineraryDays.map(
                      (day) => {
                        const dayNumber =
                          day.day;

                        const isOpen =
                          openItineraryDay ===
                          dayNumber;

                        const activities =
                          Array.isArray(
                            day.activities
                          )
                            ? day.activities
                            : [];

                        return (
                          <div
                            className={`planner-ai-day ${
                              isOpen
                                ? "open"
                                : ""
                            }`}
                            key={dayNumber}
                          >

                            <button
                              className="planner-ai-day-header"
                              type="button"
                              onClick={() =>
                                toggleItineraryDay(
                                  dayNumber
                                )
                              }
                              aria-expanded={
                                isOpen
                              }
                            >
                              <span className="planner-ai-day-number">
                                {String(
                                  dayNumber
                                ).padStart(
                                  2,
                                  "0"
                                )}
                              </span>

                              <span className="planner-ai-day-main">
                                <strong>
                                  Day{" "}
                                  {dayNumber}
                                </strong>

                                <small>
                                  {day.title ||
                                    "Your day itinerary"}
                                </small>
                              </span>

                              <span className="planner-ai-day-chevron">
                                {isOpen
                                  ? "⌃"
                                  : "⌄"}
                              </span>
                            </button>

                            {isOpen && (
                              <div className="planner-ai-day-content">

                                {day.description && (
                                  <p className="planner-ai-day-description">
                                    {
                                      day.description
                                    }
                                  </p>
                                )}

                                {activities.length >
                                0 ? (
                                  <div className="planner-ai-activities">

                                    {activities.map(
                                      (
                                        activity,
                                        index
                                      ) => (
                                        <div
                                          className="planner-ai-activity"
                                          key={
                                            activity.id ||
                                            `${dayNumber}-${index}`
                                          }
                                        >
                                          <span className="planner-ai-activity-dot" />

                                          <div>
                                            <strong>
                                              {activity.name ||
                                                activity.title ||
                                                `Activity ${
                                                  index +
                                                  1
                                                }`}
                                            </strong>

                                            {activity.time && (
                                              <small>
                                                {
                                                  activity.time
                                                }
                                              </small>
                                            )}

                                            {activity.description && (
                                              <p>
                                                {
                                                  activity.description
                                                }
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    )}

                                  </div>
                                ) : (
                                  <p className="planner-ai-empty-day">
                                    No activities planned
                                    for this day yet.
                                  </p>
                                )}

                                {day.stay && (
                                  <div className="planner-ai-day-stay">
                                    <div>
                                      <span>
                                        STAY
                                      </span>

                                      <strong>
                                        {
                                          day
                                            .stay
                                            .address
                                        }
                                      </strong>

                                      <small>
                                        {formatDateForInput(
                                          day
                                            .stay
                                            .from
                                        )}

                                        {day.stay
                                          .to
                                          ? ` → ${formatDateForInput(
                                              day
                                                .stay
                                                .to
                                            )}`
                                          : ""}
                                      </small>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        openPlannerStayForDay(
                                          dayNumber
                                        )
                                      }
                                    >
                                      Edit
                                    </button>
                                  </div>
                                )}

                                <button
                                  className="planner-ai-day-add-stay"
                                  type="button"
                                  onClick={() =>
                                    openPlannerStayForDay(
                                      dayNumber
                                    )
                                  }
                                >
                                  {day.stay
                                    ? "Edit stay"
                                    : "+ Add stay"}
                                </button>

                              </div>
                            )}

                          </div>
                        );
                      }
                    )}

                  </div>

                  {itineraryDays.length >
                    2 &&
                    !showAllItineraryDays && (
                      <button
                        className="planner-ai-show-more"
                        type="button"
                        onClick={() =>
                          setShowAllItineraryDays(
                            true
                          )
                        }
                      >
                        Show more →
                      </button>
                    )}

                </div>

                <div className="planner-ai-actions">

                  <button
                    className="planner-ai-add-stay"
                    type="button"
                    onClick={
                      handleAddStay
                    }
                  >
                    + Add Stay
                  </button>

                  <button
                    className="planner-ai-save-trip"
                    type="button"
                    onClick={
                      saveToMyTrips
                    }
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Trip"}
                  </button>

                </div>

                {showPlannerStayForm && (
                  <div className="planner-stay-modal">

                    <div className="planner-stay-modal-card">

                      <button
                        type="button"
                        className="planner-stay-modal-close"
                        onClick={
                          closePlannerStayForm
                        }
                        aria-label="Close"
                      >
                        ×
                      </button>

                      <div className="section-kicker">
                        ADD A STAY
                      </div>

                      <h3>
                        Add your{" "}
                        <em>stay.</em>
                      </h3>

                      <p>
                        Add accommodation
                        for Day{" "}
                        {plannerStayDay}.
                      </p>

                      <div className="planner-stay-form-grid">

                        <label>
                          Stay From

                          <input
                            type="date"
                            value={
                              plannerStayFrom
                            }
                            min={
                              startDate ||
                              undefined
                            }
                            max={
                              endDate ||
                              undefined
                            }
                            onChange={(
                              event
                            ) => {
                              const value =
                                event.target
                                  .value;

                              setPlannerStayFrom(
                                value
                              );

                              if (
                                plannerStayTo &&
                                value >
                                  plannerStayTo
                              ) {
                                setPlannerStayTo(
                                  value
                                );
                              }
                            }}
                          />
                        </label>

                        <label>
                          Stay To

                          <input
                            type="date"
                            value={
                              plannerStayTo
                            }
                            min={
                              plannerStayFrom ||
                              startDate ||
                              undefined
                            }
                            max={
                              endDate ||
                              undefined
                            }
                            onChange={(
                              event
                            ) =>
                              setPlannerStayTo(
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </label>

                      </div>

                      <div
                        className="planner-stay-address planner-stay-search-wrapper"
                        ref={
                          plannerStayWrapperRef
                        }
                      >
                        <label htmlFor="planner-stay-address-input">
                          Hotel / Stay Address
                        </label>

                        <input
                          id="planner-stay-address-input"
                          type="text"
                          value={
                            plannerStayAddress
                          }
                          onFocus={() => {
                            if (
                              plannerStayAddress
                                .trim()
                                .length >=
                              2
                            ) {
                              setShowPlannerStaySuggestions(
                                true
                              );
                            }
                          }}
                          onChange={(
                            event
                          ) => {
                            setPlannerStayAddress(
                              event
                                .target
                                .value
                            );

                            setShowPlannerStaySuggestions(
                              true
                            );

                            setError("");
                          }}
                          placeholder="Search hotel or enter address..."
                          autoComplete="off"
                        />

                        {showPlannerStaySuggestions &&
                          plannerStayAddress
                            .trim()
                            .length >=
                            2 && (
                            <div className="planner-stay-suggestions">

                              {plannerStaySuggestionsLoading ? (
                                <div className="planner-stay-suggestion-status">
                                  Searching nearby stays...
                                </div>
                              ) : plannerStaySuggestions.length >
                                0 ? (
                                plannerStaySuggestions.map(
                                  (
                                    suggestion
                                  ) => (
                                    <button
                                      key={
                                        suggestion.id
                                      }
                                      type="button"
                                      className="planner-stay-suggestion"
                                      onClick={() =>
                                        selectPlannerStaySuggestion(
                                          suggestion
                                        )
                                      }
                                    >
                                      <span className="planner-stay-suggestion-icon">
                                        {suggestion.isHotel
                                          ? "🏨"
                                          : "📍"}
                                      </span>

                                      <span className="planner-stay-suggestion-copy">
                                        <strong>
                                          {suggestion.name ||
                                            suggestion.label}
                                        </strong>

                                        <small>
                                          {suggestion.address ||
                                            suggestion.label}
                                        </small>
                                      </span>
                                    </button>
                                  )
                                )
                              ) : (
                                <div className="planner-stay-suggestion-status">
                                  No matching place found.
                                  You can still enter
                                  the full address manually.
                                </div>
                              )}

                            </div>
                          )}
                      </div>

                      <button
                        type="button"
                        className="planner-stay-save"
                        onClick={
                          savePlannerStay
                        }
                      >
                        Add Stay
                      </button>

                    </div>

                  </div>
                )}

              </>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}

export default Planner;