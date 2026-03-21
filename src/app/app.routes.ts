import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'chat', pathMatch: 'full' },
  {
    path: 'chat',
    loadComponent: () => import('./features/chat/chat').then((m) => m.ChatComponent),
  },
  {
    path: 'itinerary',
    loadComponent: () => import('./features/itinerary/itinerary').then((m) => m.ItineraryComponent),
  },
];
