import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loading-dots',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-1 py-1" aria-label="Generando...">
      <span class="w-1.5 h-1.5 rounded-full bg-current opacity-40 animate-bounce [animation-delay:0ms]"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-current opacity-40 animate-bounce [animation-delay:150ms]"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-current opacity-40 animate-bounce [animation-delay:300ms]"></span>
    </div>
  `,
})
export class LoadingDotsComponent {}
