import { ExtractedMeetingData } from '../types/index';

export interface SampleDocPreset {
  id: string;
  title: string;
  description: string;
  date: string;
  sourceDocUrl: string;
  rawText: string;
  precomputedExtraction: ExtractedMeetingData;
}

export const SAMPLE_DOC_PRESETS: SampleDocPreset[] = [
  {
    id: 'sample-doc-1',
    title: 'Q4 Platform Architecture & Launch Sync',
    description: 'Contains ambiguous owner, missing date, and an undecided database debate.',
    date: '2026-10-07',
    sourceDocUrl: 'https://docs.google.com/document/d/1demo-q4-platform-architecture-oct2026/edit',
    rawText: `# Q4 Platform Architecture & Launch Sync
Date: October 7, 2026
Attendees: Marcus Chen, Elena Rostova, Priya Patel, David Kim, Sarah Jenkins (Lead)

## 1. Session Caching Architecture
We reviewed performance benchmarks between Memcached and Redis for our user session storage. 
Marcus presented latency data showing 1.8ms p99 for Redis with cluster failover. 
Elena raised questions regarding memory overhead, but after discussion, the team reached unanimous agreement.
DECISION: Agreed: Redis is selected for session caching due to native clustering support and sub-2ms latency.

## 2. Launch Schedule
Sarah presented the revised timeline based on frontend readiness. 
The team reviewed test coverage and agreed we cannot push into Thanksgiving week.
DECISION: The launch date is officially locked for November 12, 2026. All feature branches freeze on October 31.

## 3. Database Migration Debate (CockroachDB vs Google Cloud Spanner)
A heated discussion took place regarding our multi-region relational database tier.
David argued strongly for CockroachDB due to lower licensing costs and on-premise portability.
Priya strongly favored Google Cloud Spanner for zero-maintenance operations and tight BigQuery integration.
The team debated costs, failover SLAs, and operational overhead for 35 minutes.
No consensus was reached. The team agreed not to make any decision today. Priya and David will run head-to-head load tests next month and report back in November.

## 4. Action Items & Commitments
- Marcus Chen to provision Redis cluster in us-central1 by Oct 15, 2026.
- Someone needs to clean up the deprecated v1 API documentation by Oct 20, 2026 before external partners notice.
- Elena Rostova will draft the rollback runbook and distribute it to team leads.

## 5. Open Questions & Blockers
- Has the legal team approved the data processing addendum (DPA) for our EU telemetry pipeline? Sarah will check.
- Pending external audit sign-off before GA launch can proceed.`,
    precomputedExtraction: {
      meetingName: 'Q4 Platform Architecture & Launch Sync',
      meetingDate: '2026-10-07',
      sourceDocId: 'sample-doc-1',
      sourceDocTitle: 'Q4 Platform Architecture & Launch Sync',
      sourceDocUrl: 'https://docs.google.com/document/d/1demo-q4-platform-architecture-oct2026/edit',
      decisions: [
        {
          id: 'dec-1',
          decision: 'Redis is selected for session caching due to native clustering support and sub-2ms latency.',
          rationale: 'Cluster failover performance and sub-2ms p99 latency during benchmarks.',
          quote: 'Agreed: Redis is selected for session caching due to native clustering support and sub-2ms latency.',
          sourceLink: 'https://docs.google.com/document/d/1demo-q4-platform-architecture-oct2026/edit',
        },
        {
          id: 'dec-2',
          decision: 'Launch date officially locked for November 12, 2026, with feature freeze on October 31.',
          rationale: 'Frontend readiness schedule and avoiding holiday freeze windows.',
          quote: 'The launch date is officially locked for November 12, 2026. All feature branches freeze on October 31.',
          sourceLink: 'https://docs.google.com/document/d/1demo-q4-platform-architecture-oct2026/edit',
        },
      ],
      actionItems: [
        {
          id: 'act-1',
          task: 'Provision Redis cluster in us-central1.',
          owner: 'Marcus Chen',
          dueDate: '2026-10-15',
          quote: 'Marcus Chen to provision Redis cluster in us-central1 by Oct 15, 2026.',
          sourceLink: 'https://docs.google.com/document/d/1demo-q4-platform-architecture-oct2026/edit',
          approved: true,
          syncedToSheet: false,
          syncedToCalendar: false,
        },
        {
          id: 'act-2',
          task: 'Clean up deprecated v1 API documentation before external partners notice.',
          owner: 'Missing',
          dueDate: '2026-10-20',
          quote: 'Someone needs to clean up the deprecated v1 API documentation by Oct 20, 2026',
          sourceLink: 'https://docs.google.com/document/d/1demo-q4-platform-architecture-oct2026/edit',
          approved: false,
          syncedToSheet: false,
          syncedToCalendar: false,
        },
        {
          id: 'act-3',
          task: 'Draft rollback runbook and distribute to team leads.',
          owner: 'Elena Rostova',
          dueDate: 'Missing',
          quote: 'Elena Rostova will draft the rollback runbook and distribute it to team leads.',
          sourceLink: 'https://docs.google.com/document/d/1demo-q4-platform-architecture-oct2026/edit',
          approved: true,
          syncedToSheet: false,
          syncedToCalendar: false,
        },
      ],
      openQuestions: [
        {
          id: 'oq-1',
          question: 'Multi-Region Database Selection: CockroachDB vs Google Cloud Spanner',
          context: '35-minute debate without consensus. David advocates CockroachDB for portability; Priya advocates Spanner for BigQuery integration. Decision deferred to November.',
          quote: 'No consensus was reached. The team agreed not to make any decision today.',
          sourceLink: 'https://docs.google.com/document/d/1demo-q4-platform-architecture-oct2026/edit',
        },
        {
          id: 'oq-2',
          question: 'Legal team approval on Data Processing Addendum (DPA) for EU telemetry pipeline',
          context: 'Status unconfirmed; Sarah Jenkins needs to check with legal counsel.',
          quote: 'Has the legal team approved the data processing addendum (DPA) for our EU telemetry pipeline?',
          sourceLink: 'https://docs.google.com/document/d/1demo-q4-platform-architecture-oct2026/edit',
        },
        {
          id: 'oq-3',
          question: 'External security compliance sign-off for GA launch',
          context: 'Auditor review is still pending before GA can proceed.',
          quote: 'Pending external audit sign-off before GA launch can proceed.',
          sourceLink: 'https://docs.google.com/document/d/1demo-q4-platform-architecture-oct2026/edit',
        },
      ],
    },
  },
  {
    id: 'sample-doc-2',
    title: 'Executive Product Strategy & Budget 2027',
    description: 'Includes approved budget decision, undecided payment vendor, and unassigned research action.',
    date: '2026-10-02',
    sourceDocUrl: 'https://docs.google.com/document/d/2demo-exec-strategy-budget-2027/edit',
    rawText: `# Executive Product Strategy & Budget 2027
Date: October 2, 2026
Chair: Victoria Reynolds (COO)

## Strategic Approvals
1. The committee reviewed the European growth projections. Victoria proposed allocating €250,000 for local sales hiring in Berlin and London. All members voted in favor.
DECISION: Approved €250,000 budget allocation for European expansion in Q1 2027.

2. QA Team headcount request: Engineering requested 3 manual QA testers. Management determined automation must take precedence.
DECISION: Frozen all hiring for manual QA until end-to-end automation test suite reaches 80% coverage.

## Payment Gateway Vendor Discussion
Discussion on switching from Stripe to Adyen for international credit card processing:
Finance presented a 40 bps discount offer from Adyen.
Product raised concerns about checkout integration complexity and migration downtime.
Victoria suggested setting up an executive briefing with Adyen's solutions engineer. No final decision was made; evaluation remains ongoing.

## Commitments
- Sarah Jenkins to deliver finalized European vendor contracts by 2026-10-18.
- Comprehensive market research on APAC fintech competitors must be compiled for board review.
- Conduct executive technical briefing with Adyen solutions architect.`,
    precomputedExtraction: {
      meetingName: 'Executive Product Strategy & Budget 2027',
      meetingDate: '2026-10-02',
      sourceDocId: 'sample-doc-2',
      sourceDocTitle: 'Executive Product Strategy & Budget 2027',
      sourceDocUrl: 'https://docs.google.com/document/d/2demo-exec-strategy-budget-2027/edit',
      decisions: [
        {
          id: 'dec-201',
          decision: 'Approved €250,000 budget allocation for European expansion in Q1 2027.',
          rationale: 'Supports local sales hiring in Berlin and London based on growth projections.',
          quote: 'Approved €250,000 budget allocation for European expansion in Q1 2027.',
          sourceLink: 'https://docs.google.com/document/d/2demo-exec-strategy-budget-2027/edit',
        },
        {
          id: 'dec-202',
          decision: 'Frozen all hiring for manual QA until test automation reaches 80% coverage.',
          rationale: 'Management prioritized automated test suites over expanding manual headcount.',
          quote: 'Frozen all hiring for manual QA until end-to-end automation test suite reaches 80% coverage.',
          sourceLink: 'https://docs.google.com/document/d/2demo-exec-strategy-budget-2027/edit',
        },
      ],
      actionItems: [
        {
          id: 'act-201',
          task: 'Deliver finalized European vendor contracts.',
          owner: 'Sarah Jenkins',
          dueDate: '2026-10-18',
          quote: 'Sarah Jenkins to deliver finalized European vendor contracts by 2026-10-18.',
          sourceLink: 'https://docs.google.com/document/d/2demo-exec-strategy-budget-2027/edit',
          approved: true,
          syncedToSheet: false,
          syncedToCalendar: false,
        },
        {
          id: 'act-202',
          task: 'Compile comprehensive market research on APAC fintech competitors for board review.',
          owner: 'Missing',
          dueDate: 'Missing',
          quote: 'Comprehensive market research on APAC fintech competitors must be compiled for board review.',
          sourceLink: 'https://docs.google.com/document/d/2demo-exec-strategy-budget-2027/edit',
          approved: false,
          syncedToSheet: false,
          syncedToCalendar: false,
        },
        {
          id: 'act-203',
          task: 'Conduct executive technical briefing with Adyen solutions architect.',
          owner: 'Missing',
          dueDate: 'Missing',
          quote: 'Conduct executive technical briefing with Adyen solutions architect.',
          sourceLink: 'https://docs.google.com/document/d/2demo-exec-strategy-budget-2027/edit',
          approved: false,
          syncedToSheet: false,
          syncedToCalendar: false,
        },
      ],
      openQuestions: [
        {
          id: 'oq-201',
          question: 'International Payment Gateway Selection: Stripe vs Adyen',
          context: 'Finance wants 40 bps savings from Adyen; Product concerned with checkout migration complexity. Decision pending technical briefing.',
          quote: 'No final decision was made; evaluation remains ongoing.',
          sourceLink: 'https://docs.google.com/document/d/2demo-exec-strategy-budget-2027/edit',
        },
      ],
    },
  },
  {
    id: 'sample-doc-3',
    title: 'Sprint Retrospective & Incident Post-Mortem',
    description: 'Includes outage root cause decision, unassigned alerting task, and open SLA target question.',
    date: '2026-09-29',
    sourceDocUrl: 'https://docs.google.com/document/d/3demo-sprint-retro-incident-postmortem/edit',
    rawText: `# Sprint Retrospective & Incident Post-Mortem
Date: September 29, 2026
Lead: Alex Vance

## Post-Mortem Findings: Outage INC-4819
Root cause: Unbounded queue buffer in webhook dispatch service caused OOM crashes across 4 worker nodes.
DECISION: Deprecate and dismantle legacy in-memory webhook queue by October 14, 2026. All events must transit Cloud Pub/Sub.

## SLA Re-negotiation Debate
Customer Success proposed raising our public API uptime SLA to 99.99%.
Site Reliability Engineering warned that maintenance windows and current database failover cannot guarantee four nines.
We debated whether enterprise clients would accept 99.95% with higher penalty credits.
No agreement was reached. The topic is deferred until infrastructure redundancy is tested.

## Next Steps
- DevOps team needs to audit disk usage across staging nodes by Oct 9, 2026.
- David Kim to update PagerDuty escalation policies and verify SMS delivery.
- Someone should schedule quarterly disaster recovery drill.`,
    precomputedExtraction: {
      meetingName: 'Sprint Retrospective & Incident Post-Mortem',
      meetingDate: '2026-09-29',
      sourceDocId: 'sample-doc-3',
      sourceDocTitle: 'Sprint Retrospective & Incident Post-Mortem',
      sourceDocUrl: 'https://docs.google.com/document/d/3demo-sprint-retro-incident-postmortem/edit',
      decisions: [
        {
          id: 'dec-301',
          decision: 'Deprecate and dismantle legacy in-memory webhook queue by October 14, 2026, routing all events via Cloud Pub/Sub.',
          rationale: 'Prevents OOM crashes identified during incident INC-4819 post-mortem.',
          quote: 'Deprecate and dismantle legacy in-memory webhook queue by October 14, 2026. All events must transit Cloud Pub/Sub.',
          sourceLink: 'https://docs.google.com/document/d/3demo-sprint-retro-incident-postmortem/edit',
        },
      ],
      actionItems: [
        {
          id: 'act-301',
          task: 'Audit disk usage across staging nodes.',
          owner: 'Missing',
          dueDate: '2026-10-09',
          quote: 'DevOps team needs to audit disk usage across staging nodes by Oct 9, 2026.',
          sourceLink: 'https://docs.google.com/document/d/3demo-sprint-retro-incident-postmortem/edit',
          approved: false,
          syncedToSheet: false,
          syncedToCalendar: false,
        },
        {
          id: 'act-302',
          task: 'Update PagerDuty escalation policies and verify SMS delivery.',
          owner: 'David Kim',
          dueDate: 'Missing',
          quote: 'David Kim to update PagerDuty escalation policies and verify SMS delivery.',
          sourceLink: 'https://docs.google.com/document/d/3demo-sprint-retro-incident-postmortem/edit',
          approved: true,
          syncedToSheet: false,
          syncedToCalendar: false,
        },
        {
          id: 'act-303',
          task: 'Schedule quarterly disaster recovery drill.',
          owner: 'Missing',
          dueDate: 'Missing',
          quote: 'Someone should schedule quarterly disaster recovery drill.',
          sourceLink: 'https://docs.google.com/document/d/3demo-sprint-retro-incident-postmortem/edit',
          approved: false,
          syncedToSheet: false,
          syncedToCalendar: false,
        },
      ],
      openQuestions: [
        {
          id: 'oq-301',
          question: 'Target Public API Uptime SLA: 99.99% vs 99.95%',
          context: 'Customer Success requested four nines, but SRE cannot guarantee without active-active multi-region database failover. Deferred until redundancy testing.',
          quote: 'No agreement was reached. The topic is deferred until infrastructure redundancy is tested.',
          sourceLink: 'https://docs.google.com/document/d/3demo-sprint-retro-incident-postmortem/edit',
        },
      ],
    },
  },
];
