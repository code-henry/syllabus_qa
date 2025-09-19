Syllabus-QA

Syllabus-QA is a monorepo for a Q&A and knowledge base built on top of a university syllabus guidance PDF. Answers include citations (section and page range) and are searchable.

- Apps: apps/web (Next.js), apps/api (Fastify)
- DB: PostgreSQL via Prisma
- AI: OpenAI Assistants API with file_search and Vector Store
- CI: GitHub Actions (lint, test, build)

Local Development
- Requirements: Node 20+, npm 10+
- Install: run npm install separately in each app folder initially
- Env: copy .env.example to .env in each app and fill required values
- DB: PostgreSQL; adjust DATABASE_URL for your environment

Security & Compliance
- Secrets are not committed. Use GitHub Actions Secrets for CI.
- /api/ingest is protected (Basic Auth placeholder; replace with SSO later).
- We do not redistribute the PDF; we link to the original.

Next Steps
- Create OpenAI Assistant and Vector Store; record IDs as secrets
- Run initial ingestion for the 2022 PDF
- Iterate on prompt and retrieval quality
