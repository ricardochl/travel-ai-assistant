import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AIService } from '../../core/services/ai.service';
import { DayCardComponent } from './day-card/day-card';
import { LoadingDotsComponent } from '../../shared/components/loading-dots/loading-dots';
import { Itinerary } from '../../core/models/itinerary.model';

// Pure function — easy to test and to iterate on.
// Takes `days` so the user can choose the trip length.
const buildPrompt = (destination: string, days: number) => `
Eres un experto planificador de viajes. Crea un itinerario de ${days} días para: ${destination}

Responde ÚNICAMENTE con un JSON con esta forma:
{
  "destination": "string",
  "duration": number,
  "days": [{
    "day": 1,
    "date": "Día 1 — Lunes",
    "theme": "Tema del día (5-8 palabras)",
    "activities": [{
      "time": "09:00",
      "title": "string",
      "description": "1-2 oraciones",
      "duration": "2 horas",
      "cost": "USD10-15 (opcional)",
      "tips": "consejo práctico (opcional)"
    }],
    "restaurant": {
      "name": "string",
      "cuisine": "string",
      "priceRange": "$$",
      "mustTry": "string",
      "reservationNeeded": true
    },
    "localTip": "string"
  }],
  "generalTips": ["tip1", "tip2", "tip3"],
  "estimatedBudget": "USD150-200/día por persona"
}

Reglas: exactamente ${days} días, 3-4 actividades por día, horarios realistas.
`;

@Component({
  selector: 'app-itinerary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DayCardComponent, LoadingDotsComponent],
  templateUrl: './itinerary.html',
})
export class ItineraryComponent {
  private readonly ai = inject(AIService);

  readonly maxDays = 14;

  destination = signal('');
  days        = signal(3);
  itinerary   = signal<Itinerary | null>(null);
  isLoading   = signal(false);
  error       = signal<string | null>(null);

  validDays   = computed(() => Number.isInteger(this.days()) && this.days() >= 1 && this.days() <= this.maxDays);
  canGenerate = computed(() =>
    this.destination().trim().length > 1 && this.validDays() && !this.isLoading()
  );
  totalActs   = computed(() =>
    this.itinerary()?.days.reduce((s, d) => s + d.activities.length, 0) ?? 0
  );

  readonly popular = [
    '🗼 París, Francia',   '🗻 Kioto, Japón',
    '🎭 Roma, Italia',     '🌮 Ciudad de México',
    '🏙️ Nueva York, USA',  '🏝️ Bali, Indonesia',
  ];

  readonly loadingSteps = [
    'Investigando el destino...',
    'Eligiendo las mejores actividades...',
    'Buscando restaurantes locales...',
    'Añadiendo consejos de expertos...',
  ];

  async generate(): Promise<void> {
    const dest = this.destination().trim();
    const days = this.days();
    if (!this.canGenerate()) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.itinerary.set(null);

    try {
      const result = await this.ai.generateJSON<Itinerary>(buildPrompt(dest, days));
      this.itinerary.set(result);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Error al generar el itinerario');
    } finally {
      this.isLoading.set(false);
    }
  }
}
