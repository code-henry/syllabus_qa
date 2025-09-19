import { describe, it, expect } from 'vitest';
import { askService } from '../src/services/ask.js';

describe('askService', () => {
  it('returns markdown and citations', async () => {
    const res = await askService({ question: '履修登録の締切は？' });
    expect(res.answerMd).toBeTypeOf('string');
    expect(Array.isArray(res.citations)).toBe(true);
    expect(res.qaId).toBeTypeOf('string');
  });
});
