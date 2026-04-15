# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This is a prototype for the **Recode America Fund (RAF)** field-building initiative. The goal is to build the "perfect intern" for coalition coordination — a tool (or set of tools) that helps a small RAF staff (possibly one person) do the work that currently falls entirely on human coalition coordinators:

1. **Position mapping** — surface where member organizations agree and diverge on policy topics (civil service reform, government technology, etc.), derived from their position papers and public statements
2. **Document synthesis** — help orgs understand the field landscape without reading every peer org's publications
3. **Relationship brokering** — broker introductions between orgs, prepare meeting briefs, track relationship context
4. **Meeting operations** — disseminate notes, send reminders, surface action items

Key constraint: constituent organizations span wildly different geographies, political ideologies, and tech capacities. The system must be accessible to low-tech orgs and maintainable by one person at RAF. It should build on existing platforms (Claude, Google Drive, etc.) rather than require custom software deployment.

## Research Foundation

`docs/policy_coalition_fieldbuilding_user_research.md` — Full user research brief with findings, pain points, and user journey maps for both Coalition Director and Member Organization Staff personas. Read this before making product or architecture decisions. Key findings that should drive design choices:

- No existing tool addresses cross-org position alignment mapping (Quorum, NationBuilder, CiviCRM all focus on constituent/legislative tracking, not peer-org comparison)
- Coalition coordinators are the human CRM — staff turnover destroys institutional memory
- Tech capacity gaps create two-tier participation; the solution must work over email/phone for low-tech orgs
- Only 30% of nonprofit advocacy orgs use AI (Quorum 2024), so AI-forward UX must have graceful low-tech fallbacks
- Orgs are protective of their data — any cross-org sharing mechanism needs to handle turf concerns carefully

## What's Built

### Screens
- `/library` — Document Library: upload PDFs per org, see embedded status
- `/detect` — Issue Area Detection: run Claude on the corpus to detect 5-10 policy issue areas, create briefs from results
- `/briefs` — Brief list: all briefs with approval status
- `/briefs/[id]` — Brief Builder: edit topic questions, include/exclude similar docs via vector search, approve brief
- `/codebook/[briefId]` — Codebook: view and download the AI-generated coding guide
- `/coding` — Coding Dashboard: run async Batch API coding on approved briefs, poll status
- `/alignment/[briefId]` — Alignment View: org × question grid, click cells for quotes, side-by-side org comparison, generate field narrative

### API Routes
- `POST /api/ingest` — extract PDF text, embed with Voyage, store in Supabase Storage + DB
- `POST /api/detect` — run Claude with extended thinking on full corpus to detect issue areas
- `GET/POST /api/organizations` — list and create organizations
- `GET /api/documents` — list all documents with org join
- `GET/POST /api/briefs` — list and create briefs (creates issue_area + embedding)
- `GET/PATCH /api/briefs/[id]` — fetch or update a brief
- `GET/PATCH /api/briefs/[id]/documents` — vector-search similar docs, toggle include/exclude
- `POST /api/briefs/[id]/approve` — generate codebook with Claude, mark approved
- `POST /api/coding` — submit Anthropic Batch API job for all included docs
- `GET /api/coding/[briefId]` — poll batch status, save codings when complete
- `GET /api/codings/[briefId]` — fetch all codings for alignment view
- `POST /api/report/[briefId]` — generate field landscape narrative with Claude

### Data Model
See `supabase/migrations/001_initial.sql` — tables: organizations, documents, issue_areas, briefs, brief_documents, codings, first_pass_results. Uses pgvector (1024-dim) with ivfflat index and a `match_documents` RPC function for cosine similarity search.

## Local Development

1. Copy `.env.local.example` to `.env.local` and fill in all keys
2. Create a Supabase project at supabase.com
3. Run the migration: paste `supabase/migrations/001_initial.sql` into the Supabase SQL editor
4. Enable pgvector extension in Supabase (Dashboard → Extensions → vector)
5. Create a Storage bucket named `documents` (public or private with service role access)
6. Get a Voyage AI API key at voyageai.com (use voyage-3-lite model)
7. `npm install && npm run dev` — runs at http://localhost:3000

## Tech Stack
- Next.js 16 App Router (TypeScript)
- Supabase (Postgres + pgvector + Storage)
- Anthropic SDK claude-sonnet-4-6 (Batch API + extended thinking)
- Voyage AI voyage-3-lite for embeddings
- pdf-parse for PDF text extraction
- shadcn/ui + Tailwind CSS
- Vercel deployment target
