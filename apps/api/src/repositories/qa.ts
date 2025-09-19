import { prisma } from './prisma.js';
import type { Prisma } from '@prisma/client';

export async function saveQA(input: {
  question: string;
  answerMd: string;
  year?: number;
  courseCode?: string;
  citations: { section?: string | null; page_from?: number | null; page_to?: number | null }[];
}) {
  const created = await prisma.qA.create({
    data: {
      question: input.question,
      answerMd: input.answerMd,
      year: input.year ?? null,
      courseCode: input.courseCode ?? null,
      citations: {
        createMany: {
          data: input.citations.map((c) => ({
            section: c.section ?? null,
            pageFrom: c.page_from ?? null,
            pageTo: c.page_to ?? null,
          })),
        },
      },
    },
  });
  return created;
}

export async function searchQA(query: string, page: number, pageSize: number) {
  const where: Prisma.QAWhereInput = query
    ? {
        OR: [
          { question: { contains: query } },
          { answerMd: { contains: query } },
          { tags: { has: query } },
        ],
      }
    : {};

  const [total, items] = await Promise.all([
    prisma.qA.count({ where }),
    prisma.qA.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, question: true, createdAt: true, viewCount: true, tags: true },
    }),
  ]);

  return { total, page, pageSize, items };
}

export async function findQAById(id: string) {
  return prisma.qA.findUnique({ where: { id }, include: { citations: true } });
}
