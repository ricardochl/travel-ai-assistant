export interface Activity {
  time: string;
  title: string;
  description: string;
  duration: string;
  cost?: string;
  tips?: string;
}

export interface Restaurant {
  name: string;
  cuisine: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  mustTry: string;
  reservationNeeded: boolean;
}

export interface DayPlan {
  day: number;
  date: string;
  theme: string;
  activities: Activity[];
  restaurant: Restaurant;
  localTip: string;
}

export interface Itinerary {
  destination: string;
  duration: number;
  days: DayPlan[];
  generalTips: string[];
  estimatedBudget: string;
}
