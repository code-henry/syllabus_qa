import { FastifyInstance, FastifyPluginAsync } from 'fastify';

export const ingestRoute: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post('/ingest', { onRequest: app.basicAuth }, async (_req, reply) => {
    // NOTE: Placeholder implementation to be wired to OpenAI Files + Vector Store
    // Accept multipart in future; for now, return a stub response
    return reply.send({ vectorStoreId: 'TBD', fileId: 'TBD', status: 'queued' });
  });
};
