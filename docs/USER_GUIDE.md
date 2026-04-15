# RAF Field Builder: Setup & User Guide

A plain-language guide for non-technical coalition staff to set up and use the RAF Field Builder tool.

---

# Part 1: Getting Started (One-Time Setup)

## What You'll Need

Before you start, gather three things:

1. **A Supabase account** (free) — This is the database where all your documents and analysis results will live
2. **An Anthropic API key** — This gives the tool permission to use Claude to read your documents
3. **A Voyage AI API key** — This enables semantic search, which helps find relevant documents for each analysis

All three are free to set up; you may eventually pay small fees based on usage (typically $5-10/month if you're running analysis regularly).

### Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **Sign Up**
3. Create an account using your email (or link to GitHub)
4. Create a new **Project** — choose any name (e.g., "RAF Field Builder")
5. Copy your **Project URL** and **Anon Key**
   - Click on the Settings gear icon on the left sidebar
   - Go to **API**
   - Copy the **Project URL** and **Anon Key** — you'll paste these later

6. Get your **Service Role Key**
   - Still in Settings > API
   - Scroll down and copy the **Service Role Key** (this has more permissions; keep it private)

You'll use these three values (Project URL, Anon Key, Service Role Key) in step 4 below.

### Step 2: Get an Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Click **Sign In** (or create an account if you don't have one)
3. On the left sidebar, click **API Keys**
4. Click **Create Key**
5. Name it something like "Field Builder"
6. Copy the key immediately — you won't be able to see it again
7. Keep this key secret; don't share it in emails or Slack

### Step 3: Get a Voyage AI API Key

1. Go to [dash.voyageai.com](https://dash.voyageai.com)
2. Click **Sign Up** (or sign in if you have an account)
3. Go to **API Keys** on the left
4. Click **Create API Key**
5. Name it "Field Builder"
6. Copy the key
7. Keep this key secret; don't share it

### Step 4: Set Up the Application

These steps assume you're comfortable with a command line (Terminal on Mac, Command Prompt on Windows) and have Node.js installed (if not, see the bonus section "Installing Node.js" at the end).

1. **Open Terminal** (Mac) or **Command Prompt** (Windows)

2. **Clone the code** (copy the code files to your computer):
   ```
   git clone https://github.com/Recode-America/field-builder.git
   cd field-builder
   ```
   (If you don't have `git`, download the code as a ZIP from GitHub and unzip it)

3. **Create a `.env.local` file** with your API keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   VOYAGE_API_KEY=your_voyage_api_key
   ```
   
   Replace each `your_*` with the actual keys you copied in steps 1-3. You can create this file in any text editor (Notepad, TextEdit, VS Code).

4. **Run the migration** (set up the database tables):
   - Open Terminal and navigate to the field-builder folder
   - Run: `npm run supabase-migrate`
   - This creates all the tables where documents and analysis results will be stored

5. **Install dependencies** (download the software packages the tool needs):
   ```
   npm install
   ```

6. **Start the application**:
   ```
   npm run dev
   ```

7. **Open in your browser**:
   - Go to `http://localhost:3000`
   - You should see the Field Builder interface with a navigation menu on the left

## What You'll See When You Start

The interface has these main sections:

- **Document Library** — Upload position papers and view what you've ingested
- **Detect** — Run issue area detection on your corpus
- **Briefs** — Create and manage policy analysis briefs
- **Coding** — Run Claude analysis to extract quotes
- **Alignment** — View the grid of organizations × policy questions with quotes

For now, everything is empty. Let's add some documents.

---

# Part 2: Using the Tool — Step-by-Step Workflow

## Step 1: Adding Member Organizations

Before you upload documents, you'll register the coalition member organizations in the system.

### Why?
The system needs to know which organization each document came from, so that in the final grid, you can see "Which organizations addressed this question?"

### How?

**Method A: While uploading (easiest)**
When you upload your first document (Step 2 below), the form will let you create new organizations on the fly. You can add all your orgs this way as you upload documents.

**Method B: Manually**
Currently, organizations are added as you upload documents. If you need to add an org without uploading a document yet, you can do that in the "Organization" form on the Document Library page.

### What to Include
- **Organization name** — The legal or commonly used name (e.g., "Partnership for Public Service", "Code for America")
- Optional: **Contact email** — The person's email who submitted the document (this helps when you need to clarify something later)

---

## Step 2: Ingesting a Position Paper (Uploading a PDF)

### Where?
Navigate to **Document Library** in the left menu.

### What You'll Do

1. Click the **Existing** or **New** button depending on whether you've already registered this organization
   - If **New**, type the organization's name
   - If **Existing**, select it from the dropdown

2. Enter a **Document Title**
   - Example: "Civil Service Reform Position Paper 2024"
   - Or: "Policy Recommendations on Federal IT Modernization"
   - Be specific so you can find it later; include the year if the org has submitted papers across multiple years

3. Click **Choose File** and select the PDF from your computer

4. Click **Upload Document**
   - You'll see a spinning animation and "Uploading & Embedding..."
   - This takes 30-60 seconds
   - When complete, the page will refresh and show "Embedded" status

### What's Happening Behind the Scenes
- The system extracts text from the PDF (reads the content)
- It converts that text into a numerical "embedding" — a mathematical representation that lets the system find similar documents later
- Both the text and embedding are stored in the database

### Troubleshooting
- **PDF won't upload**: Make sure the file is actually a PDF (.pdf extension). If it's an image or scanned document, OCR (text extraction) may fail; try uploading to Google Drive and using "Open with Google Docs" to extract text first.
- **Still says "Pending" after 5 minutes**: The embedding may have failed. Refresh the page. If it still says "Pending", try re-uploading.

### Uploading Multiple Documents
Repeat this process for each position paper. You can upload documents one at a time or in batches. There's no limit to how many documents you can add.

---

## Step 3: Detecting Issue Areas from the Corpus

### When to Do This
Once you've uploaded 5+ position papers, you're ready to detect issue areas. This tells you what policy topics the coalition members are discussing.

### Where?
Navigate to **Issue Area Detection** → **Detect Issue Areas from Corpus**

### What You'll Do

1. Click **Detect Issue Areas from Corpus**
   - The system will spend 30-60 seconds reading all your documents
   - You'll see a spinning animation that says "Detecting Issue Areas..."

2. When done, you'll see a list of **5-10 issue areas** that Claude found
   - Example results: "Civil Service Reform", "Federal IT Modernization", "AI Governance"
   - Each area has a name and a short description

3. **Optional**: Edit the names or descriptions
   - If Claude's name doesn't match your vocabulary, you can change it
   - Example: Change "Federal IT Modernization" to "Government Technology"
   - Edit directly in the text fields on the page

4. For each area you want to analyze, click **Create Brief**
   - This opens the Brief editor where you'll write specific policy questions

### What This Tells You
The detected issue areas are a snapshot of what your coalition is actually talking about—not what you expected them to talk about, but what's in their position papers. This helps RAF staff focus analysis on what matters.

### Note
You can re-run issue detection anytime. If you add new documents, re-run detection to see if new topics emerge.

---

## Step 4: Creating a Brief (Choosing an Issue Area, Writing Topic Questions)

A **Brief** is a focused analysis of one policy issue area. You'll write 3-7 specific policy questions you want to understand org stances on.

### Where?
Navigate to **Briefs** in the left menu, or click **Create Brief** from the Issue Area Detection page.

### What You'll Do

1. **Choose or enter an issue area**
   - If you used Issue Area Detection, the area name will be pre-filled
   - If you're creating a brief manually, enter the area name (e.g., "Civil Service Reform") and a short description

2. **Write 3-7 topic questions**
   - These are the specific policy questions you want to know each org's stance on
   - **Write in plain language, not jargon**
   - Examples:
     - "Should the federal government reform civil service hiring rules? If so, how?"
     - "How should federal agencies balance legacy system replacement vs. gradual modernization?"
     - "What role should AI play in government IT systems?"

3. **Click Create Brief**
   - The brief is saved and you move to the document review stage

### Tips for Good Topic Questions

- **Be specific**: "What should the government do about IT?" is too vague. "How should federal agencies prioritize legacy system replacement?" is better.
- **One question per row**: Don't combine multiple questions into one (e.g., "Should civil service be reformed AND should IT be modernized?" is two questions).
- **Use "how" and "should" questions**: These tend to get more detailed responses than yes/no questions.
- **Avoid leading language**: Instead of "Should we urgently fix the broken civil service system?", ask "What reforms, if any, would improve the civil service system?"
- **Write from the coalititon's perspective**: What does your coalition care about learning?

---

## Step 5: Reviewing the Document Shortlist (Include/Exclude)

### Why?
The system will use semantic search to find documents related to your topic questions. You'll review the list and remove anything that's off-topic or irrelevant.

### Where?
After you create a brief, you'll see the document review page automatically.

### What You'll Do

1. **Review the list of documents** that Claude recommends as relevant
   - Each document shows its title, the organization, and a similarity score (higher = more relevant)
   - Skim the titles; if a document clearly isn't about your topic, remove it

2. **Click the checkbox** to include/exclude each document
   - Checked = this document will be analyzed
   - Unchecked = skip this document in the analysis

3. **Click Approve** when satisfied
   - This saves your selections and moves to the coding stage

### What Makes a Good Shortlist?
- **Include**: Documents that discuss the policy issues in your topic questions
- **Exclude**: Documents that are about something else (e.g., if you're analyzing civil service reform and a document is purely about fundraising, exclude it)
- **Include even if incomplete**: If an org's document doesn't address all your questions, keep it. The system will note "not addressed" for questions it doesn't cover.

### Typical Size
For a 5-question brief with 10-15 total documents, expect 8-10 documents in the shortlist. If the system recommends fewer, that's OK; it means only some orgs addressed this topic.

---

## Step 6: Approving a Brief and Downloading the Codebook

A **codebook** is a transparency document that explains what you analyzed, how, and why. You can share this with member organizations so they understand the methodology.

### Where?
After you've approved the document shortlist, you'll see a **Codebook** tab.

### What's in the Codebook?

The codebook includes:
- **Issue area name and description** — What you're analyzing
- **Policy questions** — The exact questions you asked
- **Documents reviewed** — Which orgs' papers you looked at, with titles and dates
- **Methodology explanation** — Plain English description of what Claude did
- **Results table** — The full grid of organizations × questions with all quotes

### What You Can Do

1. **Review the codebook** in the browser
2. **Edit if needed** — You can add context, clarify methodology, or note any caveats before sharing
3. **Download as PDF** — Click "Export as PDF" to get a document you can email to member orgs or upload to a shared drive
4. **Share with member organizations** (optional) — Some RAF staff like to share the codebook so orgs see the full methodology

### Why Share?
The codebook shows member organizations that you did the analysis work honestly and can verify your quotes are accurate. It reduces suspicion about what "the coalition" is doing with their position papers.

---

## Step 7: Running a Coding Session

A **coding run** is when Claude reads each approved document and extracts verbatim quotes for each of your policy questions.

### Where?
Navigate to **Coding** in the left menu, or after approving a brief, click **Run Coding**.

### What You'll Do

1. **Select a brief** (if you're starting from the Coding page)
2. **Click Run Coding**
   - You'll see a spinning animation: "Coding in progress..."
   - This typically takes 1-5 minutes depending on how many documents and questions

3. **When done**, you'll see a status message: "Coding complete"
   - The results are now stored in the system

### What's Happening
Claude is reading each document and doing this for every policy question:
- Finding where the organization addressed (or didn't address) the question
- Pulling out a verbatim quote showing the org's stance
- Recording "not addressed" if the org didn't mention this topic

### Troubleshooting
- **Coding is taking more than 10 minutes**: Something may have gone wrong. Refresh the page; if it's still running, wait a bit longer or contact support.
- **Coding failed**: Check your API key is valid. If it persists, manually check that `ANTHROPIC_API_KEY` in your `.env.local` file is correct.

---

## Step 8: Reading the Alignment View (The Grid, Clicking Cells, Side-by-Side View)

The **Alignment Grid** is your main result view. It shows which organizations addressed each policy question, with their verbatim quotes visible on click.

### Where?
Navigate to **Alignment** in the left menu (after running coding).

### What You'll See

A table with:
- **Left column (rows)**: Your policy questions
- **Top row (columns)**: Coalition member organizations
- **Cells**: Show whether each org addressed each question
  - ✓ = Organization addressed this question (click to see the quote)
  - — = Organization didn't address this question in their documents

### How to Use It

**Quick scan**: Glance at the grid to see which orgs covered which topics
- Example: If you see lots of ✓ marks in the "AI Governance" row, most orgs have something to say about AI
- If you see lots of — marks in the "Procurement Reform" row, that topic wasn't widely addressed

**Drill down**: Click any cell with a ✓
- A side panel opens showing the **full verbatim quote** from that org's document
- The quote is always traceable to the source document and page
- You can expand the quote or click to see the original document

**Compare**: Click multiple cells to compare how different orgs answered the same question
- Example: Click Org A's answer to "How should civil service hiring be reformed?" then Org B's answer to the same question
- Side-by-side comparison helps you spot where they agree and where they differ

### Exporting the Grid

1. Click **Export as CSV** or **Export as PDF**
2. Save the file to your computer
3. You can email the grid to colleagues or include it in a report

### Who Should See This?

- **You (RAF staff)**: Use this to prepare for meetings, understand coalitionwide positions, and brief members
- **Member organizations** (optional): Some RAF staff share the full grid with the coalition so everyone can see what everyone else said
- **Funders** (optional): Can show funders how the coalition is aligned on key issues

---

## Step 9: Generating a Field Landscape Report

A **field landscape report** is a narrative document summarizing the alignment grid findings in prose (not just a table).

### Where?
From the **Alignment** view, click **Generate Report**.

### What You'll Get

The system will generate a report that includes:
- **Executive summary** — Key findings about where the coalition aligns and diverges
- **Question-by-question analysis** — For each policy question, a short summary of how organizations answered
- **Notable quotes** — Highlighted quotes that show interesting consensus or disagreement
- **Next steps** — Suggested areas for coalition negotiation or strategy

### Customizing the Report

1. **Review the auto-generated report** in your browser
2. **Edit as needed** — Add your own analysis, context, or strategic notes
3. **Download as PDF** — Export to share with coalition leadership

### When to Use This

- **Before coalition meetings** — Share with leadership so they know where members stand
- **Funder reporting** — Show funders what the coalition learned about member alignment
- **Member briefing** — Help members understand where the coalition stands on a topic
- **Board meetings** — Present findings to RAF's board or governance structure

---

## Step 10: Sharing Results with Member Orgs

### Your Options

You have full control over what gets shared with member organizations. Here are the options:

**Option A: Share nothing**
- Keep all analysis internal to RAF
- Member orgs know you analyzed papers but don't see results
- Good for issues where RAF is still developing strategy

**Option B: Share the codebook only**
- Member orgs can see the methodology and document list
- They can verify their organization's quotes are accurate
- They don't see what other orgs said
- Good for building trust and transparency

**Option C: Share the codebook + anonymized quotes**
- Orgs see the full grid and quotes, but quotes are anonymized ("Organization 1", "Organization 2")
- Useful if the coalition wants everyone to see where there's consensus/divergence without revealing who said what

**Option D: Share the full grid with attribution**
- Orgs see all quotes with organization names
- Maximum transparency; good for coalitions with high trust
- Some orgs may be uncomfortable if they said something controversial

**Option E: Share the narrative report only**
- Member orgs get the prose summary, not the raw grid
- Useful if RAF wants to add interpretation or context

### How to Share

1. **Download or export** the relevant document (codebook, grid, report)
2. **Email it** to member orgs with context on what they're seeing
3. **Optional: Host on shared drive** (Google Drive, Dropbox) and give coalition members link
4. **Optional: Present in a coalition meeting** — Walk through findings with the full group

### What to Say When Sharing

Example email:
> Hi [Org Name],
> 
> As part of our coalition analysis on civil service reform, we reviewed position papers from [X] member organizations on [Y] key questions. Attached is the codebook, which shows our methodology and all the documents we reviewed. You can see your organization's responses highlighted.
> 
> If you think any quotes are misrepresented or missing context, please let us know. We're committed to accurately reflecting what member organizations have publicly said.
> 
> Best,
> RAF Team

---

# Part 3: Tips and FAQ

## How Often Should You Run Coding?

**Recommended frequency**: Before major coalition events (board meetings, legislative strategy sessions, new member onboarding)

**Example timeline**:
- June: Run coding on H1 documents, use results to prepare for annual strategic meeting
- September: Add Q3 position papers, re-run coding if new issues have emerged
- December: Final annual update; share field landscape report with funders

**You can run coding as often as you want**. There's no limit, though you'll incur small API costs each time (typically <$1 per run for 10-15 documents).

---

## What Makes a Good Topic Question?

### Good Questions
- "Should the federal government expand the role of GIS/geographic analysis in policymaking?"
- "How should civil service hiring rules balance merit, diversity, and speed?"
- "What should the government do to support continuous AI training for federal employees?"

### Poor Questions
- "What do you think about government?" (too vague)
- "Should the government be better?" (leading; everyone will say yes)
- "Tell us everything about civil service, IT, AND AI governance" (too many topics)
- "Isn't it obvious the government needs IT modernization?" (assumes agreement)

### The Test
Ask yourself: "If I were an organization writing a position paper, would I know how to answer this question in 3-5 sentences?" If yes, it's a good question.

---

## Can Member Orgs See Each Other's Quotes?

**Short answer**: No, unless RAF decides to share them.

**Long answer**:
- Member organizations submit documents to RAF
- RAF analyzes and creates the alignment grid
- RAF controls 100% of what gets shared
- If RAF decides to share the grid or codebook, then yes, orgs see each other's positions
- Member orgs never have login access to the Field Builder tool

RAF's philosophy: "We're the custodians of this data. We decide what gets shared, with whom, and when."

---

## What if a Position Paper Doesn't Address a Topic?

**That's perfectly fine.**

In the alignment grid, that cell will show **—** (a dash), which means "not addressed."

This is normal. Not every organization comments on every issue. For example:
- A small education nonprofit might have a position paper on federal IT hiring but nothing on AI governance
- A tech policy org might focus entirely on AI and skip civil service reform

The grid should have a mix of ✓ marks and — marks. This is useful data—it tells RAF which orgs have what expertise and where there might be gaps in the coalition's overall perspective.

---

## How Do You Handle Orgs That Submit Multiple Papers?

**Upload each one separately**, with a clear title that helps you identify them later.

Example:
- Org: "Partnership for Public Service"
- Document 1: "Civil Service Reform: Position Paper 2024"
- Document 2: "Federal IT Modernization: Policy Brief 2024"

When you review the document shortlist before coding, you'll see both documents listed. You can include both, or exclude one if it's not relevant to your brief.

If both papers address the same topic, both will appear in the alignment grid, showing how that org's position may have evolved or been detailed further.

---

## How Many Documents Do You Need Before Running Analysis?

**Minimum**: 3-5 documents to see meaningful patterns

**Comfortable range**: 8-12 documents per brief

**No maximum**: The system scales to 50+ documents, though coding runs will take longer

If you have fewer than 5 documents, you can still create a brief and run coding—it just means you'll have fewer orgs to compare.

---

## What If You Realize You Asked the Wrong Question?

**You can create a new brief** with better questions.

The old brief doesn't disappear; it's saved as a version. This is intentional—RAF wants to keep a record of what you've asked in the past so you can learn from it.

To create a revised brief:
1. Go to **Briefs**
2. Click **Create New Brief**
3. Enter the same issue area name
4. Write improved questions
5. Run coding on the new version

Now you have both versions in the system, showing how your analysis framing has evolved.

---

## How Do You Handle Orgs That Leave the Coalition?

Their documents stay in the library, but you can exclude them from future coding runs.

When you review the document shortlist, just uncheck that org's documents before approving. The documents remain available for historical reference.

---

## What Happens If Someone Leaks Confidential Quotes?

**From a technical standpoint**, quotes are stored in a database with no audit trail of "who viewed what when." RAF's security depends on **organizational trust**, not technical controls.

**Best practices**:
- Be selective about who gets access to the alignment grid and codebook
- If sharing with member orgs, add a note: "This analysis is intended for coalition members only; please don't share externally."
- Use password-protected PDFs if sharing via email
- For sensitive topics, share only the codebook/methodology, not the quotes

---

## What If the System Extracts the Wrong Quote?

Occasionally, Claude might pull out a quote that doesn't actually reflect an org's stance (e.g., quoting something they disagreed with or a quote from a cited source).

**What to do**:
1. Click on the quote in the alignment grid
2. Review the original document
3. If it's wrong, **manually edit the quote** in the codebook before sharing
4. Or **note the error** in your report (e.g., "Note: Org A's quote on X was paraphrased from another source; their actual stance is Y.")
5. Optionally, **flag to RAF engineering** so the system can be improved

The system is aiming for 95% accuracy; occasional errors are expected. Your human review before sharing is the key safeguard.

---

## Can You Use This for More Than One Coalition?

**Currently**: The tool is set up for one coalition (RAF). Each coalition would need its own instance.

**In the future**: RAF may add support for multiple coalitions sharing one instance, but that's not available in V1.

---

## What's the Cost?

**Free to start**: Supabase (database) and Claude API (if you use <$5/month) are both free tiers.

**Typical monthly cost** (once you're running regular analysis):
- Supabase: $0-5 (free tier covers small workloads)
- Anthropic (Claude): $5-20 (depending on how many coding runs you do)
- Voyage AI: $2-5 (embeddings for document search)

**Total**: $10-30/month for regular use. This is far less than hiring a part-time analyst.

---

## Troubleshooting Common Issues

### Problem: "Upload failed"
- **Check**: Is the file actually a PDF? Some files are named ".pdf" but are images or text files
- **Solution**: Try re-saving the file as a PDF in Adobe or Google Docs

### Problem: "Coding failed; please try again"
- **Check**: Is your Anthropic API key valid?
- **Solution**: Go to [console.anthropic.com](https://console.anthropic.com), verify your key is active (not expired or revoked), copy it again, and update `.env.local`

### Problem: "Document still shows 'Pending' after 5 minutes"
- **Check**: Did you refresh the page?
- **Solution**: Refresh the page; the status should update. If it's still pending after 15 minutes, there may be an error; try re-uploading the PDF

### Problem: "Alignment grid is blank / no results showing"
- **Check**: Did you run the coding? (There's a separate step to do this; uploading documents alone doesn't code them)
- **Solution**: Go to **Briefs** → select your brief → make sure it shows "Coding complete" status. If not, click **Run Coding**

### Problem: "The tool is slow or not responding"
- **Check**: Are you running it locally (`npm run dev`) or on a web server?
- **Solution**: If running locally, make sure Terminal is still running and hasn't crashed. If on a web server, contact your hosting provider to check server status

---

## Getting Help

### If something breaks:
1. **Refresh the page** — Often fixes transient errors
2. **Check your internet connection**
3. **Check that all API keys are entered correctly** in `.env.local`
4. **Restart the server** — In Terminal, Ctrl+C to stop the server, then `npm run dev` to restart
5. **Contact RAF engineering** — Provide:
   - What you were doing when the error occurred
   - The exact error message (take a screenshot)
   - How many documents and briefs you have in the system

### If you have feature requests:
- File an issue on the GitHub repository
- Describe what you want to do and why it would help your coalition coordination work

### If you're confused about the workflow:
- Re-read the relevant section above (Part 2)
- The workflow is: Upload → Detect → Create Brief → Approve Documents → Run Coding → Review Grid
- If you're stuck on a step, do that step exactly as written, then move to the next

---

## Bonus: Installing Node.js (If You Don't Have It)

If you've never done software development, you may not have Node.js installed. Here's how to get it:

### Mac:
1. Go to [nodejs.org](https://nodejs.org)
2. Click the green **LTS** button (Long Term Support)
3. Run the installer
4. When done, open Terminal and type: `node --version`
5. If you see a version number, you're good

### Windows:
1. Go to [nodejs.org](https://nodejs.org)
2. Click the green **LTS** button
3. Run the installer
4. When done, open Command Prompt and type: `node --version`
5. If you see a version number, you're good

That's it. You're ready to follow Step 4 in Part 1 above.

---

