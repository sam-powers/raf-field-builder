export interface Organization { id: string; name: string; contact_email: string | null; created_at: string }
export interface Document { id: string; org_id: string; title: string; file_path: string | null; raw_text: string | null; submitted_at: string }
export interface IssueArea { id: string; name: string; description: string | null; created_at: string }
export interface Brief { id: string; issue_area_id: string; version: number; topic_questions: string[]; codebook_content: any | null; batch_id: string | null; approved_at: string | null; created_at: string }
export interface BriefDocument { id: string; brief_id: string; document_id: string; similarity_score: number; included: boolean; documents?: Document & { organizations?: Organization } }
export interface Coding { id: string; document_id: string; brief_id: string; topic_question: string; addressed: boolean; quotes: Array<{text: string; context: string}>; coded_at: string }
