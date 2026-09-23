const destinationData = {
  bali: {
    country: "Indonesia",
    emoji: "🌴",
    places: [
      "Ubud",
      "Tegallalang Rice Terrace",
      "Seminyak Beach",
      "Uluwatu Temple",
      "Nusa Penida",
      "Sacred Monkey Forest",
    ],
    activities: [
      "Explore local markets",
      "Visit a traditional temple",
      "Enjoy a sunset viewpoint",
      "Try local Indonesian food",
      "Relax at a beach café",
      "Explore rice terraces",
    ],
  },

  manali: {
    country: "India",
    emoji: "🏔️",
    places: [
      "Solang Valley",
      "Mall Road",
      "Hadimba Temple",
      "Old Manali",
      "Rohtang Pass",
      "Vashisht",
    ],
    activities: [
      "Explore Mall Road",
      "Visit Hadimba Temple",
      "Enjoy mountain views",
      "Try local Himachali food",
      "Relax at a riverside café",
      "Explore Old Manali",
    ],
  },

  dubai: {
    country: "United Arab Emirates",
    emoji: "🌆",
    places: [
      "Burj Khalifa",
      "Dubai Marina",
      "Dubai Mall",
      "Palm Jumeirah",
      "Jumeirah Beach",
      "Al Fahidi Historical District",
    ],
    activities: [
      "Visit a famous landmark",
      "Explore Dubai Mall",
      "Enjoy Marina views",
      "Relax at Jumeirah Beach",
      "Explore the historic district",
      "Enjoy an evening city experience",
    ],
  },

  paris: {
    country: "France",
    emoji: "🗼",
    places: [
      "Eiffel Tower",
      "Louvre Museum",
      "Montmartre",
      "Seine River",
      "Arc de Triomphe",
      "Luxembourg Gardens",
    ],
    activities: [
      "Visit a famous landmark",
      "Explore a museum",
      "Walk through historic streets",
      "Try French cuisine",
      "Enjoy a riverside walk",
      "Relax at a Parisian café",
    ],
  },

  london: {
    country: "United Kingdom",
    emoji: "🇬🇧",
    places: [
      "Big Ben",
      "Tower Bridge",
      "London Eye",
      "British Museum",
      "Hyde Park",
      "Covent Garden",
    ],
    activities: [
      "Visit a historic landmark",
      "Explore a famous museum",
      "Walk along the Thames",
      "Try traditional British food",
      "Relax in a city park",
      "Explore local markets",
    ],
  },

  tokyo: {
    country: "Japan",
    emoji: "🗼",
    places: [
      "Shibuya",
      "Senso-ji Temple",
      "Tokyo Skytree",
      "Meiji Shrine",
      "Harajuku",
      "Shinjuku",
    ],
    activities: [
      "Explore a vibrant neighborhood",
      "Visit a traditional temple",
      "Try Japanese street food",
      "Explore local shopping streets",
      "Visit a city viewpoint",
      "Enjoy an evening food experience",
    ],
  },

  default: {
    country: "International destination",
    emoji: "✈️",
    places: [
      "City Centre",
      "Historic District",
      "Local Market",
      "Popular Landmark",
      "Scenic Viewpoint",
      "Local Food Street",
    ],
    activities: [
      "Explore the city centre",
      "Visit a popular landmark",
      "Try local cuisine",
      "Explore local markets",
      "Visit a cultural attraction",
      "Enjoy a relaxing evening",
    ],
  },
};

const styleActivities = {
  Budget: [
    "Explore local markets",
    "Try affordable local food",
    "Walk through the city",
    "Visit free attractions",
  ],

  Balanced: [
    "Visit a popular attraction",
    "Try a recommended local restaurant",
    "Explore a cultural area",
    "Enjoy a scenic experience",
  ],

  Luxury: [
    "Enjoy a premium dining experience",
    "Book a private experience",
    "Relax at a luxury property",
    "Enjoy an exclusive viewpoint",
  ],
};

function getDestinationData(destination) {
  const key = destination.trim().toLowerCase();

  if (destinationData[key]) {
    return destinationData[key];
  }

  const matchingKey = Object.keys(destinationData).find(
    (item) =>
      item !== "default" &&
      key.includes(item)
  );

  return matchingKey
    ? destinationData[matchingKey]
    : destinationData.default;
}

function getStyleActivity(style, index) {
  const activities = styleActivities[style] || styleActivities.Balanced;

  return activities[index % activities.length];
}

function createActivities(data, style, dayIndex) {
  const placeOne =
    data.places[dayIndex % data.places.length];

  const placeTwo =
    data.places[(dayIndex + 1) % data.places.length];

  const activityOne =
    data.activities[dayIndex % data.activities.length];

  const activityTwo =
    getStyleActivity(style, dayIndex);

  const activityThree =
    data.activities[(dayIndex + 2) % data.activities.length];

  return [
    {
      id: `${Date.now()}-${dayIndex}-1`,
      name: `${activityOne} — ${placeOne}`,
      time: "09:00",
      description:
        `Start the day by experiencing ${placeOne}.`,
    },
    {
      id: `${Date.now()}-${dayIndex}-2`,
      name: activityTwo,
      time: "13:00",
      description:
        `Enjoy a ${style.toLowerCase()} travel experience.`,
    },
    {
      id: `${Date.now()}-${dayIndex}-3`,
      name: `${activityThree} — ${placeTwo}`,
      time: "17:00",
      description:
        `Spend the evening discovering ${placeTwo}.`,
    },
  ];
}

export function generateItinerary({
  destination,
  travellers,
  days,
  budget,
  style,
}) {
  const data = getDestinationData(destination);

  const itineraryDays = Array.from(
    { length: Number(days) },
    (_, index) => ({
      day: index + 1,
      title:
        index === 0
          ? `Arrival & ${data.places[0]}`
          : index === Number(days) - 1
            ? "Final day & departure"
            : `${data.places[index % data.places.length]} experience`,
      dateLabel: `Day ${index + 1}`,
      description:
        index === 0
          ? `Settle into ${destination} and begin your journey with a relaxed first day.`
          : index === Number(days) - 1
            ? `Enjoy a final experience in ${destination} before preparing for your journey home.`
            : `Discover another side of ${destination} with a balanced mix of sightseeing, food and local experiences.`,
      activities: createActivities(
        data,
        style,
        index
      ),
    })
  );

  return {
    destination,
    country: data.country,
    emoji: data.emoji,
    travellers: Number(travellers),
    days: Number(days),
    budget: Number(budget),
    style,
    summary: `A ${days}-day ${style.toLowerCase()} trip to ${destination} for ${travellers} traveller${Number(travellers) === 1 ? "" : "s"}.`,
    generatedAt: new Date().toISOString(),
    daysPlan: itineraryDays,
    tips: [
      "Keep some free time instead of over-scheduling every hour.",
      "Carry a digital copy of important travel documents.",
      `Keep your daily spending aligned with your ₹${Number(budget).toLocaleString("en-IN")} budget.`,
    ],
  };
}