-- Enable pgvector
create extension if not exists vector;

-- Organizations
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_email text,
  created_at timestamptz default now()
);

-- Documents
create table documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  title text not null,
  file_path text,
  raw_text text,
  embedding vector(1024),
  submitted_at timestamptz default now(),
  first_pass_at timestamptz
);

create index on documents using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Issue Areas
create table issue_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  embedding vector(1024),
  created_by text,
  created_at timestamptz default now()
);

-- Briefs
create table briefs (
  id uuid primary key default gen_random_uuid(),
  issue_area_id uuid references issue_areas(id) on delete cascade,
  version int default 1,
  topic_questions jsonb default '[]',
  codebook_content jsonb,
  batch_id text,
  approved_at timestamptz,
  created_at timestamptz default now()
);

-- Brief Documents (RAF-approved doc shortlist per brief)
create table brief_documents (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid references briefs(id) on delete cascade,
  document_id uuid references documents(id) on delete cascade,
  similarity_score float,
  included bool default true
);

-- Codings
create table codings (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  brief_id uuid references briefs(id) on delete cascade,
  topic_question text,
  addressed bool default false,
  quotes jsonb default '[]',
  coded_at timestamptz default now()
);

-- First Pass Results
create table first_pass_results (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  detected_issue_areas jsonb default '[]'
);

-- pgvector RPC function for document similarity search
create or replace function match_documents(
  query_embedding vector(1024),
  match_threshold float,
  match_count int
)
returns table(id uuid, title text, similarity float)
language sql stable
as $$
  select
    documents.id,
    documents.title,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
