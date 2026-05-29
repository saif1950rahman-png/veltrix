export interface CarColor {
  name: string;
  hex: string;
  priceBonus: number;
}

export interface CarSpecification {
  acceleration: string; // 0-60 mph
  topSpeed: string;
  engine: string;
  power: string; // Horsepower
  range?: string; // EV Range if applicable
}

export interface PremiumCar {
  id: string;
  brand: string;
  model: string;
  tagline: string;
  category: "Supercars" | "SUV" | "Electric" | "Sedans";
  price: number;
  featured: boolean;
  image: string;
  heroImage: string; // Dynamic reflection-backdrop render
  videoUrl?: string;
  colors: CarColor[];
  specifications: CarSpecification;
  carbonFiberOptions: string[];
  detailedDescription: string;
  year: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  comment: string;
  rating: number;
  avatar: string;
  vehicleAcquired: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
