# Travel AI Assistant

Asistente de viajes construido con **Angular 21** y **Firebase AI Logic** (Gemini). Tiene dos funciones:

- **Chat** — conversación multi-turno con respuestas en streaming, el historial vive en memoria con `ChatSession`.
- **Itinerario** — genera un plan día por día (actividades, restaurante y consejos locales) como JSON tipado.

Todo el estado de la UI se maneja con **Signals** (`signal`, `computed`, `input`) en componentes standalone, `OnPush` y sin zone.js.

## Pasos del taller (tags)

Cada etapa tiene su propio tag, así puedes ver el código como quedaba en cada paso:

| Tag | Paso | Qué agrega |
|---|---|---|
| `step-0-scaffold` | Proyecto base | Angular 21, Tailwind v4, environments y modelos (`Message`, `Itinerary`) |
| `step-1-firebase-ai-logic` | Conectar Firebase AI Logic | `initializeApp` + `getAI` con `GoogleAIBackend`; el modelo Gemini se provee con el token `GEMINI_MODEL` |
| `step-2-ai-service` | Servicio de IA | `AIService` con `generateText`, `generateStream`, `generateJSON` y `startChat`, más sus tests |
| `step-3-chat` | Chat en streaming | `ChatComponent` + `MessageBubble` con Signals y `sendMessageStream` |
| `step-4-itinerary` | Itinerario | `ItineraryComponent` + `DayCard`, salida JSON con `responseMimeType` |
| `step-5-firebase-hosting` | Deploy | `firebase.json` y `.firebaserc` para Firebase Hosting |

```bash
git tag                        # ver los pasos
git checkout step-3-chat       # ir a un paso
git checkout main              # volver a la versión final
git diff step-2-ai-service step-3-chat   # ver qué cambió entre pasos
```

## Estructura

```
src/app/
├── app.config.ts              # Firebase + Gemini (token GEMINI_MODEL)
├── app.routes.ts              # /chat y /itinerary con lazy loading
├── core/
│   ├── models/                # Message, Itinerary, DayPlan…
│   ├── services/ai.service.ts # Única puerta de entrada a Firebase AI Logic
│   └── tokens/gemini.token.ts
├── features/
│   ├── chat/                  # ChatComponent + MessageBubble
│   └── itinerary/             # ItineraryComponent + DayCard
└── shared/components/loading-dots/
```

## Configuración

1. Crea un proyecto en la [consola de Firebase](https://console.firebase.google.com/).
2. Ve a **AI Logic** → **Comenzar** y elige **Gemini Developer API**.
3. En **Configuración del proyecto** → **Tus apps**, registra una app web y copia su `firebaseConfig`.
4. Pega esos valores en `src/environments/environment.ts` y `src/environments/environment.development.ts`.

```bash
npm install
npm start          # http://localhost:4200
npm test           # tests con Vitest
```

> La configuración web de Firebase no es un secreto, pero protege tu proyecto con [App Check](https://firebase.google.com/docs/ai-logic/app-check) antes de publicarlo, para que nadie más use tu cuota de Gemini.

## Deploy en Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase use --add            # elige tu proyecto (actualiza .firebaserc)
npm run build
firebase deploy --only hosting
```

## Modelo

La app usa `gemini-3.8-flash`. Para cambiarlo, edita `model` en `src/app/app.config.ts`; la lista de modelos disponibles está en la [documentación de Firebase AI Logic](https://firebase.google.com/docs/ai-logic/models).
