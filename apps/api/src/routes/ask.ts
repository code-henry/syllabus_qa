import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { askService } from '../services/ask.js';

const AskRequest = z.object({
  question: z.string().min(1),
  context: z
    .object({ year: z.number().int().optional(), courseCode: z.string().optional() })
    .optional(),
});

export const askRoute: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post('/ask', async (req, reply) => {
    const parsed = AskRequest.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid request', details: parsed.error.flatten() });
    }
    try {
      const result = await askService(parsed.data);
      return reply.send(result);
    } catch (err: any) {
      app.log.error({ err }, 'ask failed');
      return reply.code(500).send({ error: 'ASK_FAILED' });
    }
  });
};
