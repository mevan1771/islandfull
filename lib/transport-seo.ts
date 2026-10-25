import { stopById } from "@/lib/transport-route"

export function planUrl(stopIds: string[], vehicle?: string) {
  const params = new URLSearchParams()
  if (stopIds.length) params.set("stops", stopIds.join(","))
  if (vehicle) params.set("vehicle", vehicle)
  const q = params.toString()
  return q ? `/transport/plan?${q}` : "/transport/plan"
}

export const TRANSPORT_FAQS = [
  {
    question: "What is the best way to get around Sri Lanka?",
    answer:
      "For most visitors, a private car or van with a local driver is the simplest way to move between cities, national parks, and the coast. Trains are scenic on a few routes (especially Kandy–Ella). Buses are cheap but crowded. Tuk-tuks are best for short hops in town. IslandFull lets you map a custom route and send your price to local hosts.",
  },
  {
    question: "Do I need to hire a driver in Sri Lanka?",
    answer:
      "You do not have to, but many first-time visitors do. Roads can be narrow, signage is mixed, and driving is on the left. A driver-host handles pickup, luggage, and flexible stops. Self-drive scooters work in beach towns if you already ride. We match you with car, van, tuk-tuk, or scooter hosts—you choose.",
  },
  {
    question: "How much is a private driver in Sri Lanka?",
    answer:
      "It depends on distance, vehicle, and days. A typical car day or airport-to-coast transfer is often in the tens to low hundreds of US dollars, not thousands. IslandFull shows a guide price from distance, then you send your own offer. You pay only after a host accepts.",
  },
  {
    question: "Can I get an airport transfer from Colombo (CMB)?",
    answer:
      "Yes. Start the route at Colombo Airport (CMB / Bandaranaike International) and add your hotel or first town—Negombo is close, then Colombo, Galle, Kandy, Sigiriya, Ella, and the south coast. Hosts meet you at arrivals. Add flight details in the requests field.",
  },
  {
    question: "Is the train better than a private car?",
    answer:
      "The Kandy–Ella highland train is worth doing once if you can get seats. For luggage, tight connections, families, or parks like Yala and Sigiriya, a private car or van is faster and door-to-door. Many travelers train one scenic segment and use a driver for the rest.",
  },
  {
    question: "How do I book transport on IslandFull?",
    answer:
      "Open the route planner, tap the places you will visit, pick a vehicle, add dates and guests, then send an offer. Matching local hosts see the trip. No payment until someone accepts. You can add requests such as child seats, extra luggage, or a return to the airport.",
  },
]

export type TransportRoutePage = {
  slug: string
  fromId: string
  toId: string
  viaIds?: string[]
  title: string
  h1: string
  description: string
  hours: string
  km: string
  bestFor: string
  intro: string
  body: string[]
  tips: string[]
  faqs: { question: string; answer: string }[]
}

export const TRANSPORT_ROUTES: TransportRoutePage[] = [
  {
    slug: "colombo-airport-to-ella",
    fromId: "cmb",
    toId: "ella",
    title: "Colombo Airport to Ella private transfer",
    h1: "Colombo Airport to Ella",
    description:
      "Private car or van from Bandaranaike Airport (CMB) to Ella. Typical 6–8 hours by road. Send your price to local Sri Lanka drivers on IslandFull.",
    hours: "6–8 hours by road",
    km: "About 220–250 km depending on the highland route",
    bestFor: "Arriving travelers heading straight to the hills",
    intro:
      "Ella is a long first day from the airport, but it is a common request: land at CMB, skip Colombo traffic, and sleep in the hills. A private transfer is the practical option if you have luggage or a late flight. The train is beautiful later in the trip; it is not a reliable same-day airport connection.",
    body: [
      "Most drivers take the Southern Expressway toward the hills or go inland via Kandy / Nuwara Eliya depending on time of day and your stops. Expect mountain roads for the last stretch. Build in buffer if you land after 14:00—night hill driving is slower.",
      "If you can spare a night, breaking in Kandy or Nuwara Eliya is kinder after a long-haul flight. If you cannot, a van with a professional driver-host is more comfortable than a tuk-tuk or bus with backpacks.",
      "On IslandFull, start at Colombo Airport, tap Ella, add extra stops (tea country, Nine Arches the next morning), pick car or van, and send an offer. Put your flight number in requests so the host can track delays.",
    ],
    tips: [
      "SIM and cash ATMs are in the arrivals hall; you do not need a taxi tout.",
      "Child seats and extra bags: write it in the request before you send.",
      "The scenic train is better booked as a day trip once you are already in Kandy or Nuwara Eliya—not from the airport.",
    ],
    faqs: [
      {
        question: "How long from CMB airport to Ella?",
        answer:
          "Usually 6 to 8 hours by private car, longer in heavy rain or Friday evening traffic. There is no practical same-day train from the airport itself.",
      },
      {
        question: "Can the driver wait if my flight is late?",
        answer: "Yes if you share the flight number in the trip request. Hosts plan around CMB arrivals every day.",
      },
    ],
  },
  {
    slug: "colombo-airport-to-kandy",
    fromId: "cmb",
    toId: "kandy",
    title: "Colombo Airport to Kandy transfer",
    h1: "Colombo Airport to Kandy",
    description:
      "Private transfer from Colombo Airport (CMB) to Kandy. About 3–4 hours. Book a local car or van host and send your own price.",
    hours: "3–4 hours",
    km: "About 110–130 km",
    bestFor: "First night in the cultural triangle / hill country",
    intro:
      "Kandy is the classic first inland stop: Temple of the Tooth, a cooler climate, and a launch point for Sigiriya or the tea country. From CMB it is a half-day drive, not an overnight.",
    body: [
      "The route is mostly highway then winding A-roads into the hills. Afternoon thunderstorms are common. A private car beats the intercity bus if you have suitcases or land tired.",
      "Trains run Colombo–Kandy, but you still need a taxi from CMB to Colombo Fort, and seats sell out. For same-day arrival, a driver-host from the airport is simpler.",
      "Add Pinnawala or a spice garden only if you land before noon. Otherwise go hotel first.",
    ],
    tips: [
      "Kandy one-way streets and temple traffic: ask the host to drop at your hotel door, not a bus stand.",
      "Continue the same trip to Sigiriya or Nuwara Eliya the next morning on one offer.",
    ],
    faqs: [
      {
        question: "Is Kandy close to Colombo Airport?",
        answer: "It is inland, typically 3–4 hours. Negombo and Colombo city are much closer if you land late at night.",
      },
    ],
  },
  {
    slug: "colombo-airport-to-galle",
    fromId: "cmb",
    toId: "galle",
    title: "Colombo Airport to Galle Fort transfer",
    h1: "Colombo Airport to Galle",
    description:
      "Private car or van from CMB airport to Galle Fort and the south coast. About 2–3 hours on the expressway.",
    hours: "2–3 hours via the Southern Expressway",
    km: "About 150 km",
    bestFor: "Beach and Fort stays after landing",
    intro:
      "Galle Fort is the easiest ‘wow’ first night on the south coast. The Southern Expressway made this a straightforward airport run compared with the old coast road.",
    body: [
      "A private transfer is faster than the coastal train (which does not start at the airport) and easier than two buses. Hosts know Fort drop-off restrictions and can stop at Unawatuna or Hikkaduwa if those are your actual hotels.",
      "Late flights: this is still doable the same night. Tell the host your hotel name inside or outside the ramparts.",
    ],
    tips: [
      "If you are staying in Hikkaduwa, Weligama, or Mirissa, add that stop instead of Galle so the price matches the real drop.",
      "Sunrise at the Fort walls is better if you are not wrecked from a 2 a.m. landing—sleep first.",
    ],
    faqs: [
      {
        question: "How long is CMB to Galle?",
        answer: "About 2 to 3 hours by private car on the expressway, longer on the old coast road if you want beach views.",
      },
    ],
  },
  {
    slug: "colombo-airport-to-sigiriya",
    fromId: "cmb",
    toId: "sigiriya",
    title: "Colombo Airport to Sigiriya private driver",
    h1: "Colombo Airport to Sigiriya",
    description:
      "Private transfer from Colombo Airport to Sigiriya and Dambulla. Typically 4–5 hours. Ideal for climbing early the next morning.",
    hours: "4–5 hours",
    km: "About 170–190 km",
    bestFor: "Cultural Triangle first, beaches later",
    intro:
      "Climbing Sigiriya at opening time is worth the inland drive from CMB. A private driver gets you to the hotel before dark so you can start at dawn.",
    body: [
      "The route is highway then dry-zone roads. Combine Dambulla cave temple the same afternoon only if you land early. Safari at Minneriya or Kaudulla is a next-day add-on, not an airport-day activity.",
      "Buses exist but involve changes with luggage. This is a route where a car or van host pays for itself.",
    ],
    tips: [
      "Climb at sunrise; the rock closes in the afternoon heat and tickets have time rules.",
      "You can keep the same host for Kandy or Trincomalee after Sigiriya.",
    ],
    faqs: [
      {
        question: "Can I do Sigiriya the day I land?",
        answer:
          "Only if you land before about 09:00. Most visitors sleep near the rock and climb the next morning.",
      },
    ],
  },
  {
    slug: "colombo-airport-to-mirissa",
    fromId: "cmb",
    toId: "mirissa",
    viaIds: ["galle"],
    title: "Colombo Airport to Mirissa transfer",
    h1: "Colombo Airport to Mirissa",
    description:
      "Airport transfer to Mirissa for whale watching and beach days. About 3–4 hours by private car via the south expressway.",
    hours: "3–4 hours",
    km: "About 180 km",
    bestFor: "South-coast beach start, whale watching",
    intro:
      "Mirissa is a favourite first beach after a European or East Asian flight: sand, seafood, and boats. The drive is longer than Galle but still a same-day arrival.",
    body: [
      "Whale-watching boats often leave early. If that is why you came, land the day before—not at 11 p.m. hoping for a 6 a.m. boat. A private van helps if you have surfboards or a group.",
      "Weligama is 15 minutes west if you prefer a quieter bay; add the real hotel town on the map so hosts price the correct drop.",
    ],
    tips: [
      "November–April is the usual whale season; confirm boats locally, they cancel in swell.",
      "From Mirissa you can continue east to Yala or west back through Galle Fort.",
    ],
    faqs: [
      {
        question: "Is Mirissa far from the airport?",
        answer: "It is a south-coast drive of roughly 3–4 hours. Closer beaches are Negombo (very close) and Hikkaduwa.",
      },
    ],
  },
  {
    slug: "colombo-to-ella",
    fromId: "colombo",
    toId: "ella",
    title: "Colombo to Ella by car, van, or train",
    h1: "Colombo to Ella",
    description:
      "How to get from Colombo to Ella: private driver (6–7 hours), or train via Kandy. Compare and book a host on IslandFull.",
    hours: "6–7 hours by road",
    km: "About 200–230 km",
    bestFor: "City stay first, then tea country",
    intro:
      "From Colombo city (not the airport) you can train or drive. The train is a highlight if you secure seats. A driver is better with luggage, kids, or a tight hotel check-in.",
    body: [
      "Road: similar to the airport–Ella run but you skip the CMB pickup. Drivers often go via Ratnapura or the highlands.",
      "Train: Colombo Fort to Ella is a long scenic day. Book well ahead in high season. You still need a tuk-tuk at both ends. Many guests train Colombo–Kandy or Kandy–Ella and use IslandFull for the other legs.",
    ],
    tips: [
      "Do not count on walking up to Fort and getting an observation-car seat the same morning.",
      "If you only have one scenic-train day, Kandy–Ella is the section people remember.",
    ],
    faqs: [
      {
        question: "Train or driver from Colombo to Ella?",
        answer:
          "Train for the view if you have tickets and a full day. Private car if you value time, door-to-door, or multiple hotel bags.",
      },
    ],
  },
  {
    slug: "kandy-to-ella",
    fromId: "kandy",
    toId: "ella",
    viaIds: ["nuwara-eliya"],
    title: "Kandy to Ella transport — train vs private driver",
    h1: "Kandy to Ella",
    description:
      "Kandy to Ella is Sri Lanka’s famous highland hop. Train is scenic; a private car is more reliable with luggage. Plan either on IslandFull.",
    hours: "3–4 hours by road; train often 6+ hours",
    km: "About 130–150 km by road",
    bestFor: "The classic hill-country day",
    intro:
      "This is the journey on every Sri Lanka itinerary. The train between Kandy (or Nanu Oya / Haputale) and Ella is the postcard. A private driver wins when tickets are sold out or you want tea-factory stops.",
    body: [
      "By car you can add Nuwara Eliya, a tea estate, and Ramboda Falls without watching the clock. The road is winding; vans are more comfortable than tuk-tuks.",
      "By train, sit on the right side Colombo-to-Ella for many of the views (confirm locally). Have a backup IslandFull offer if the railway is delayed—it happens.",
    ],
    tips: [
      "Nine Arches Bridge is a short hop from Ella town at dawn, before the crowds.",
      "Keep the same host for Ella to Yala the next day.",
    ],
    faqs: [
      {
        question: "How long is Kandy to Ella by car?",
        answer: "Typically 3 to 4 hours depending on tea-country traffic and stops. The train is slower but the point is the scenery.",
      },
    ],
  },
  {
    slug: "ella-to-yala",
    fromId: "ella",
    toId: "yala",
    title: "Ella to Yala National Park transfer",
    h1: "Ella to Yala",
    description:
      "Private transfer from Ella to Yala for safari. About 2–3 hours. Combine hill country and wildlife on one IslandFull trip.",
    hours: "2–3 hours",
    km: "About 90–110 km",
    bestFor: "Hills then safari",
    intro:
      "Ella to Yala is a short, popular pairing: misty mornings then dry-zone jeeps. A private car or van is the normal way; there is no useful train to the park gate.",
    body: [
      "Stay near Tissamaharama or Kataragama for early jeep slots. Your IslandFull host can drop at the safari hotel; jeep safari is usually a separate local booking unless you ask in requests.",
      "Continue to Mirissa or Arugam Bay after the park if you want beach after dust.",
    ],
    tips: [
      "Afternoon safaris in heat are quieter; morning has better wildlife odds.",
      "Closed season and block hours change—check park dates before you lock a one-night stay.",
    ],
    faqs: [
      {
        question: "Is there a bus from Ella to Yala?",
        answer:
          "You can piece together buses to Tissamaharama, then a tuk-tuk to your hotel. With camera gear and an early safari, a private transfer is the usual choice.",
      },
    ],
  },
  {
    slug: "galle-to-yala",
    fromId: "galle",
    toId: "yala",
    viaIds: ["mirissa"],
    title: "Galle to Yala by private car",
    h1: "Galle to Yala",
    description:
      "South-coast drive from Galle Fort to Yala National Park, via Weligama or Mirissa if you want. About 3–4 hours.",
    hours: "3–4 hours",
    km: "About 140–170 km",
    bestFor: "Fort and beach, then safari",
    intro:
      "Many south-coast itineraries end at Yala. The road is coastal then inland. A driver can stop for a last swim in Mirissa or a stilt-fisher photo (be respectful; it is often staged).",
    body: [
      "Do not rush a 5 a.m. safari the morning after a late Galle dinner—sleep near the park. IslandFull lets you keep one host for the coast hop and add a return to Galle or CMB later.",
    ],
    tips: ["Tangalle and Hiriketiya sit on the way if your hotel is not actually in Yala town."],
    faqs: [
      {
        question: "Can I visit Mirissa and Yala in one day?",
        answer:
          "You can drive both, but a proper safari needs a night near the park. Swim in the morning, transfer after lunch.",
      },
    ],
  },
  {
    slug: "colombo-airport-to-arugam-bay",
    fromId: "cmb",
    toId: "arugam-bay",
    title: "Colombo Airport to Arugam Bay",
    h1: "Colombo Airport to Arugam Bay",
    description:
      "Long east-coast transfer from CMB to Arugam Bay for surf. Typically 7–9 hours by private van. Send an offer to local hosts.",
    hours: "7–9 hours",
    km: "About 320 km",
    bestFor: "Surf trips with boards and bags",
    intro:
      "Arugam Bay is the east-coast surf town. From CMB it is a full day. A van is worth it for boards. Overnighting in Sigiriya or Ella splits the pain.",
    body: [
      "Peak surf is roughly May–September on the east. In that season the east is drier while the west/south sees monsoon. Confirm your month before you burn a whole day on the road.",
      "Domestic flights to the east exist on some days; still need a last-mile driver. For most visitors a van-host from CMB or from Ella is the plan.",
    ],
    tips: [
      "Start at dawn if you land the night before in Negombo/Colombo.",
      "Return via Ella or Yala so the island is not just one long highway.",
    ],
    faqs: [
      {
        question: "Is there a closer airport to Arugam Bay?",
        answer:
          "CMB is the main international airport. Some travelers fly domestically toward the east when schedules exist, then take a host for the last miles.",
      },
    ],
  },
  {
    slug: "nuwara-eliya-to-ella",
    fromId: "nuwara-eliya",
    toId: "ella",
    title: "Nuwara Eliya to Ella transfer",
    h1: "Nuwara Eliya to Ella",
    description:
      "Short highland transfer from Nuwara Eliya to Ella, about 2–3 hours, with tea estates on the way. Private car or hop the train from Nanu Oya.",
    hours: "2–3 hours by road",
    km: "About 60–80 km of mountain road",
    bestFor: "Tea country without rushing",
    intro:
      "This is a short, pretty hop. Drivers stop at estates and viewpoints. The train from Nanu Oya to Ella is the condensed version of the famous line.",
    body: [
      "If you only ride one train in Sri Lanka, Nanu Oya–Ella is a strong pick: shorter than Colombo–Ella, still dramatic. Book seats; have a car offer ready if the railway is full.",
    ],
    tips: ["Horton Plains / World’s End is a dawn start from Nuwara Eliya, not a casual add-on on transfer day."],
    faqs: [
      {
        question: "How far is Nuwara Eliya from Ella?",
        answer: "Not far in kilometres, but mountain roads mean 2–3 hours. That is the point—tea and views.",
      },
    ],
  },
  {
    slug: "colombo-airport-to-colombo",
    fromId: "cmb",
    toId: "colombo",
    title: "Colombo Airport to Colombo city transfer",
    h1: "Colombo Airport to Colombo city",
    description:
      "CMB to Colombo city private taxi or car host. About 45–90 minutes depending on traffic. Skip the unofficial airport queue.",
    hours: "45–90 minutes",
    km: "About 30–35 km",
    bestFor: "City hotels, meetings, late-night arrivals",
    intro:
      "Bandaranaike International Airport is in Katunayake, north of the city—not in Colombo centre. Official taxis exist; touts exist too. A pre-agreed IslandFull host meets you at arrivals with a name board if you ask.",
    body: [
      "Peak traffic can double the ride. The airport expressway helps. If your hotel is in Negombo, say so—that is the closer beach town, not Colombo.",
      "For a 6 a.m. departure, leave the city with a lot of buffer. Send a return trip as a second stop: hotel → CMB.",
    ],
    tips: [
      "ATMs and SIM counters are inside arrivals.",
      "Ride-hail apps work but pickup bays confuse first-timers at 2 a.m.—a waiting host is calmer.",
    ],
    faqs: [
      {
        question: "How far is CMB from Colombo?",
        answer: "Roughly 35 km. Plan an hour, more in weekday peaks or rain.",
      },
    ],
  },
]

export function routeBySlug(slug: string) {
  return TRANSPORT_ROUTES.find((route) => route.slug === slug) || null
}

export function routeStopNames(route: TransportRoutePage) {
  const ids = [route.fromId, ...(route.viaIds || []), route.toId]
  return ids.map((id) => stopById(id)?.name || id)
}

export const GETTING_AROUND_FAQS = TRANSPORT_FAQS

export const PRIVATE_DRIVER_FAQS = [
  {
    question: "Is a private driver safe in Sri Lanka?",
    answer:
      "Use a named host and a written trip (route, date, vehicle), not a stranger in the arrivals hall. IslandFull sends your offer to listed local hosts. Meet in public airport/hotel areas and keep the trip details in the app.",
  },
  {
    question: "Car or van?",
    answer:
      "Car for 1–3 guests with normal luggage. Van for families, surfboards, or 4–8 people. Tuk-tuks are for short town hops, not highland days.",
  },
  {
    question: "Do prices include fuel and driver stay?",
    answer:
      "Host offers on IslandFull are for the trip you described. Multi-day routes should mention overnight towns in requests so the host can plan their stay. Fuel is typically in the trip price; meals for the driver are a local courtesy on long days—ask.",
  },
]

export const AIRPORT_FAQS = [
  {
    question: "Which airport do I mean by Colombo Airport?",
    answer:
      "Almost always Bandaranaike International (CMB) in Katunayake. Ratmalana (RML) is a smaller city airport. Mattala (HRI) is in the south and rarely used by long-haul visitors.",
  },
  {
    question: "Will the driver come inside the terminal?",
    answer:
      "Hosts wait at the public arrivals meeting point. Add your name, flight number, and WhatsApp in the request.",
  },
  {
    question: "Can I book a return to the airport?",
    answer:
      "Yes. Add Colombo Airport again at the end of your route so the same or another host can price the return.",
  },
]
