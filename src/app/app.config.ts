import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { initializeApp } from 'firebase/app';
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  HarmCategory,
  HarmBlockThreshold,
} from 'firebase/ai';
import { GEMINI_MODEL } from './core/tokens/gemini.token';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

const firebaseApp = initializeApp(environment.firebaseConfig);

// Gemini Developer API backend (no-cost tier available, no billing required to start)
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    {
      provide: GEMINI_MODEL,
      useValue: getGenerativeModel(ai, {
        model: 'gemini-3.8-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          topP: 0.95,
        },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
      }),
    },
  ],
};
