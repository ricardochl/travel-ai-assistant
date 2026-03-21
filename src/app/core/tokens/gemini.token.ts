import { InjectionToken } from '@angular/core';
import type { GenerativeModel } from 'firebase/ai';

export const GEMINI_MODEL = new InjectionToken<GenerativeModel>('gemini.model');
