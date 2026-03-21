import { TestBed } from '@angular/core/testing';
import { AIService } from './ai.service';
import { GEMINI_MODEL } from '../tokens/gemini.token';

// Minimal fake of the Firebase GenerativeModel — tests never call the real API.
function createFakeModel(responseText: string) {
  return {
    generationConfig: { temperature: 0.7 },
    generateContent: vi.fn(async () => ({ response: { text: () => responseText } })),
    generateContentStream: vi.fn(async () => ({
      stream: (async function* () {
        for (const word of responseText.split(' ')) yield { text: () => word };
      })(),
    })),
    startChat: vi.fn(() => ({})),
  };
}

function setup(responseText = '') {
  const model = createFakeModel(responseText);
  TestBed.configureTestingModule({
    providers: [{ provide: GEMINI_MODEL, useValue: model }],
  });
  return { service: TestBed.inject(AIService), model };
}

describe('AIService', () => {
  it('should be created', () => {
    expect(setup().service).toBeTruthy();
  });

  it('generateText returns the response text', async () => {
    const { service } = setup('Hola viajero');
    await expect(service.generateText('hola')).resolves.toBe('Hola viajero');
  });

  it('generateStream yields every chunk', async () => {
    const { service } = setup('uno dos tres');
    const chunks: string[] = [];
    for await (const chunk of service.generateStream('cuenta')) chunks.push(chunk);
    expect(chunks).toEqual(['uno', 'dos', 'tres']);
  });

  it('generateJSON requests JSON and keeps the model settings', async () => {
    const { service, model } = setup('{"destination":"Roma"}');
    const result = await service.generateJSON<{ destination: string }>('itinerario');

    expect(result.destination).toBe('Roma');
    const request = (model.generateContent.mock.calls[0] as unknown[])[0] as {
      generationConfig: Record<string, unknown>;
    };
    expect(request.generationConfig).toEqual({
      temperature: 0.7,
      responseMimeType: 'application/json',
    });
  });

  it('generateJSON strips a markdown fence if present', async () => {
    const { service } = setup('```json\n{"ok":true}\n```');
    await expect(service.generateJSON<{ ok: boolean }>('x')).resolves.toEqual({ ok: true });
  });

  it('generateJSON fails with a friendly message on invalid JSON', async () => {
    const { service } = setup('esto no es JSON');
    await expect(service.generateJSON('x')).rejects.toThrow('Gemini no retornó JSON válido');
  });

  it('maps quota errors to a friendly message', async () => {
    const { service, model } = setup();
    model.generateContent.mockRejectedValueOnce(new Error('429 RESOURCE_EXHAUSTED'));
    await expect(service.generateText('x')).rejects.toThrow('Cuota agotada');
  });

  it('startChat passes the system instruction', () => {
    const { service, model } = setup();
    service.startChat('Eres Travel AI');
    expect(model.startChat).toHaveBeenCalledWith({
      systemInstruction: { parts: [{ text: 'Eres Travel AI' }], role: 'system' },
      history: [],
    });
  });
});
