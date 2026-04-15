# RAF Field Builder: Product Requirements Document

## Executive Summary

RAF Field Builder is a web application designed to solve a critical coordination problem for the Recode America Fund (RAF) and other policy advocacy coalitions: making sense of where coalition member organizations stand on policy issues without requiring extensive manual synthesis and synthesis labor.

The tool works by ingesting position papers that member organizations submit, then using AI-powered analysis to extract verbatim quotes showing each organization's stance on specific policy questions. Rather than giving RAF staff a quantified "alignment score" or abstract summary, the tool shows RAF staff what organizations actually said, organized by topic. This preserves the nuance and context of each org's position while making it visible in one place.

RAF Field Builder is built for a single non-technical user (a coalition coordinator or small staff member) to operate independently. Member organizations never log in—they just submit PDFs. The tool automates the cognitive heavy lifting of reading and cross-referencing multiple policy documents, freeing RAF staff to focus on relationship-building, negotiation, and strategic decision-making.

---

## Problem Statement

### The Coordination Crisis

Policy advocacy coalitions like RAF face a consistent, unsolved problem: they cannot easily answer the question "Where do our member organizations actually stand on this policy question?" This creates cascading failures in coalition operations:

- **No shared position record**: Coalition coordinators maintain alignment knowledge in their heads; when they leave, institutional memory disappears
- **Document synthesis is fully manual**: Position papers pile up in shared drives. Extracting alignment/divergence requires humans to read and mentally map each document
- **Meetings are underprepared**: Cross-org meetings happen without participants knowing peer organizations' public positions, leading to duplicated conversations and missed opportunities for alignment
- **Uneven participation**: Tech capacity gaps mean small organizations are systematically excluded from the document trails and relationship networks that large orgs navigate
- **Turf protection blocks sharing**: Organizations resist centralized position mapping, fearing their data will be shared without consent

### Research Foundation

RAF Field Builder is motivated by systematic user research on policy coalition field-building practices, which revealed seven critical findings:

1. **No tool exists for cross-org position tracking** — The tools that exist (Quorum, NationBuilder, CiviCRM) focus on constituent and legislative tracking, not peer-organization alignment mapping

2. **Position synthesis is the dominant staff burden** — 47% of nonprofit advocacy professionals cite understaffing as their biggest challenge; position paper synthesis is one of the largest drivers

3. **Relationship brokering is entirely manual and person-dependent** — Meeting prep and introductions depend on the coordinator knowing everyone and everything; no system captures this institutional knowledge

4. **Tech capacity gaps create a two-tier coalition dynamic** — Large orgs with sophisticated systems are full participants; small orgs are systematically excluded from coordination workflows

5. **Ideological heterogeneity requires tooling support** — "Strange bedfellows" coalitions with diverse political membership need help identifying where shared interests actually overlap

6. **Turf protection is structural** — Organizations are legitimate wary of centralized relationship mapping; any system must give RAF staff full control over what gets shared

7. **Staff burnout is endemic** — Coalition coordinators describe feeling always-on; coordination work is person-intensive with no automation layer

---

## User Personas

### Persona 1: Coalition Director / RAF Staff (Primary Operator)

**Profile**: A non-technical nonprofit staff member, typically with 3-7 years of coalition experience but no coding knowledge. Works alone or with one part-time coordinator. Spends 50-70% of time on coalition operations: reading documents, preparing meeting briefs, brokering introductions, tracking position shifts.

**Key Goals**:
- Understand where member organizations align and diverge on policy issues
- Prepare members for cross-org meetings by briefing them on peer org positions
- Maintain an institutional record of coalition position landscape that survives staff turnover
- Do all of this with minimal technical setup and without requiring member orgs to do extra work

**Pain Points**:
- Drowning in position papers; can't synthesize fast enough to keep up with coalition pace
- No system to track where agreements/disagreements exist; relies on personal memory
- Meeting prep is bespoke and time-consuming for each relationship
- Can't prove to funders what the coalition accomplished because there's no record of position evolution

**Access Pattern**: Uses the tool 2-4 times per week; primarily during pre-meeting prep cycles and when new member orgs join

---

### Persona 2: Member Organization Staff (Passive Participant)

**Profile**: Staff at a coalition member organization (research director, policy lead, or advocacy coordinator) who participates in coalition activities. Never logs into the RAF tool but is aware it exists and curious about what gets shared.

**Key Goals**:
- Understand who the other coalition members are and where they stand
- Be prepared for cross-org meetings without being surprised by peer positions
- Know that their organization's position won't be misrepresented or shared without consent
- Participate even if they use low-tech tools (email, phone)

**Pain Points**:
- No way to know peer org positions before meetings; shows up underprepared
- Concerned about data sharing and whether their position will be accurately represented
- No structured briefing on other orgs in the coalition; relationship context is vague
- Tech barriers prevent participation if they don't use shared platforms

**Access Pattern**: Learns about coalition positions through RAF-prepared briefings; may see a final report that RAF decides to share

---

## Core Features

### Feature 1: Document Library (Intake Portal)

**Purpose**: Collect position papers from coalition members with zero friction and metadata consistency.

**User Story**:
> As a coalition member, I want to submit my organization's position paper without having to fill out forms or provide metadata, so that our voice is included in the coalition record without extra burden.

**Implementation**:
- Simple upload form: select organization (or create new), title the document, upload PDF
- RAF staff can add new organizations on the fly while uploading
- Documents automatically extract text via PDF parsing
- Extracted text is embedded using Voyage AI for semantic search later
- Member orgs can submit multiple documents; RAF tracks them all with submission date

**Acceptance Criteria**:
- Non-technical RAF staff can upload a PDF and title it in under 2 minutes
- Text extraction works for 95%+ of policy-quality PDFs
- Embedding completes automatically; RAF sees "embedded" status in the document list
- RAF can add new organizations while uploading without leaving the form

---

### Feature 2: Issue Area Detection

**Purpose**: Automatically surface the main policy topics that coalition members are discussing, so RAF staff doesn't have to manually define a taxonomy.

**User Story**:
> As a coalition director, I want Claude to read my entire document corpus and tell me what policy topics member organizations are addressing, so I can build analysis around what matters to the coalition rather than my preconceptions.

**Implementation**:
- RAF staff clicks "Detect Issue Areas from Corpus"
- Claude reads all documents and surface 5-10 major policy topic areas (e.g., "Civil Service Reform", "AI Governance", "Procurement Modernization")
- Claude provides a short description for each area
- RAF staff can edit area names/descriptions before proceeding
- Issue areas are saved for use in briefs

**Acceptance Criteria**:
- Detection completes in under 60 seconds for a corpus of 10+ documents
- Claude identifies substantively different policy topics (not repetitive)
- RAF staff can edit detected areas before saving
- Saved areas appear in the Brief creation interface

---

### Feature 3: Brief & Coding Workflow

**Purpose**: Define a specific policy question, identify relevant documents, and extract verbatim quotes from each organization showing their stance.

**User Story**:
> As a coalition director, I want to:
> 1. Choose a policy issue area
> 2. Write specific policy questions I want to understand (e.g., "Should civil service rules be reformed?" / "How should pay equity be addressed?")
> 3. Have Claude find relevant documents via semantic search
> 4. Review the document shortlist and remove anything off-topic
> 5. Trigger a coding run that extracts direct quotes for each question
> 6. View the results in a grid showing which orgs addressed each question

**Subfeature 3.1: Create Brief & Write Topic Questions**
- RAF staff selects an issue area
- Creates a new brief version
- Writes 3-7 specific policy questions they want to understand org stances on
- Questions are plain language, not jargon (e.g., "Should federal IT modernization focus on legacy system replacement or gradual migration?")

**Subfeature 3.2: Semantic Document Search & Approval**
- System uses Voyage embeddings to find documents semantically similar to the topic questions
- Displays shortlist of documents with similarity scores
- RAF staff can include/exclude documents from the coding run (e.g., remove a document that's about a different issue)
- RAF approves the shortlist before proceeding

**Subfeature 3.3: Coding Run**
- RAF clicks "Run Coding" on an approved brief
- Claude (via Batch API for cost efficiency) reads each approved document
- For each topic question, Claude extracts verbatim quotes showing the organization's stance (or indicates "not addressed" if the org didn't address this question)
- Results are stored in the database, versioned with the brief

**Acceptance Criteria**:
- Non-technical RAF staff can write topic questions in plain language without guidance
- Vector search finds 80%+ of genuinely relevant documents
- RAF staff can include/exclude documents with one click per document
- Coding run completes within 2-5 minutes for a typical brief (10 documents, 5 questions)
- Quotes are verbatim excerpts from source documents (not paraphrased)

---

### Feature 4: Alignment Grid & Quote Viewing

**Purpose**: Give RAF staff a simple, scannable view of organization positions with the ability to drill down into verbatim quotes.

**User Story**:
> As a coalition director, I want to see a table with policy questions down the left side and organizations across the top, with cells showing which orgs addressed each question. When I click a cell, I see the actual verbatim quote that organization provided.

**Implementation**:
- Grid view: rows = policy questions, columns = organizations
- Each cell shows:
  - "✓" if org addressed the question (with quote)
  - "—" if org didn't address it
  - Hover shows first 50 chars of quote
- Click a cell → see full quote in a side panel
- Click quote → link to original document in library
- PDF/CSV export of the grid for external sharing

**Acceptance Criteria**:
- Grid loads instantly even for 20+ documents and 7+ questions
- Quotes are fully legible and clearly attributed to the source document and organization
- Export to PDF/CSV preserves quote legibility
- RAF staff can use this to brief member orgs without re-reading position papers

---

### Feature 5: Codebook (Transparency Document)

**Purpose**: Create a public-facing document explaining what was analyzed, how, and why—so member organizations understand what the coalition did and can verify accuracy.

**User Story**:
> As a coalition director, I want to create a document that explains the analysis process (what questions we asked, which documents we reviewed, what we were looking for), so member organizations feel confident we did this work honestly and can spot any misinterpretations.

**Implementation**:
- Auto-generated codebook includes:
  - Issue area name and description
  - Policy questions used
  - List of documents reviewed (org + title + date)
  - Explanation of methodology (e.g., "We asked Claude to extract verbatim quotes...")
  - Full results table (org × question grid with all quotes)
- RAF staff can edit the codebook before sharing
- Codebook is downloadable as PDF and intended for external distribution

**Acceptance Criteria**:
- Codebook generates automatically after a coding run completes
- Content is accessible to a non-specialist (explains jargon)
- Includes full attribution (which documents, which orgs)
- PDF export is readable and visually clear

---

### Feature 6: Meeting Briefing Preparation

**Purpose**: Help RAF staff prepare member organizations for cross-org meetings by providing context on who they'll meet and what those orgs have publicly stated.

**User Story**:
> As a coalition director, I want to prepare a briefing note for Org A about an upcoming meeting with Org B, including what Org B has publicly said on the key issues, so Org A walks in informed and the conversation can be more substantive.

**Implementation**:
- RAF staff selects two organizations and an issue area
- System generates a briefing note showing:
  - Org B's stated positions on the key questions
  - Areas of likely agreement and divergence with Org A
  - Suggested conversation framings to highlight shared interests
- RAF staff can edit and customize before sending to Org A
- Briefing is sent via email or downloaded as a document

**Acceptance Criteria**:
- Briefing generates in under 30 seconds
- Accurately reflects each org's positions from the coded data
- Includes enough context for a non-specialist to understand the briefing

---

## Design Principles

### 1. Quote-First, Not Score-First

All analysis is grounded in verbatim organization language. We never quantify or score positions (e.g., "Org A is 70% aligned with Org B"). This preserves nuance and prevents RAF from inadvertently misrepresenting organizations through abstraction.

### 2. Human-in-the-Loop, But Non-Technical

The RAF operator guides the analysis (defining questions, approving documents, interpreting output) without writing code or understanding the underlying AI pipeline. The system is operable via web forms and plain language.

### 3. Zero-Friction Member Org Intake

Coalition members submit documents once and never interact with the tool again. No login, no metadata forms, no platform learning curve. This keeps tech capacity from determining who participates.

### 4. Institutional Memory First

The system is designed to survive staff turnover. All decisions (taxonomy, questions, document selections) are versioned and stored. A new RAF hire can pick up a brief and understand every choice that was made.

### 5. Explicit Data Boundaries

Member organizations never see each other's data unless RAF explicitly decides to share it. The system is not a member-facing collaboration platform. RAF controls all cross-org visibility.

### 6. Maintainable by One Person

The product and infrastructure are designed so that one non-technical RAF staff member can operate and maintain the system indefinitely. No complex DevOps, no specialized training.

---

## Product Pipeline (Non-Technical Overview)

### The Workflow

1. **Submission Phase**: Member organizations submit position papers via a simple web form or email attachment. RAF staff uploads them, titles them, and moves on.

2. **Corpus Building**: Over days/weeks, RAF accumulates position papers from coalition members. All documents are automatically processed: text is extracted, embedded into vectors (numerical representations for semantic similarity search), and stored.

3. **Issue Detection Phase**: When RAF is ready to do analysis, they click a button and Claude reads the entire corpus, identifying 5-10 major policy topics that organizations are discussing.

4. **Brief Creation**: RAF selects one issue area and writes 3-7 specific policy questions they want to explore (e.g., "Should the federal government prioritize IT system replacement or gradual modernization?").

5. **Document Shortlisting**: The system uses semantic search to find documents relevant to the policy questions. RAF reviews the shortlist and removes anything off-topic.

6. **Coding Run**: RAF approves the shortlist and triggers a coding run. Claude reads each document and, for each policy question, extracts verbatim quotes showing that organization's stance. If an organization didn't address a question, that's noted as "not addressed."

7. **Results & Sharing**: RAF sees the Alignment Grid—a simple table showing which orgs addressed which questions, with quotes visible on click. RAF can generate a Codebook (transparency document) and share findings with member organizations, knowing that quotes are verbatim and sourced.

### Why This Approach

- **Async workflow**: Documents come in continuously; analysis happens in batches when RAF is ready
- **Human judgment**: RAF defines what questions matter, not the system
- **Verifiable output**: Every quote is traceable back to source document and organization
- **Scalable**: Works with 5 documents or 50; cost scales with work done, not system complexity

---

## What's Out of Scope for V1

The following valuable features are explicitly deferred:

- **Member organization portal**: Orgs cannot log in or see analysis results directly
- **Multi-user roles and permissions**: No fine-grained access control; tool is single-operator
- **Relationship network visualization**: No graphs of "who knows who" or "who coordinates with whom"
- **Position timeline tracking**: No visualization of how org positions evolve over time
- **Automated meeting scheduling and attendance**: No integration with calendar systems
- **Feedback loop from member orgs**: No mechanism for orgs to correct or flag misinterpretations
- **AI-generated talking points or position summaries**: Output is always verbatim quotes, never AI-written recommendations
- **Advanced filtering and cross-tabulation**: The alignment grid is basic; no dynamic pivot tables or complex queries
- **Analytics and impact measurement**: No dashboards tracking coalition-wide metrics or meeting outcomes

These features are valuable but would add complexity that conflicts with the maintainability constraint. They can be revisited in later versions once the core tool is proven and the operator workflow is stable.

---

## How Features Map to Research Findings

This section traces each major user research finding to the specific product decision it motivated, including the evidence that drove the choice.

### Finding 1: No standardized system exists for tracking cross-org policy position alignment

**Research Evidence**:
- Quote: "Members don't know who the members are; where they stand on the issue; what they are doing to further the network's purpose; or how to contact them" (Activist Handbook, coalition challenges)
- Gap: No existing tool (Quorum, NationBuilder, CiviCRM) addresses cross-org position mapping

**Product Decision → Features**:
- **Alignment Grid**: The core output—a table showing organizations × policy questions with verbatim quotes—directly addresses the need for a shared, scannable record of member org positions
- **Codebook**: By creating a versioned, auditable record of what questions were asked and what evidence supports each finding, we create institutional memory that survives staff turnover
- **Document Library**: By storing every org submission in one place with extraction/embedding, we create a durable corpus that RAF staff can re-analyze without re-engaging member orgs

---

### Finding 2: Position synthesis across a multi-org coalition is staff-intensive and cognitively expensive

**Research Evidence**:
- Stat: 47% of nonprofit advocacy professionals cite understaffing as the biggest challenge (Quorum 2024)
- Quote: Coalitions need "capacity for shared communications, tools, and connections; for strategizing across multiple organizations; for bridging differences to catalyze bigger tents of aligned interest" — and these remain chronically underfunded (TCC Group / Gates Foundation 2021)
- Context: Position paper synthesis is entirely manual, requiring individual staff cognition; no tooling exists to surface alignment or flag contradictions

**Product Decision → Features**:
- **Automated document extraction and embedding**: Rather than RAF staff manually reading every document, the system extracts text and creates numerical representations for semantic search
- **Semantic document search**: When RAF defines topic questions, the system automatically finds related documents rather than requiring manual document review
- **Claude-powered position coding**: Rather than RAF staff manually reading documents and extracting quotes, Claude does the reading and quote extraction, following RAF's framing
- **Alignment Grid**: Organizes findings into a scannable table format instead of prose summaries, reducing cognitive load on RAF staff reviewing results
- **Batch API for cost efficiency**: Coding runs use Claude's Batch API, which processes large volumes of documents more cost-effectively than real-time API calls, enabling RAF to run analysis more frequently

**Expected Impact**: Reduces the per-brief analysis labor from 8-12 hours to 30-60 minutes for RAF staff

---

### Finding 3: Coalition relationship brokering depends almost entirely on individual coordinators

**Research Evidence**:
- Insight: "Initial contact can be established by internal coalition brokers, who introduce actors to each other and thereby create the seed beds for coordination and coalition building" (Policy Studies Journal, ACF review)
- Gap: "When that staff member leaves, institutional relationship knowledge disappears" (field-building research)
- Context: Coalition director job descriptions describe "convene, organize, and facilitate coalition and other stakeholder/partner meetings" as a major responsibility, but lack tooling for pre-meeting preparation

**Product Decision → Features**:
- **Brief versioning and history**: Every policy analysis brief is versioned, so RAF staff can see what questions were asked in the past and reuse successful framing for new meetings
- **Alignment Grid with quote drill-down**: Enables RAF to prepare members for cross-org meetings by showing exactly what peer organizations said, rather than relying on RAF's memory of conversations
- **Meeting briefing preparation** (future feature to implement): Auto-generates briefing notes on peer org positions to help RAF prepare cross-org meetings
- **Document library as institutional record**: Instead of brokering knowledge living in one coordinator's head, all position information is stored and accessible to any future RAF hire

**Expected Impact**: Transfers brokering knowledge from individual memory to institutional system; survives staff turnover

---

### Finding 4: Organizations protecting turf and data is a structural barrier to cross-coalition relationship mapping

**Research Evidence**:
- Quote: "Organizations are often very sensitive about sharing their work, their target populations, and especially their funding" (Community Tool Box, coalition coordination blockers)
- Risk: "Loose data, privacy and security practices in a coalition can lead to real harm for coalition partners" (Activist Handbook)
- Context: Turf protection creates resistance to the relationship mapping that would make coalitions effective

**Product Decision → Features**:
- **RAF staff controls all data visibility**: The tool is not a member-facing platform. Member organizations never see each other's data unless RAF explicitly decides to share it
- **Codebook as transparency mechanism**: When RAF does share findings, the codebook explains the analysis process and includes full attribution, so orgs can verify accuracy and understand what was done with their data
- **Quote-first output**: By always showing verbatim language, RAF can't accidentally misrepresent an org's position; orgs can confirm their own quotes are accurate
- **No automatic cross-org visibility**: The system doesn't create a "member portal" where orgs can browse each other's positions; RAF makes intentional decisions about what gets shared

**Expected Impact**: Builds organizational trust by making data handling explicit and auditable; reduces legitimate concerns about turf violations

---

### Finding 5: Tech capacity gaps create a two-tier coordination dynamic

**Research Evidence**:
- Example: BlackDoctor.org's technology capabilities became "essential for BCAC's reach, demonstrating uneven digital capacity across member organizations" (health equity coalition study)
- Stat: Only 30% of nonprofit advocacy organizations currently use AI (Quorum 2024)
- Pattern: "Different CRM systems, communication platforms, and data structures make it challenging to execute truly coordinated campaigns across partners" (callhub.io)

**Product Decision → Features**:
- **Zero-friction document submission**: Member orgs just submit a PDF. No login, no platform, no technical requirements. Email submission is an option
- **Document library without member access**: RAF staff handles all document management; member orgs don't need to learn a new platform
- **Async, batch-oriented workflow**: Analysis happens on RAF's schedule, not requiring members to log in or coordinate timing
- **Minimal operator UI**: The tool for RAF staff is simple enough that a non-technical person can operate it without IT support

**Expected Impact**: Low-capacity member organizations can participate equally without creating additional burden on RAF staff; prevents tech from determining who has a voice

---

### Finding 6: Ideological heterogeneity creates coalition breadth and friction

**Research Evidence**:
- Insight: "Belief homophily plays a more important role in driving coordination in conflictual settings" (Satoh 2023)
- Challenge: "Variations in ideology, priorities, and long-term goals create friction and pressure throughout the partnership" (advocacy coalition research)
- Context: "Misalignment around why it's important to center race, what it means to center race, and how to do it…can lead to painful divides" (Activist Handbook)
- Pattern: "When actors have few disagreements, they form tight coalitions; at medium agreement levels, actors form an umbrella coalition wherein cooperation is broad and loose" (ACF research)

**Product Decision → Features**:
- **Quote-first output without scoring**: By showing verbatim language without quantifying agreement, the tool avoids imposing a false consensus. RAF can see genuine disagreements and decide how to navigate them
- **Human judgment in framing questions**: RAF staff, not the system, chooses the questions and issue framings. This allows RAF to surface shared interests rather than highlighting areas of conflict
- **Alignment Grid by question**: Rather than a global "alignment score," the tool shows question-by-question where orgs agree and diverge. This helps RAF identify specific areas for negotiation
- **Meeting briefing** (future): Would help RAF prepare cross-ideological meetings by highlighting where seemingly opposed orgs have stated shared interests

**Expected Impact**: Gives RAF tools to manage ideological friction by mapping actual areas of agreement rather than relying on implicit trust and slow relationship-building

---

### Finding 7: Coalition coordination overhead falls on staff with minimal support; burnout is endemic

**Research Evidence**:
- Quote: "A real feeling of having to be 'on' all the time, including knowing the pulse of the community and being available for emails and phone calls throughout the day" (Independent Sector, nonprofit leadership interviews)
- Pattern: "Effective staffing requires both good leadership and management, and coalitions have often found it challenging to find one person to play both roles" (TCC Group report)
- Example: "Overextension of nurses and other health care workers at community, academic, and health system levels, leading to exhaustion from continuous volunteer effort" (health equity coalition study)

**Product Decision → Features**:
- **Automated document processing**: Text extraction and embedding happen automatically, not manually
- **Claude-powered quote extraction**: Rather than RAF staff manually reading and extracting quotes, Claude does the reading
- **Batch-oriented workflow**: Analysis happens in scheduled runs, not requiring RAF to respond to new documents in real-time
- **Async document intake**: Member orgs submit asynchronously; RAF processes when ready, not on demand
- **Maintainable infrastructure**: The tool is designed to run with minimal human oversight—no complex DevOps, no on-call support requirements

**Expected Impact**: Reduces the time RAF staff spends on position synthesis and document management, freeing time for relationship-building and strategic work; reduces burnout risk from always-on coordination demand

---

## Success Metrics

### Qualitative Metrics

- **Operator confidence**: RAF staff reports feeling more confident in their understanding of member org positions (post-brief survey)
- **Institutional memory**: A new RAF hire can pick up a brief and understand the analysis framing without re-reading all documents
- **Member org trust**: No member organizations report concerns about misrepresentation of their position (post-sharing feedback)
- **Meeting preparation quality**: Member org staff report feeling more prepared for cross-org meetings when RAF includes RAF Field Builder briefing materials
- **Ease of use**: Non-technical RAF staff can run a full coding workflow (submit documents through code results) without external support or training
- **Relationship brokering speed**: Time from "RAF realizes two orgs should meet" to "RAF broker produces a briefing note" decreases significantly

### Quantitative Metrics

- **Time savings**: Document analysis time per brief decreases from 8-12 hours to 1-2 hours
- **Analysis frequency**: RAF runs more than one coding cycle per month (baseline: ad hoc, as needed)
- **Document corpus**: Average coalition maintains 10+ position papers per year; tool tracks and processes all of them
- **Brief retention**: 90%+ of created briefs are used in at least one meeting or stakeholder conversation
- **Coding consistency**: Quote extraction error rate <5% (spot checks by RAF staff)
- **System uptime**: Tool is available 99.5% of the time during operating hours
- **Cost efficiency**: Cost per analyzed document (API + compute) is under $2 per document

---

## Version Timeline & Future Roadmap

### V1 (Current)
- Core features: Document library, issue detection, brief creation, semantic search, coding workflow, alignment grid, codebook generation

### V2 (Future)
- Meeting briefing auto-generation
- Member organization portal (read-only view of approved findings)
- Position timeline visualization
- Advanced CSV/data exports for further analysis
- Batch import of documents (e.g., from shared drive)

### V3+ (Future)
- Relationship network visualization
- Automated talking points generation (with human review)
- Member org feedback loop (anonymous corrections/clarifications)
- Multi-coalition instance support
- Custom report generation

---

## Assumptions & Constraints

### Technical Assumptions
- Voyage AI embeddings remain available at current pricing (~$0.04 per 1M tokens)
- Claude API remains available for batch processing and real-time coding runs
- Supabase (PostgreSQL + vector extension) is the right database choice for RAF's scale
- Next.js / React is appropriate for a lightweight operator UI

### Organizational Assumptions
- RAF will maintain consistent access to an API key for Anthropic, Voyage, and Supabase
- One RAF staff member has 10-20 hours per month available to run analysis workflows
- Coalition members are willing to submit position papers without pre-tagging or additional metadata
- RAF views institutional knowledge transfer (not one person knowing everything) as a success factor

### Scope Assumptions
- V1 focuses on position mapping, not meeting scheduling, attendee management, or post-meeting action item tracking
- Tool is single-operator; no multi-user collaboration features
- Analysis is brief-based (one issue area at a time), not ad hoc cross-issue queries
- Output format is always verbatim quotes in a grid, not AI-written synthesis

---

