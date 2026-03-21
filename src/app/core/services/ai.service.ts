import { Injectable, inject } from '@angular/core';
import type { GenerativeModel, ChatSession } from 'firebase/ai';
import { GEMINI_MODEL } from '../tokens/gemini.token';

/**
 * AIService — thin abstraction over the Firebase AI Logic SDK.
 *
 * The model is configured in app.config.ts and arrives through DI,
 * so components never talk to Firebase directly.
 *
 * generateText   → full response (short answers, classification)
 * generateStream → real-time chunks through an AsyncGenerator (chat)
 * generateJSON   → typed JSON response (itineraries)
 * startChat      → multi-turn session with in-memory history, no backend
 */
@Injectable({ providedIn: 'root' })
export class AIService {
  private readonly model: GenerativeModel = inject(GEMINI_MODEL);

  async generateText(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      throw this.normalize(err);
    }
  }

  // An AsyncGenerator lets components consume the stream with for-await-of.
  // Angular 21 is zoneless: signals updated inside the loop refresh the DOM,
  // no NgZone.run() needed.
  async *generateStream(prompt: string): AsyncGenerator<string> {
    try {
      const result = await this.model.generateContentStream(prompt);
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) yield text;
      }
    } catch (err) {
      throw this.normalize(err);
    }
  }

  // Asks Gemini for JSON output (responseMimeType) while keeping the model's
  // other generation settings, then parses it into the expected type.
  async generateJSON<T>(prompt: string): Promise<T> {
    let raw: string;
    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          ...this.model.generationConfig,
          responseMimeType: 'application/json',
        },
      });
      raw = result.response.text();
    } catch (err) {
      throw this.normalize(err);
    }

    try {
      // Safety net in case the model still wraps the JSON in a markdown fence
      const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      return JSON.parse(clean) as T;
    } catch {
      throw new Error('Gemini no retornó JSON válido. Intenta de nuevo.');
    }
  }

  // Multi-turn session: history lives in client memory and is lost on reload.
  // The system instruction goes into startChat() as a { parts, role } object.
  startChat(systemInstruction: string): ChatSession {
    return this.model.startChat({
      systemInstruction: {
        parts: [{ text: systemInstruction }],
        role: 'system',
      },
      history: [],
    });
  }

  // Maps SDK errors to user-friendly messages (shown in the UI).
  private normalize(err: unknown): Error {
    if (!(err instanceof Error)) return new Error('Error desconocido con Gemini.');
    if (err.message.includes('RESOURCE_EXHAUSTED'))
      return new Error('Cuota agotada. Espera un momento e intenta de nuevo.');
    if (err.message.includes('SAFETY'))
      return new Error('La solicitud fue bloqueada por filtros de seguridad.');
    if (err.message.includes('UNAUTHENTICATED'))
      return new Error('Error de autenticación. Verifica tu configuración de Firebase.');
    return err;
  }
}
