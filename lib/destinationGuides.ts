export type DestinationGuide = {
  region: string
  tagline: string
  famousFor: string
  bestFor: string[]
  nights: string
  season: string
  see: { title: string; note: string }[]
  do: { title: string; note: string }[]
  eat: string[]
  tips: string[]
}

export const DESTINATION_GUIDES: Record<string, DestinationGuide> = {
  Galle: {
    region: "South coast",
    tagline: "A living Dutch fort on the Indian Ocean",
    famousFor:
      "Galle is famous for its UNESCO Fort — cobbled lanes, coral-stone walls, and a lighthouse over the harbour. People come to walk the ramparts at sunset, eat in old Dutch houses, and use it as a base for the south.",
    bestFor: ["History", "Food", "Couples"],
    nights: "2–3 nights",
    season: "Dec–Apr",
    see: [
      { title: "Fort ramparts", note: "The classic golden-hour walk along the ocean walls." },
      { title: "Lighthouse & harbour", note: "White tower, cricket green, and fishing boats in one frame." },
      { title: "Pedlar Street", note: "Boutiques and cafés in old colonial houses." },
    ],
    do: [
      { title: "Sunset on the walls", note: "Start at the lighthouse and follow the sea side." },
      { title: "Unawatuna swim", note: "Ten minutes by tuk-tuk for a sheltered bay." },
      { title: "Fort food crawl", note: "Lamprais, hoppers, then a rooftop drink." },
    ],
    eat: ["Lamprais", "Harbour seafood", "Fort cafés"],
    tips: [
      "The Fort is walkable — skip the car once you’re inside the gates.",
      "Colombo to Galle is about 2 hours on the Southern Expressway.",
    ],
  },
  Sigiriya: {
    region: "Cultural triangle",
    tagline: "The rock fortress you climb before breakfast",
    famousFor:
      "Sigiriya is famous for Lion Rock — a 5th-century palace on a jungle summit, frescoes, and one of the island’s essential climbs. Most people pair it with Pidurangala and a night in Habarana or Dambulla.",
    bestFor: ["UNESCO", "Sunrise", "First-timers"],
    nights: "1–2 nights",
    season: "Jan–Mar",
    see: [
      { title: "Lion Rock", note: "Mirror wall, frescoes, then the palace foundations on top." },
      { title: "Pidurangala", note: "The quieter climb with the best view of Sigiriya itself." },
      { title: "Dambulla caves", note: "Painted temples, about 30 minutes away." },
    ],
    do: [
      { title: "Sunrise climb", note: "Cooler, fewer people, better light." },
      { title: "Village cycle", note: "Paddy tracks, a home lunch, a tank swim." },
      { title: "Minneriya safari", note: "Elephants in the dry months, if you’re nearby." },
    ],
    eat: ["Village rice & curry", "King coconut", "Habarana kottu"],
    tips: [
      "Climb at dawn or late afternoon — midday rock is brutal.",
      "Wear shoes with grip; the last staircases are steep metal.",
    ],
  },
  Kandy: {
    region: "Hill country",
    tagline: "The island’s spiritual capital",
    famousFor:
      "Kandy is famous for the Temple of the Tooth, the lake, and as the last royal capital. Travellers pause here between Colombo and the tea country — ceremonies, markets, and the start of the hill train.",
    bestFor: ["Temples", "Markets", "Trains"],
    nights: "1–2 nights",
    season: "Jan–Apr",
    see: [
      { title: "Temple of the Tooth", note: "Go for a puja if you can time it." },
      { title: "Kandy Lake", note: "An easy loop under rain trees." },
      { title: "Peradeniya Gardens", note: "Orchids and giant trees just outside town." },
    ],
    do: [
      { title: "Evening ceremony", note: "Drums and offerings at the temple complex." },
      { title: "Catch the hill train", note: "Book Kandy–Ella seats early — they sell out." },
      { title: "Central Market", note: "Spices, fruit, and the real grocery chaos of Kandy." },
    ],
    eat: ["Muslim hotel biryani", "Hill-country tea", "Lake-view kottu"],
    tips: [
      "Cover shoulders and knees at the temple; shoes off at the door.",
      "Esala Perahera (July/August) is spectacular — book rooms early.",
    ],
  },
  Hikkaduwa: {
    region: "South west",
    tagline: "Coral, turtles, and a proper beach town",
    famousFor:
      "Hikkaduwa is famous for its reef, sea turtles, and an easy-going strip of guesthouses. Snorkel in the morning, then train-hop to Galle in the afternoon.",
    bestFor: ["Snorkelling", "Turtles", "Beach days"],
    nights: "2 nights",
    season: "Nov–Apr",
    see: [
      { title: "The reef", note: "Shallow coral right off the main beach." },
      { title: "Turtle hatchery", note: "North of town — pick a conservation-minded one." },
      { title: "Moonstone mines", note: "A short inland trip if you like gem stories." },
    ],
    do: [
      { title: "Snorkel the sanctuary", note: "Glass-bottom boats if you don’t want to swim." },
      { title: "Train to Galle", note: "Cheap, scenic, about 40 minutes." },
      { title: "Night market stroll", note: "Grilled corn, juice, beach bars." },
    ],
    eat: ["Beach-shack seafood", "King coconut", "Wood-fired pizza"],
    tips: [
      "Reef shoes help — coral cuts are no fun.",
      "May–October is monsoon here; waves get messy.",
    ],
  },
  Weligama: {
    region: "South coast",
    tagline: "Learn to surf in a wide, friendly bay",
    famousFor:
      "Weligama is Sri Lanka’s easiest surf classroom — a long sandy bay, boards on the sand, and a fishing village that still works at dawn. Calmer than Mirissa, closer than Galle.",
    bestFor: ["Surf schools", "Families", "Long stays"],
    nights: "3–5 nights",
    season: "Nov–Apr",
    see: [
      { title: "Weligama Bay", note: "Horseshoe sand and the view to Taprobane Island." },
      { title: "Fish market dawn", note: "Boats in, auction shouting, tuna on ice." },
      { title: "Mirissa lookout", note: "Fifteen minutes for a coconut and a cliff view." },
    ],
    do: [
      { title: "Beginner surf lesson", note: "Soft boards, waist-deep whitewash, patient coaches." },
      { title: "Cycle the bay", note: "Cafés, fruit stalls, the old railway crossing." },
      { title: "Day in Galle Fort", note: "45 minutes west when you want cobbles, not sand." },
    ],
    eat: ["Egg hoppers", "Bay-front cafés", "Village kade"],
    tips: [
      "Mornings are glassy; wind often picks up after lunch.",
      "Stilt fishermen here are often posed for photos — be respectful.",
    ],
  },
  Yala: {
    region: "Dry zone",
    tagline: "Leopards, lagoons, and jeep country",
    famousFor:
      "Yala is one of the best places on earth to see leopards in the wild, plus elephants, sloth bears, and packed birdlife. Stay in Tissamaharama or Palatupana and do a dawn jeep into Block 1.",
    bestFor: ["Wildlife", "Photography", "Safaris"],
    nights: "2 nights",
    season: "Feb–Jun",
    see: [
      { title: "Yala Block 1", note: "The classic circuit — cats, elephants, and the beach edge." },
      { title: "Sithulpawwa", note: "A rock temple inside the park with a huge view." },
      { title: "Tissa Wewa", note: "Sunset birds from town when you’re not in the jeep." },
    ],
    do: [
      { title: "Dawn safari", note: "Leave the hotel in the dark. Cats move early." },
      { title: "Second afternoon drive", note: "Different light, different luck." },
      { title: "Kataragama", note: "A sacred town nearby if you have a spare evening." },
    ],
    eat: ["Packed safari breakfast", "Tissa lake fish", "Rice & curry after the dust"],
    tips: [
      "Book a small jeep and a sharp tracker — that’s the whole experience.",
      "Keep voices down and arms inside. Sightings are luck plus patience.",
    ],
  },
  Ella: {
    region: "Tea country",
    tagline: "Mist, a tiny town, and that train",
    famousFor:
      "Ella is famous for Nine Arch Bridge, Ella Rock, and the Kandy–Ella train. Stay for the walks, not just the Instagram bridge.",
    bestFor: ["Hiking", "Tea", "Trains"],
    nights: "2–3 nights",
    season: "Jan–Mar",
    see: [
      { title: "Nine Arch Bridge", note: "Time it for a train crossing if you can." },
      { title: "Little Adam’s Peak", note: "Short, steep, huge payoff at sunrise." },
      { title: "Ella Gap", note: "The view that made the town, south toward the plains." },
    ],
    do: [
      { title: "Ella Rock hike", note: "Longer than Little Adam’s — start early, take water." },
      { title: "Tea factory visit", note: "Withering, rolling, and a tasting flight." },
      { title: "Train to Nanu Oya", note: "One of the prettiest rail days on earth." },
    ],
    eat: ["Hill-country curry", "Wood-oven cafés", "Strong Ceylon tea"],
    tips: [
      "Nine Arch is a walk from town — you don’t need a tour for it.",
      "Evenings get cool. Pack a light layer.",
    ],
  },
  Mirissa: {
    region: "South coast",
    tagline: "Whales in the morning, palms at night",
    famousFor:
      "Mirissa is famous for blue-whale watching from November to April, and a crescent beach that still feels like a village. Coconut Tree Hill is the postcard shot.",
    bestFor: ["Whales", "Beaches", "Sunsets"],
    nights: "2–3 nights",
    season: "Nov–Apr",
    see: [
      { title: "Mirissa Beach", note: "Palm line, a surf peak on the right, bars on the sand." },
      { title: "Coconut Tree Hill", note: "Go at sunrise before the crowds." },
      { title: "Secret Beach", note: "A scramble west — calmer water, fewer vendors." },
    ],
    do: [
      { title: "Whale watching", note: "Pick a boat that keeps distance from the animals." },
      { title: "Dawn surf", note: "The right-hand point works for intermediates." },
      { title: "Weligama lesson", note: "Fifteen minutes away if you’re still learning." },
    ],
    eat: ["Grilled tuna", "Coconut roti", "Sunset drink on the sand"],
    tips: [
      "Whale boats leave around 6:30am. Seasick patches help on choppy days.",
      "Party noise on the main strip can run late — stay west for sleep.",
    ],
  },
  Colombo: {
    region: "West coast",
    tagline: "Food, forts, and the ocean road",
    famousFor:
      "Colombo is Sri Lanka’s noisy, generous capital — Pettah markets, Galle Face Green, and some of the best eating in the country. Most travellers give it a night. Food people give it two.",
    bestFor: ["Food", "City life", "First night"],
    nights: "1–2 nights",
    season: "Year-round",
    see: [
      { title: "Galle Face Green", note: "Kites, street snacks, and the ocean road at dusk." },
      { title: "Pettah", note: "Markets next to restored warehouses and cafés." },
      { title: "Gangaramaya Temple", note: "A maximalist Colombo temple." },
    ],
    do: [
      { title: "Eat your way through town", note: "Hoppers, kottu, crab — this city is the point." },
      { title: "Ocean-road tuk-tuk", note: "Mount Lavinia for a swim if you have an extra hour." },
      { title: "Sunset at Galle Face", note: "Do it once, with isso wade in hand." },
    ],
    eat: ["Crab curry", "Pettah short eats", "Slave Island kottu"],
    tips: [
      "Use ride-hailing at night. Pettah is better by day.",
      "Airport to town is 45–90 minutes depending on traffic.",
    ],
  },
  Trincomalee: {
    region: "East coast",
    tagline: "Water so clear it looks unreal",
    famousFor:
      "Trincomalee is famous for Nilaveli and Uppuveli, snorkelling at Pigeon Island, and a deep natural harbour. It’s the east-coast counterweight to Galle — drier when the south-west is wet.",
    bestFor: ["Snorkelling", "Quiet beaches", "Temples"],
    nights: "3 nights",
    season: "Apr–Sep",
    see: [
      { title: "Koneswaram Temple", note: "Cliff-top kovil above the harbour." },
      { title: "Nilaveli Beach", note: "Long, pale, barely built-up." },
      { title: "Pigeon Island", note: "A national-park reef — book the boat." },
    ],
    do: [
      { title: "Snorkel Pigeon Island", note: "Blacktip reef sharks are common and harmless here." },
      { title: "Slow beach day", note: "Trinco rewards doing less." },
      { title: "Temple puja", note: "Go for the colour and the view, shoes off." },
    ],
    eat: ["Harbour fish", "Tamil dosai", "Uppuveli crab"],
    tips: [
      "East coast shines roughly May–September, opposite the south-west.",
      "It’s a long road from Colombo. Fly if you can, or break at Sigiriya.",
    ],
  },
  "Nuwara Eliya": {
    region: "Tea country",
    tagline: "Little England in the clouds",
    famousFor:
      "Nuwara Eliya is famous for tea estates, cool weather, and colonial bungalows. Walk Horton Plains, pick tea stories, and sleep under a blanket for once.",
    bestFor: ["Tea", "Cool climate", "Hikes"],
    nights: "1–2 nights",
    season: "Jan–Mar",
    see: [
      { title: "Tea estates", note: "Rows like corduroy hills — Pedro or Mackwoods." },
      { title: "Gregory Lake", note: "A gentle loop if the mist lifts." },
      { title: "World’s End", note: "Leave by 5am so the cliff isn’t in cloud." },
    ],
    do: [
      { title: "Horton Plains hike", note: "The big viewpoint day from here." },
      { title: "Factory tasting", note: "A tea tour is worth an hour." },
      { title: "Train toward Ella", note: "One of the great rail days on earth." },
    ],
    eat: ["Strawberries & cream", "Hill-country rice", "Hotel afternoon tea"],
    tips: [
      "It drops to around 10°C at night. Pack a real layer.",
      "Mist can wipe a whole day’s views — have a tea-factory backup.",
    ],
  },
  "Arugam Bay": {
    region: "East coast",
    tagline: "Sri Lanka’s surf capital",
    famousFor:
      "Arugam Bay is famous for a long right-hand point that draws surfers from May to September, plus a dusty, friendly town of shacks. When the south-west is raining, the swell and the sun move here.",
    bestFor: ["Surfing", "East-coast season", "Laid-back nights"],
    nights: "4–7 nights",
    season: "May–Sep",
    see: [
      { title: "Main Point", note: "The long right that made the town." },
      { title: "Pottuvil Lagoon", note: "Dawn boat through mangroves and crocs." },
      { title: "Whiskey Point", note: "Another break, a short tuk-tuk away." },
    ],
    do: [
      { title: "Surf the point", note: "Rent a board on the sand; respect the lineup." },
      { title: "Lagoon safari", note: "Birds, crocs, and a totally different Arugam." },
      { title: "Kumana / Yala east", note: "A wildlife day if the swell is flat." },
    ],
    eat: ["Stuffed roti", "Beach grill", "Papaya juice"],
    tips: [
      "Peak swell is roughly May–September.",
      "ATMs can be moody. Carry cash.",
    ],
  },
}

export function getDestinationGuide(name: string) {
  return DESTINATION_GUIDES[name] ?? null
}
