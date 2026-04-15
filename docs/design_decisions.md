# Design Decisions & Assumptions

This file captures key product decisions and the reasoning behind them, for reference during development.

---

## DD-001: Async separation of document intake and position coding

**Decision:** Document submission (intake) and position coding (analysis) are decoupled, separate workflows. Orgs submit papers on an ongoing, async basis with zero required metadata. RAF staff separately triggers coding runs when ready — not on submission.

**Rationale:**
- Topic taxonomy cannot be defined before reading the papers — the issues are too fluid and the corpus is too heterogeneous
- Orgs should not be asked to pre-tag their own positions; that requires them to anticipate RAF's analytical frame and introduces inconsistency
- Decoupling lets RAF re-code the entire corpus against a new taxonomy without re-engagement from member orgs
- Source documents become the durable record; coded outputs are derived, repeatable, and versionable

**Implication:** Intake UX for orgs is zero-friction (just submit a document). Coding UX for RAF is a periodic, human-triggered workflow.

---

## DD-002: RAF staff is the human in the loop for document coding — and that's intentional

**Decision:** The coding/analysis workflow is not fully automated. A non-technical RAF staff member initiates and guides the analysis — reviewing proposed topic taxonomies, approving coding runs, and interpreting output — rather than running on autopilot.

**Rationale:**
- The political and substantive judgment required to frame a useful topic taxonomy is inherently human — it requires understanding the coalition's current priorities, the policy landscape, and what questions matter for upcoming meetings or negotiations
- Having RAF staff in the loop creates accountability and institutional ownership of the analysis, rather than treating it as a black-box output
- It reduces the risk of the system producing a "neutral" framing that is actually politically loaded in ways RAF didn't intend
- Fully automated coding without review would erode member trust if orgs felt they were being classified without human judgment

**Constraint:** The human in the loop is explicitly assumed to be **non-technical**. The workflow must be operable without writing code, editing config files, or understanding the underlying pipeline. The interface must be plain language — something like a Google Form, a simple web UI, or a prompted Claude conversation.

**Implication:** Every step where RAF staff interacts with the system must be designable as a natural language or point-and-click interaction. This rules out CLI-only tooling and requires a lightweight operator UX layer on top of the Claude API pipeline.

---

## DD-003: Minimal UI layer for the RAF operator interface

**Decision:** Build and maintain a minimal web UI for the RAF operator (the person running coding workflows and interpreting output). This is distinct from the member org intake UX (which remains zero-friction — email or form submission).

**Rationale:**
- Chat-native (Claude Project) is lower engineering lift but harder to hand off to a different RAF hire and harder to make feel like a real product
- A minimal UI creates a more durable, institutionally legible tool — future RAF staff don't need to know how to prompt Claude, they just use the app
- "Minimal" is the key constraint: the UI should only expose what RAF staff actually needs to trigger and review coding runs, not a full dashboard

**What "minimal" means in practice:**
- Upload or link new papers to the corpus
- View unprocessed papers
- Review Claude-proposed topic taxonomy, edit if needed, approve
- Trigger a coding run
- View / export the alignment report

**What it does NOT include (for now):**
- Member org management (handled separately or manually)
- Fine-grained permissions or multi-user roles
- Analytics or historical trend views

**Implication:** Need a simple frontend (React or similar) with a backend that wraps the Claude API pipeline. The UI calls the pipeline; the pipeline does the heavy lifting. Hosting should be low-ops (Vercel, Railway, or similar).
