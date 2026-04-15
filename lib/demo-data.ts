// lib/demo-data.ts
import { Organization, Document, IssueArea, Brief, BriefDocument, Coding } from './types'

export const DEMO_ORGS: Organization[] = [
  { id: 'org-1', name: 'Partnership for Public Service', contact_email: 'coalition@ourpublicservice.org', created_at: '2025-01-10T00:00:00Z' },
  { id: 'org-2', name: 'Code for America', contact_email: 'policy@codeforamerica.org', created_at: '2025-01-11T00:00:00Z' },
  { id: 'org-3', name: 'Lincoln Network', contact_email: 'info@lincolnpolicy.org', created_at: '2025-01-12T00:00:00Z' },
  { id: 'org-4', name: 'Niskanen Center', contact_email: 'research@niskanencenter.org', created_at: '2025-01-13T00:00:00Z' },
  { id: 'org-5', name: 'Federation of American Scientists', contact_email: 'policy@fas.org', created_at: '2025-01-14T00:00:00Z' },
  { id: 'org-6', name: 'R Street Institute', contact_email: 'coalition@rstreet.org', created_at: '2025-01-15T00:00:00Z' },
  { id: 'org-7', name: 'National Academy of Public Administration', contact_email: 'policy@napawash.org', created_at: '2025-01-16T00:00:00Z' },
  { id: 'org-8', name: 'Bipartisan Policy Center', contact_email: 'info@bipartisanpolicy.org', created_at: '2025-01-17T00:00:00Z' },
]

export const DEMO_DOCUMENTS: (Document & { organizations?: Organization })[] = [
  { id: 'doc-1', org_id: 'org-1', title: 'Rebuilding the Civil Service: A Blueprint for Reform', file_path: null, raw_text: 'The federal civil service system, established over a century ago...', submitted_at: '2025-02-01T00:00:00Z', organizations: DEMO_ORGS[0] },
  { id: 'doc-2', org_id: 'org-2', title: 'Technology-First Government: Modernizing Federal Hiring', file_path: null, raw_text: 'Digital transformation of government services requires a workforce...', submitted_at: '2025-02-03T00:00:00Z', organizations: DEMO_ORGS[1] },
  { id: 'doc-3', org_id: 'org-3', title: 'Competitive Government: Restoring Merit to Federal Employment', file_path: null, raw_text: 'A competitive, merit-based civil service is foundational to effective governance...', submitted_at: '2025-02-05T00:00:00Z', organizations: DEMO_ORGS[2] },
  { id: 'doc-4', org_id: 'org-4', title: 'Civil Service Reform and Democratic Accountability', file_path: null, raw_text: 'The tension between civil service independence and democratic control...', submitted_at: '2025-02-07T00:00:00Z', organizations: DEMO_ORGS[3] },
  { id: 'doc-5', org_id: 'org-5', title: 'Science-Ready Government: Workforce Policy for the AI Era', file_path: null, raw_text: 'Federal agencies increasingly depend on scientific and technical expertise...', submitted_at: '2025-02-09T00:00:00Z', organizations: DEMO_ORGS[4] },
  { id: 'doc-6', org_id: 'org-6', title: 'Flexible Federalism: Civil Service Reform from the States', file_path: null, raw_text: 'State-level civil service reforms offer a laboratory for federal modernization...', submitted_at: '2025-02-11T00:00:00Z', organizations: DEMO_ORGS[5] },
  { id: 'doc-7', org_id: 'org-7', title: 'No Time to Wait: Building a Public Service for the 21st Century', file_path: null, raw_text: 'America\'s public service faces a crisis of capacity and credibility...', submitted_at: '2025-02-13T00:00:00Z', organizations: DEMO_ORGS[6] },
  { id: 'doc-8', org_id: 'org-8', title: 'Bridging the Partisan Divide on Federal Workforce Reform', file_path: null, raw_text: 'Despite deep partisan divisions, there is surprising common ground on civil service reform...', submitted_at: '2025-02-15T00:00:00Z', organizations: DEMO_ORGS[7] },
]

export const DEMO_ISSUE_AREAS: IssueArea[] = [
  { id: 'area-1', name: 'Civil Service Reform', description: 'How the federal civil service hiring, classification, and retention systems should be restructured to improve government capacity.', created_at: '2025-03-01T00:00:00Z' },
  { id: 'area-2', name: 'Government Technology & AI', description: 'The role of technology modernization and artificial intelligence in improving federal agency operations and service delivery.', created_at: '2025-03-02T00:00:00Z' },
  { id: 'area-3', name: 'Federal Workforce Classification', description: 'How federal job series and pay bands should be restructured to reflect modern skill requirements and labor market realities.', created_at: '2025-03-03T00:00:00Z' },
]

export const DEMO_BRIEFS: (Brief & { issue_areas?: IssueArea })[] = [
  {
    id: 'brief-1',
    issue_area_id: 'area-1',
    version: 1,
    topic_questions: [
      'What is this organization\'s view on merit-based hiring and competitive examinations for federal employment?',
      'How does this organization approach civil service protections and at-will employment for federal workers?',
      'What does this organization say about political appointees and the boundary between career and political roles?',
      'How does this organization address pay reform and compensation competitiveness for federal employees?',
    ],
    codebook_content: {
      issue_area: 'Civil Service Reform',
      description: 'How the federal civil service hiring, classification, and retention systems should be restructured.',
      version: 1,
      generated_at: '2025-03-05T00:00:00Z',
      questions: [
        {
          question: 'What is this organization\'s view on merit-based hiring and competitive examinations?',
          guidance: 'Look for statements about how federal employees should be selected — whether through competitive exams, skills assessments, structured interviews, or other criteria. Note whether the org supports or opposes changes to current USAJobs/USAJOBS processes.',
          examples: [
            'Hiring decisions should be based solely on demonstrated competency and skills, not on seniority or connections.',
            'We support replacing the current examination system with work-sample tests that better predict on-the-job performance.',
          ],
        },
        {
          question: 'How does this organization approach civil service protections and at-will employment?',
          guidance: 'Look for statements about job security, removal procedures, appeals processes, and the appropriate balance between protecting career employees and enabling management flexibility.',
          examples: [
            'Strong due process protections for career civil servants are essential to prevent politicization of the bureaucracy.',
            'Current removal procedures are so cumbersome that managers simply work around poor performers rather than addressing them.',
          ],
        },
      ],
    },
    batch_id: 'demo-batch-1',
    approved_at: '2025-03-05T00:00:00Z',
    created_at: '2025-03-04T00:00:00Z',
    issue_areas: DEMO_ISSUE_AREAS[0],
  },
  {
    id: 'brief-2',
    issue_area_id: 'area-2',
    version: 1,
    topic_questions: [
      'What is this organization\'s position on AI adoption in federal agencies?',
      'How does this organization address the digital skills gap in the federal workforce?',
    ],
    codebook_content: null,
    batch_id: null,
    approved_at: null,
    created_at: '2025-03-10T00:00:00Z',
    issue_areas: DEMO_ISSUE_AREAS[1],
  },
]

export const DEMO_BRIEF_DOCUMENTS: (BriefDocument & { documents?: Document & { organizations?: Organization } })[] = [
  { id: 'bd-1', brief_id: 'brief-1', document_id: 'doc-1', similarity_score: 0.94, included: true, documents: DEMO_DOCUMENTS[0] },
  { id: 'bd-2', brief_id: 'brief-1', document_id: 'doc-2', similarity_score: 0.81, included: true, documents: DEMO_DOCUMENTS[1] },
  { id: 'bd-3', brief_id: 'brief-1', document_id: 'doc-3', similarity_score: 0.88, included: true, documents: DEMO_DOCUMENTS[2] },
  { id: 'bd-4', brief_id: 'brief-1', document_id: 'doc-4', similarity_score: 0.76, included: true, documents: DEMO_DOCUMENTS[3] },
  { id: 'bd-5', brief_id: 'brief-1', document_id: 'doc-5', similarity_score: 0.71, included: true, documents: DEMO_DOCUMENTS[4] },
  { id: 'bd-6', brief_id: 'brief-1', document_id: 'doc-6', similarity_score: 0.68, included: false, documents: DEMO_DOCUMENTS[5] },
  { id: 'bd-7', brief_id: 'brief-1', document_id: 'doc-7', similarity_score: 0.91, included: true, documents: DEMO_DOCUMENTS[6] },
  { id: 'bd-8', brief_id: 'brief-1', document_id: 'doc-8', similarity_score: 0.83, included: true, documents: DEMO_DOCUMENTS[7] },
]

const q1 = 'What is this organization\'s view on merit-based hiring and competitive examinations for federal employment?'
const q2 = 'How does this organization approach civil service protections and at-will employment for federal workers?'
const q3 = 'What does this organization say about political appointees and the boundary between career and political roles?'
const q4 = 'How does this organization address pay reform and compensation competitiveness for federal employees?'

export const DEMO_CODINGS: (Coding & { documents?: Document & { organizations?: Organization } })[] = [
  // Partnership for Public Service
  { id: 'c-1', document_id: 'doc-1', brief_id: 'brief-1', topic_question: q1, addressed: true, quotes: [{ text: 'Federal hiring must be rebuilt around demonstrated competency — structured interviews, work-sample assessments, and skills-based evaluations that actually predict job performance, rather than the multiple-choice examinations that have long since outlived their usefulness.', context: 'In their section on hiring reform, PPS argues for replacing written exams with practical skills assessments.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[0], organizations: DEMO_ORGS[0] } },
  { id: 'c-2', document_id: 'doc-1', brief_id: 'brief-1', topic_question: q2, addressed: true, quotes: [{ text: 'Career civil servants deserve robust due process protections — not because underperformance should be tolerated, but because the alternative, a workforce that fears arbitrary removal, produces exactly the risk-averse, politically compliant bureaucracy that reformers claim to oppose.', context: 'PPS defends civil service protections as necessary to prevent politicization.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[0], organizations: DEMO_ORGS[0] } },
  { id: 'c-3', document_id: 'doc-1', brief_id: 'brief-1', topic_question: q3, addressed: true, quotes: [{ text: 'The current boundary between Schedule C political appointees and career Senior Executive Service members has eroded dangerously. We recommend a clear statutory firewall, with criminal penalties for political interference in career personnel decisions.', context: 'PPS calls for stronger legal protections against politicization of career roles.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[0], organizations: DEMO_ORGS[0] } },
  { id: 'c-4', document_id: 'doc-1', brief_id: 'brief-1', topic_question: q4, addressed: true, quotes: [{ text: 'Federal pay must be competitive with the private sector at the senior technical levels where the talent war is fiercest. We support locality pay reform, student loan forgiveness for public servants, and a new STEM pay schedule for in-demand technical roles.', context: 'PPS proposes several pay reform mechanisms to improve recruitment of technical talent.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[0], organizations: DEMO_ORGS[0] } },

  // Code for America
  { id: 'c-5', document_id: 'doc-2', brief_id: 'brief-1', topic_question: q1, addressed: true, quotes: [{ text: 'Government cannot hire the technologists it needs through a hiring process designed in 1978. Skills-based hiring — evaluating candidates on what they can actually do, not on degrees or time-in-grade — is the single highest-leverage reform available to modernizing agencies.', context: 'Code for America frames skills-based hiring as essential to technology modernization.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[1], organizations: DEMO_ORGS[1] } },
  { id: 'c-6', document_id: 'doc-2', brief_id: 'brief-1', topic_question: q2, addressed: false, quotes: [], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[1], organizations: DEMO_ORGS[1] } },
  { id: 'c-7', document_id: 'doc-2', brief_id: 'brief-1', topic_question: q3, addressed: false, quotes: [], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[1], organizations: DEMO_ORGS[1] } },
  { id: 'c-8', document_id: 'doc-2', brief_id: 'brief-1', topic_question: q4, addressed: true, quotes: [{ text: 'We support pilot programs allowing agencies to offer market-rate salaries for technologists in critical roles, with transparent public reporting on the outcomes. The current GS pay scale simply cannot compete for senior engineers, and the federal government is losing this talent war badly.', context: 'Code for America supports market-rate pay pilots for technical workers.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[1], organizations: DEMO_ORGS[1] } },

  // Lincoln Network
  { id: 'c-9', document_id: 'doc-3', brief_id: 'brief-1', topic_question: q1, addressed: true, quotes: [{ text: 'Competitive examinations, properly designed around job-relevant competencies rather than generic aptitude, remain the fairest and most defensible basis for federal hiring. We oppose subjective interview processes that introduce bias and undermine public confidence in the meritocracy.', context: 'Lincoln Network supports competitive exams but argues they must be reformed to be job-relevant.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[2], organizations: DEMO_ORGS[2] } },
  { id: 'c-10', document_id: 'doc-3', brief_id: 'brief-1', topic_question: q2, addressed: true, quotes: [{ text: 'At-will employment for federal workers is not a threat to good government — it is a prerequisite for it. When managers cannot remove underperforming employees, the entire system calibrates downward. We support streamlined removal procedures with a 30-day process for performance-based separations.', context: 'Lincoln Network supports significantly weaker civil service protections to enable easier removal.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[2], organizations: DEMO_ORGS[2] } },
  { id: 'c-11', document_id: 'doc-3', brief_id: 'brief-1', topic_question: q3, addressed: true, quotes: [{ text: 'The president, as head of the executive branch, must have greater authority over the senior civil service. We support expanding Schedule F and similar mechanisms that allow political leadership to hold senior bureaucrats accountable for implementing administration priorities.', context: 'Lincoln Network explicitly supports Schedule F expansion — a major point of divergence from other coalition members.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[2], organizations: DEMO_ORGS[2] } },
  { id: 'c-12', document_id: 'doc-3', brief_id: 'brief-1', topic_question: q4, addressed: false, quotes: [], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[2], organizations: DEMO_ORGS[2] } },

  // Niskanen Center
  { id: 'c-13', document_id: 'doc-4', brief_id: 'brief-1', topic_question: q1, addressed: true, quotes: [{ text: 'We favor a hybrid model: competitive, structured assessments for entry-level positions that establish a genuine meritocratic baseline, combined with more flexible lateral hiring authorities for mid-career professionals with demonstrated track records.', context: 'Niskanen supports a nuanced position — exams for entry level, flexibility for laterals.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[3], organizations: DEMO_ORGS[3] } },
  { id: 'c-14', document_id: 'doc-4', brief_id: 'brief-1', topic_question: q2, addressed: true, quotes: [{ text: 'Civil service protections are not the problem — the absence of meaningful performance management upstream is. Rather than weakening due process rights, agencies should invest in the supervisory capacity to document performance issues before they reach the removal stage.', context: 'Niskanen reframes the debate: the problem is upstream management failure, not the protections themselves.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[3], organizations: DEMO_ORGS[3] } },
  { id: 'c-15', document_id: 'doc-4', brief_id: 'brief-1', topic_question: q3, addressed: true, quotes: [{ text: 'Schedule F represents a fundamental misunderstanding of why bureaucratic independence exists. An executive branch fully responsive to political direction is not more accountable — it is less, because it eliminates the institutional friction that prevents abuses of power.', context: 'Niskanen explicitly opposes Schedule F, arguing political responsiveness undermines accountability.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[3], organizations: DEMO_ORGS[3] } },
  { id: 'c-16', document_id: 'doc-4', brief_id: 'brief-1', topic_question: q4, addressed: true, quotes: [{ text: 'Total compensation — not just salary — must be the unit of comparison. Federal retirement benefits, health insurance, and job security have real monetary value that private-sector comparisons routinely ignore. Targeted pay adjustments for high-demand technical roles are warranted; across-the-board increases are not.', context: 'Niskanen argues total compensation must be considered, and supports targeted rather than broad pay increases.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[3], organizations: DEMO_ORGS[3] } },

  // FAS
  { id: 'c-17', document_id: 'doc-5', brief_id: 'brief-1', topic_question: q1, addressed: true, quotes: [{ text: 'Federal hiring for scientific and technical roles must prioritize peer-reviewed credentials and demonstrated research output. We support a separate STEM hiring track with expedited review, market-aligned salaries, and direct hire authority for PhD-level candidates in priority fields.', context: 'FAS argues for a specialized scientific hiring track separate from general civil service processes.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[4], organizations: DEMO_ORGS[4] } },
  { id: 'c-18', document_id: 'doc-5', brief_id: 'brief-1', topic_question: q2, addressed: false, quotes: [], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[4], organizations: DEMO_ORGS[4] } },
  { id: 'c-19', document_id: 'doc-5', brief_id: 'brief-1', topic_question: q3, addressed: true, quotes: [{ text: 'Science advisor roles must be insulated from political pressure. We recommend that all positions requiring scientific judgment be classified as inherently career, with Senate confirmation required for any attempt to convert them to political appointments.', context: 'FAS argues scientific roles should have strong protections against political conversion.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[4], organizations: DEMO_ORGS[4] } },
  { id: 'c-20', document_id: 'doc-5', brief_id: 'brief-1', topic_question: q4, addressed: true, quotes: [{ text: 'The gap between federal and private-sector STEM compensation has reached a crisis point. We document a 34% average pay gap for PhD scientists between federal agencies and comparable private-sector positions. This is not sustainable and is already producing visible brain drain from key agencies.', context: 'FAS quantifies the STEM pay gap and frames it as a crisis requiring urgent attention.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[4], organizations: DEMO_ORGS[4] } },

  // NAPA
  { id: 'c-21', document_id: 'doc-7', brief_id: 'brief-1', topic_question: q1, addressed: true, quotes: [{ text: 'The public service of the 21st century must be built on demonstrated performance, not credentialing. We recommend eliminating degree requirements for most federal positions and replacing them with validated competency assessments developed in partnership with agencies and validated against job performance data.', context: 'NAPA recommends eliminating degree requirements in favor of competency-based assessment.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[6], organizations: DEMO_ORGS[6] } },
  { id: 'c-22', document_id: 'doc-7', brief_id: 'brief-1', topic_question: q2, addressed: true, quotes: [{ text: 'We do not recommend weakening due process rights for federal employees. However, we do recommend a complete overhaul of the performance management system — with mandatory calibration, real-time feedback tools, and consequences for managers who fail to address persistent underperformance.', context: 'NAPA supports keeping due process but reforming performance management upstream.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[6], organizations: DEMO_ORGS[6] } },
  { id: 'c-23', document_id: 'doc-7', brief_id: 'brief-1', topic_question: q3, addressed: false, quotes: [], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[6], organizations: DEMO_ORGS[6] } },
  { id: 'c-24', document_id: 'doc-7', brief_id: 'brief-1', topic_question: q4, addressed: true, quotes: [{ text: 'Pay reform without workforce planning is rearranging deck chairs. We recommend tying any pay increases to a comprehensive workforce plan that identifies critical skills gaps by agency, projects retirements over a 10-year horizon, and sets measurable targets for diversity and geographic distribution.', context: 'NAPA links pay reform to the need for comprehensive workforce planning.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[6], organizations: DEMO_ORGS[6] } },

  // Bipartisan Policy Center
  { id: 'c-25', document_id: 'doc-8', brief_id: 'brief-1', topic_question: q1, addressed: true, quotes: [{ text: 'Our bipartisan working group found consensus around three principles: hiring should be based on demonstrated ability, the process should be fast enough to compete with private employers, and results should be transparent enough to maintain public trust in the meritocracy.', context: 'BPC frames merit hiring through the lens of bipartisan consensus principles.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[7], organizations: DEMO_ORGS[7] } },
  { id: 'c-26', document_id: 'doc-8', brief_id: 'brief-1', topic_question: q2, addressed: true, quotes: [{ text: 'Civil service protections are not inherently in conflict with accountability — but the current system has allowed that conflict to develop through decades of procedural accretion. Our recommendations modernize the appeals process without eliminating substantive due process rights.', context: 'BPC takes a middle-ground position: modernize the process without eliminating protections.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[7], organizations: DEMO_ORGS[7] } },
  { id: 'c-27', document_id: 'doc-8', brief_id: 'brief-1', topic_question: q3, addressed: true, quotes: [{ text: 'Our working group could not reach consensus on Schedule F. Members from both parties agreed that presidential management authority matters, but disagreed sharply on whether expanding political appointment authority serves or undermines that goal. We present both perspectives without recommendation.', context: 'BPC explicitly acknowledges internal disagreement on Schedule F — notable for a consensus document.' }], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[7], organizations: DEMO_ORGS[7] } },
  { id: 'c-28', document_id: 'doc-8', brief_id: 'brief-1', topic_question: q4, addressed: false, quotes: [], coded_at: '2025-03-06T00:00:00Z', documents: { ...DEMO_DOCUMENTS[7], organizations: DEMO_ORGS[7] } },
]

export const DEMO_DETECTED_AREAS = [
  { name: 'Civil Service Reform', description: 'Proposals to restructure federal hiring, classification, and employee protections to improve government capacity and accountability.' },
  { name: 'Government Technology & AI', description: 'How federal agencies should adopt digital tools, AI systems, and modern software practices to improve service delivery.' },
  { name: 'Federal Workforce Classification', description: 'Reform of job series, pay bands, and the GS schedule to better reflect modern skill requirements and private-sector competition.' },
  { name: 'Executive-Legislative Relations', description: 'The appropriate balance of authority between presidential appointees and career civil servants in policy implementation.' },
  { name: 'Public Service Diversity & Representation', description: 'Strategies to make the federal workforce more representative of the American public it serves.' },
]

export const DEMO_NARRATIVE = `## Civil Service Reform: Field Landscape

**Where the coalition converges**

Across all eight position papers, there is strong consensus that the current federal hiring process is broken and must be replaced with skills-based, competency-driven assessment. The Partnership for Public Service, Code for America, NAPA, and Lincoln Network all argue — from different starting points — that the existing examination and degree-requirement system fails to identify the talent the government needs. This represents a durable consensus anchor for the coalition.

There is also surprising agreement on pay competitiveness for technical roles. FAS documents a 34% STEM pay gap; Code for America calls the talent war "lost"; even Lincoln Network, which opposes across-the-board increases, supports targeted market-rate pilots. A joint position on STEM and technical pay reform is achievable.

**Where the coalition fractures**

The deepest fault line runs through **Schedule F and political appointment authority**. Lincoln Network explicitly supports expanding Schedule F to increase presidential control over career senior officials. Niskanen Center calls this "a fundamental misunderstanding of why bureaucratic independence exists." The Bipartisan Policy Center, notably, could not reach internal consensus and presents both views. This is not a bridgeable gap — it reflects genuinely incompatible theories of democratic accountability.

Civil service protections are a secondary fault line. Lincoln Network supports at-will employment with 30-day removal procedures. PPS, Niskanen, and NAPA all defend due process rights while calling for upstream performance management reform. Code for America and FAS largely sidestep this question.

**Bridge organizations**

The **Bipartisan Policy Center** and **Niskanen Center** are the coalition's most effective bridges. BPC explicitly frames its work around cross-ideological consensus and acknowledges where it cannot be found — a useful model for coalition communications. Niskanen reframes contentious debates (protections vs. accountability) in ways that create space for agreement.

**Recommendation for upcoming meeting**

Lead with hiring reform and STEM pay — the consensus zone. Explicitly set aside Schedule F; a joint position is not achievable and attempting one will fracture the room. Consider whether Lincoln Network's presence at a table discussing political appointment reform serves the coalition's goals.`
