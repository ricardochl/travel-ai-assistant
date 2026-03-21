import {
  Component, inject, signal, computed,
  ViewChild, ElementRef, AfterViewChecked,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AIService } from '../../core/services/ai.service';
import { MessageBubbleComponent } from './message-bubble/message-bubble';
import { Message } from '../../core/models/message.model';

const SYSTEM_INSTRUCTION = `Eres Travel AI, un asistente experto en viajes.
Rol: Asesor de viajes profesional con conocimiento profundo de destinos mundiales.
Comportamiento: conversacional, entusiasta, práctico. Da rangos de precio reales en USD.
Límite: solo temas de viajes y turismo. Responde siempre en el idioma del usuario.
Formato: máximo 3-4 párrafos. Emojis con moderación.`;

@Component({
  selector: 'app-chat',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MessageBubbleComponent],
  templateUrl: './chat.html',
})
export class ChatComponent implements AfterViewChecked {
  private readonly ai = inject(AIService);

  @ViewChild('messageList') private messageList!: ElementRef<HTMLDivElement>;

  messages  = signal<Message[]>([]);
  isLoading = signal(false);
  error     = signal<string | null>(null);
  inputText = signal('');

  // ChatSession keeps the conversation history in memory, turn by turn — no backend needed
  private session = this.ai.startChat(SYSTEM_INSTRUCTION);
  private shouldScroll = false;

  canSend = computed(() => this.inputText().trim().length > 0 && !this.isLoading());

  readonly suggestions = [
    '🗼 ¿Qué visitar en París en 3 días?',
    '🗻 Mejor época para ir a Japón',
    '🏖️ Playas baratas en Europa',
    '🎒 Consejos para viajar solo',
  ];

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.messageList?.nativeElement.scrollTo({ top: this.messageList.nativeElement.scrollHeight });
      this.shouldScroll = false;
    }
  }

  onEnter(event: KeyboardEvent): void {
    if (!event.shiftKey) { event.preventDefault(); this.send(); }
  }

  async send(): Promise<void> {
    const text = this.inputText().trim();
    if (!text || this.isLoading()) return;

    this.inputText.set('');
    this.error.set(null);
    this.addMessage({ role: 'user', content: text });

    // Empty placeholder for the reply — streaming fills it chunk by chunk
    const id = this.addMessage({ role: 'assistant', content: '', isStreaming: true });
    this.isLoading.set(true);

    try {
      // sendMessageStream updates the session history automatically,
      // so the model remembers previous messages with no extra work.
      const streamResult = await this.session.sendMessageStream(text);
      let full = '';

      for await (const chunk of streamResult.stream) {
        full += chunk.text();
        // Angular 21 is zoneless: updating a signal inside for-await
        // schedules change detection directly, no NgZone.run() needed
        this.patchMessage(id, full, true);
      }
      this.patchMessage(id, full, false);
    } catch (err) {
      this.patchMessage(id, '❌ Error al generar respuesta.', false);
      this.error.set(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      this.isLoading.set(false);
    }
  }

  clearChat(): void {
    this.messages.set([]);
    this.error.set(null);
    // Starting a new session clears the model's history
    this.session = this.ai.startChat(SYSTEM_INSTRUCTION);
  }

  private addMessage(data: Omit<Message, 'id' | 'timestamp'>): string {
    const id = crypto.randomUUID();
    this.messages.update(msgs => [...msgs, { id, timestamp: new Date(), ...data }]);
    this.shouldScroll = true;
    return id;
  }

  private patchMessage(id: string, content: string, isStreaming: boolean): void {
    this.messages.update(msgs =>
      msgs.map(m => m.id === id ? { ...m, content, isStreaming } : m)
    );
    this.shouldScroll = true;
  }
}
