process.env['NODE_ENV'] = 'test';
process.env['REDIS_URL'] = 'redis://localhost:6379';
process.env['CORS_ORIGINS'] = 'http://localhost:3010';

import { describe, it, expect } from 'vitest';
import { emitToCity, emitToTribe } from '../realtime/socket.js';

// En test : _io est null (pas de vrai server) — les fonctions doivent être no-op
describe('Realtime emitters', () => {
  it('emitToCity ne crash pas si io non initialisé', () => {
    expect(() =>
      emitToCity('reims', 'new_post', { test: true }),
    ).not.toThrow();
  });

  it('emitToTribe ne crash pas si io non initialisé', () => {
    expect(() =>
      emitToTribe('tribe-123', 'new_member', { userId: 'u1' }),
    ).not.toThrow();
  });
});
