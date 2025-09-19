Syllabus-QA (Work in Progress)

Overview
- Web: Next.js (App Router, shadcn/ui)
- API: FastAPI (Python) with OpenAI (Assistants or Chat Completions)
- Goal: Ask questions about your syllabus PDF with sources (citations).

Quick Start
- API
  - Create apps/api/.env with:
    - See apps/api/.env.example
  - pip install -r apps/api/requirements.txt
  - Run: uvicorn apps.api.main:app --reload --port 8000 (run at repo root)
- Web
  - cd apps/web
  - npm install
  - npm run dev
  - Open http://localhost:3000/ask

Features
- Ask (/ask): Calls API POST /ask and shows Markdown answer and citations.
- API POST /ask:
  - If OPENAI_ASSISTANT_ID is set: uses Assistants (Threads/Runs) and extracts file citations from annotations.
  - Else: falls back to Chat Completions.

Notes
- CORS allows http://localhost:3000 and http://127.0.0.1:3000.
- To target http://127.0.0.1:8000 from web, set NEXT_PUBLIC_API_URL.

Development Quality
- API tooling: ruff (lint), mypy (type-check), pytest (tests)
- Web CI: eslint, type-check, build
- See .github/workflows/* for CI setup.

Next Steps
- /api/ingest: Upload PDF to Vector Store (Assistants file_search) and attach.
- Persist Q&A to DB and implement search/detail pages.
