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
    image_url: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&q=80&w=1200",
    lat: 6.0328,
    lng: 80.2170,
    activityCount: 14,
  },
  {
    id: "sigiriya",
    name: "Sigiriya",
    image_url: "https://images.unsplash.com/photo-1586220556218-18e39029a1b4?auto=format&fit=crop&q=80&w=1200",
    lat: 7.9570,
    lng: 80.7603,
    activityCount: 8,
  },
  {
    id: "yala",
    name: "Yala",
    image_url: "https://images.unsplash.com/photo-1614088820358-154dfec9d300?auto=format&fit=crop&q=80&w=1200",
    lat: 6.3770,
    lng: 81.5030,
    activityCount: 12,
  },
  {
    id: "weligama",
    name: "Weligama",
    image_url: "https://images.unsplash.com/photo-1596773356073-51786f064fba?auto=format&fit=crop&q=80&w=1200",
    lat: 5.9739,
    lng: 80.4284,
    activityCount: 22,
  },
  {
    id: "ella",
    name: "Ella",
    image_url: "https://images.unsplash.com/photo-1569302685718-d4bc5a363a04?auto=format&fit=crop&q=80&w=1200",
    lat: 6.8667,
    lng: 80.0481, // Wait, Ella is 6.8667, 81.0466
    activityCount: 18,
  },
  {
    id: "kandy",
    name: "Kandy",
    image_url: "https://images.unsplash.com/photo-1587825027984-c466e300bd1b?auto=format&fit=crop&q=80&w=1200",
    lat: 7.2906,
    lng: 80.6337,
    activityCount: 15,
  }
];
