# Meeting Decision Tracker

An intelligent meeting governance and workflow automation web app built in Google AI Studio. The system ingests raw meeting notes from Google Docs, uses Gemini to extract decisions, action items, and open questions with strict grounding and hallucination controls, and syncs confirmed tasks directly to Google Sheets and Google Calendar.

---

## 1. Business Problem
Unstructured meeting notes frequently bury accountability. Key decisions get mixed up with casual discussions, action items lack explicit owners or deadlines, and manual transcription into tracking tools leads to missed commitments and duplicate work. 

**Meeting Decision Tracker** automates this transition through a Human-in-the-Loop (HITL) review table:
- **Separates decisions from debates:** Open discussions without consensus are never logged as confirmed decisions.
- **Enforces strict entity grounding:** Never guesses or hallucinates an owner or date when unassigned—explicitly tags them as `Missing`.
- **Automates downstream execution:** Syncs approved actions to a structured Google Sheet tracker and schedules Google Calendar milestones while blocking incomplete dates.

---

## 2. 90-Second Demo Script

| Step | Action | Key Highlight / What the Reviewer Sees |
| :--- | :--- | :--- |
| **0:00 - 0:20** | **Load & Review (Sample Mode)** | App boots in self-contained **Sample Demo Mode**. Evaluator inspects pre-loaded operational sync notes with source quotes linked to original text passages. |
| **0:20 - 0:45** | **Zero-Hallucination Extraction** | The model parses 4 action items. Action 4 has no stated owner, so it is marked with a bold **`Missing`** badge rather than assigning an attendee arbitrarily. The onboarding debate is correctly routed to *Open Questions*, not *Decisions*. |
| **0:45 - 1:10** | **Human-in-the-Loop Review** | The user modifies or approves extracted items in the editable table. Selecting an item without a date disables Calendar export. |
| **1:10 - 1:30** | **Write Safeguards & Live Sync** | Clicking **Add approved to Sheet** checks against duplicates and writes verified rows with idempotency guards (`In Sheet` state prevents double-booking). |

---

## 3. Architecture & Data Schema

### Google Docs Input Structure
- **Agreed Decisions:** Confirmed agreements with explicit consensus.
- **Open Discussions:** Discussions deferred or lacking consensus (flagged for review).
- **Action Items:** Structured as `[Task] | [Owner] | [Due Date]`.

### Target Google Sheet Schema
| Column | Name | Purpose |
| :--- | :--- | :--- |
| A | `Meeting Date` | Extracted meeting timestamp |
| B | `Action` | Verified task description |
| C | `Owner` | Assigned owner (or `Missing`) |
| D | `Due Date` | Action deadline |
| E | `Status` | Lifecycle stage (`Pending`, `In Progress`, etc.) |
| F | `Source Link` | Direct link to the source Google Doc |

---

## 4. Strict QA Verification Results

| # | Test Scenario | Expected Result | Actual Result | Status |
| :-: | :--- | :--- | :--- | :-: |
| **1** | Missing Owner extraction | Tag owner as `Missing`; do not invent one | Flagged `Missing` with warning badge | **PASS** |
| **2** | Discussion with no decision | Route to Open Questions; omit from Decisions | Excluded from Decisions table | **PASS** |
| **3** | Missing Due Date calendar guard | Disable calendar scheduling if date is null | Calendar button disabled; error displayed | **PASS** |
| **4** | Rapid double-click on Sheet export | Block duplicate rows from writing twice | Idempotency guard rejected 2nd click | **PASS** |
| **5** | OAuth permission failure fallback | Display actionable notice, don't fake sample data | Surfaced clear Workspace error banner | **PASS** |

---

## 5. Limitation Found & Fixed

* **Identified Limitation:** During initial extraction runs, rapid successive clicks on the **Add approved to Sheet** button fired multiple asynchronous API calls before the first request resolved, resulting in duplicate task rows in the Google Sheet.
* **Resolution:** Implemented an in-flight mutual exclusion mutex (re-entrance lock) and UI state lock (`isSubmitting` disable state). Each approved row receives a deterministic task hash; upon successful write, the item is stamped with an `In Sheet` badge and deactivated from re-submission.
