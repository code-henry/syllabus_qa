import { findQAById, searchQA } from '../repositories/qa.js';

export async function listQA(query: string, page: number) {
  const pageSize = 20;
  return searchQA(query, page, pageSize);
}

export async function getQAById(id: string) {
  return findQAById(id);
}
