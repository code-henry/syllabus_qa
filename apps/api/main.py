import os
import time
from pathlib import Path
from dotenv import load_dotenv
from typing import Any, List, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    # OpenAI SDK v1
    from openai import OpenAI
except Exception:  # pragma: no cover
    OpenAI = None  # type: ignore

# Load envs from several common locations
load_dotenv()  # current working directory
_here = Path(__file__).resolve().parent
load_dotenv(_here / ".env")  # apps/api/.env
try:
    load_dotenv(_here.parent.parent / ".env")  # repo root .env
except Exception:
    pass

app = FastAPI()

# Allow local Next.js dev by default; override with env if needed later.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AskRequest(BaseModel):
    question: str
    context_year: Optional[int] = None
    context_course_code: Optional[str] = None


class Citation(BaseModel):
    section: Optional[str] = None
    page_from: Optional[int] = None
    page_to: Optional[int] = None
    # Extended fields when coming from Assistants annotations
    file_id: Optional[str] = None
    file_name: Optional[str] = None
    quote: Optional[str] = None


class AskResponse(BaseModel):
    qaId: str
    answerMd: str
    citations: List[Citation]


@app.get("/")
def read_root():
    return {"status": "ok"}


@app.post("/ask", response_model=AskResponse)
def ask(req: AskRequest):
    qa_id = str(uuid4())

    # Fail fast if SDK not available
    if OpenAI is None:
        raise HTTPException(status_code=500, detail="OpenAI SDK not installed. Run: pip install -r apps/api/requirements.txt")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set.")

    client = OpenAI(api_key=api_key)

    assistant_id = os.getenv("OPENAI_ASSISTANT_ID")
    if assistant_id:
        # Use Assistants API with any file_search configured on the assistant.
        try:
            thread = client.beta.threads.create()
            client.beta.threads.messages.create(
                thread_id=thread.id,
                role="user",
                content=req.question,
            )
            run = client.beta.threads.runs.create(
                thread_id=thread.id,
                assistant_id=assistant_id,
            )

            # Poll until completion
            timeout_s = float(os.getenv("OPENAI_RUN_TIMEOUT", "60"))
            interval_s = float(os.getenv("OPENAI_RUN_POLL_INTERVAL", "0.5"))
            deadline = time.time() + timeout_s
            while run.status in ("queued", "in_progress", "requires_action"):
                if time.time() > deadline:
                    raise TimeoutError("Run timed out")
                if run.status == "requires_action":
                    # No tools handled in API for now
                    raise RuntimeError("Run requires tool action but none is implemented.")
                time.sleep(interval_s)
                run = client.beta.threads.runs.retrieve(
                    thread_id=thread.id, run_id=run.id
                )

            if run.status != "completed":
                raise RuntimeError(f"Run failed with status: {run.status}")

            msgs = client.beta.threads.messages.list(
                thread_id=thread.id, order="desc", limit=5
            )

            answer_parts: List[str] = []
            citation_items: List[Citation] = []
            seen_citations: set[str] = set()
            for m in msgs.data:
                if m.role != "assistant":
                    continue
                for c in m.content:
                    if getattr(c, "type", None) == "text":
                        text = getattr(c, "text", None)
                        if text and getattr(text, "value", None):
                            answer_parts.append(text.value)
                        # Parse annotations for file citations
                        annotations: List[Any] = getattr(text, "annotations", []) or []
                        for ann in annotations:
                            if getattr(ann, "type", None) == "file_citation":
                                fc = getattr(ann, "file_citation", None)
                                if fc and getattr(fc, "file_id", None):
                                    fid = fc.file_id
                                    key = f"{fid}:{getattr(ann, 'text', '')}"
                                    if key in seen_citations:
                                        continue
                                    seen_citations.add(key)
                                    fname = None
                                    try:
                                        fobj = client.files.retrieve(fid)
                                        fname = getattr(fobj, "filename", None)
                                    except Exception:
                                        pass
                                    citation_items.append(
                                        Citation(
                                            section=fname or "",
                                            file_id=fid,
                                            file_name=fname,
                                            quote=getattr(ann, "text", None),
                                        )
                                    )
                if answer_parts:
                    break

            answer_md = "\n\n".join(answer_parts) if answer_parts else ""
        except Exception as e:  # pragma: no cover
            raise HTTPException(status_code=502, detail=f"OpenAI Assistants error: {e}")

        return AskResponse(qaId=qa_id, answerMd=answer_md, citations=citation_items)
    else:
        # Fallback to Chat Completions if no assistant configured.
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        system = (
            "You are a helpful syllabus Q&A assistant. "
            "Answer concisely in Markdown. If the question requires PDF-specific context we don't have, "
            "say that the answer may be incomplete until the syllabus PDF is ingested."
        )
        try:
            resp = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": req.question},
                ],
                temperature=0.2,
            )
            answer_md = resp.choices[0].message.content or ""
        except Exception as e:  # pragma: no cover
            raise HTTPException(status_code=502, detail=f"OpenAI error: {e}")

        citations: List[Citation] = []
        return AskResponse(qaId=qa_id, answerMd=answer_md, citations=citations)
