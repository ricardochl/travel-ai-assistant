import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { Message } from '../../../core/models/message.model';
import { LoadingDotsComponent } from '../../../shared/components/loading-dots/loading-dots';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoadingDotsComponent],
  templateUrl: './message-bubble.html',
})
export class MessageBubbleComponent {
  message = input.required<Message>();

  isUser    = computed(() => this.message().role === 'user');
  isEmpty   = computed(() => this.message().isStreaming && !this.message().content);
  timestamp = computed(() =>
    new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' })
      .format(this.message().timestamp)
  );
}
