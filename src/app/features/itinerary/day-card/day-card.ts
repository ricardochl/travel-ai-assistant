import { Component, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { DayPlan } from '../../../core/models/itinerary.model';

@Component({
  selector: 'app-day-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './day-card.html',
})
export class DayCardComponent {
  day        = input.required<DayPlan>();
  isExpanded = signal(true);
  toggle()   { this.isExpanded.update(v => !v); }
}
