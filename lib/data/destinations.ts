export type Destination = {
  id: string;
  name: string;
  image_url: string;
  lat: number;
  lng: number;
  activityCount: number;
};

export const destinations: Destination[] = [
  {
    id: "galle",
    name: "Galle",
    image_url: "https://images.unsplash.com/photo-1546853020-caa2b66255a5?q=80&w=800&auto=format&fit=crop",
    lat: 6.0328,
    lng: 80.2170,
    activityCount: 14,
  },
  {
    id: "sigiriya",
    name: "Sigiriya",
    image_url: "https://images.unsplash.com/photo-1588614959060-4d144f28b207?q=80&w=800&auto=format&fit=crop",
    lat: 7.9570,
    lng: 80.7603,
    activityCount: 8,
  },
  {
    id: "yala",
    name: "Yala",
    image_url: "https://images.unsplash.com/photo-1610993302487-6db2bfdd8e2a?q=80&w=800&auto=format&fit=crop",
    lat: 6.3770,
    lng: 81.5030,
    activityCount: 12,
  },
  {
    id: "weligama",
    name: "Weligama",
    image_url: "https://images.unsplash.com/photo-1579430132386-db9a1a720dd3?q=80&w=800&auto=format&fit=crop",
    lat: 5.9739,
    lng: 80.4284,
    activityCount: 22,
  },
  {
    id: "ella",
    name: "Ella",
    image_url: "https://images.unsplash.com/photo-1569302685718-d4bc5a363a04?q=80&w=800&auto=format&fit=crop",
    lat: 6.8667,
    lng: 81.0466,
    activityCount: 18,
  },
  {
    id: "kandy",
    name: "Kandy",
    image_url: "https://images.unsplash.com/photo-1587825027984-c466e300bd1b?q=80&w=800&auto=format&fit=crop",
    lat: 7.2906,
    lng: 80.6337,
    activityCount: 15,
  }
];
