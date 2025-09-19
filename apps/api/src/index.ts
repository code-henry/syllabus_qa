import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import basicAuth from '@fastify/basic-auth';

import { askRoute } from './routes/ask.js';
import { ingestRoute } from './routes/ingest.js';
import { qaRoute } from './routes/qa.js';

export function buildServer() {
  const app = Fastify({ logger: true });

  // Plugins
  app.register(cors, { origin: process.env.CORS_ORIGIN || true });
  app.register(rateLimit, { max: 60, timeWindow: '1 minute' });
  app.register(basicAuth, {
    validate: async (username, password, req, reply) => {
      const u = process.env.BASIC_AUTH_USER || '';
      const p = process.env.BASIC_AUTH_PASS || '';
      if (username !== u || password !== p) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
    },
    authenticate: true,
  });

  // Routes
  app.register(askRoute, { prefix: '/api' });
  app.register(ingestRoute, { prefix: '/api' });
  app.register(qaRoute, { prefix: '/api' });

  return app;
}

if (import.meta.env?.PROD === false || process.env.NODE_ENV !== 'test') {
  const app = buildServer();
  const port = Number(process.env.PORT || 3001);
  app.listen({ port, host: '0.0.0.0' })
    .then(() => {
      app.log.info(`API listening on ${port}`);
    })
    .catch((err) => {
      app.log.error(err);
      process.exit(1);
    });
}
