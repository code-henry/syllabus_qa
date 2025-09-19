import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { listQA, getQAById } from '../services/qa.js';

export const qaRoute: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/qa', async (req, reply) => {
    const { query = '', page = '1' } = (req.query as any) || {};
    const pageNum = Math.max(parseInt(String(page)) || 1, 1);
    const data = await listQA(String(query), pageNum);
    return reply.send(data);
  });

  app.get('/qa/:id', async (req, reply) => {
    const id = (req.params as any).id as string;
    const qa = await getQAById(id);
    if (!qa) return reply.code(404).send({ error: 'NOT_FOUND' });
    return reply.send(qa);
  });
};
