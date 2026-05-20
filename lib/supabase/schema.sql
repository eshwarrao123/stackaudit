-- ─────────────────────────────────────────────────────────────────────────────
-- StackAudit — Supabase Schema
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────────────────

-- Reports table: stores full serialized audit results
CREATE TABLE IF NOT EXISTS reports (
  id            TEXT PRIMARY KEY,              -- 16-char hex ID generated client-side
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  score         INTEGER NOT NULL,
  total_spend   NUMERIC(10, 2) NOT NULL,
  monthly_waste NUMERIC(10, 2) NOT NULL,
  total_savings NUMERIC(10, 2) NOT NULL,
  critical_count INTEGER NOT NULL DEFAULT 0,
  team_size     INTEGER NOT NULL DEFAULT 1,
  active_tools  INTEGER NOT NULL DEFAULT 0,
  payload       JSONB NOT NULL,              -- Full FullAuditReport as JSONB
  -- New fields for round 2:
  user_email       TEXT,
  input_stack      JSONB,
  audit_result     JSONB,
  pricing_snapshot JSONB,
  pricing_version  TEXT
);

-- Migration for existing tables:
ALTER TABLE reports ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS input_stack JSONB;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS audit_result JSONB;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS pricing_snapshot JSONB;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS pricing_version TEXT;


-- Leads table: post-audit email capture
CREATE TABLE IF NOT EXISTS leads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email      TEXT NOT NULL,
  report_id  TEXT REFERENCES reports(id) ON DELETE SET NULL,
  source     TEXT DEFAULT 'report_cta'
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);

-- Row Level Security (RLS): allow anonymous reads and inserts
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Public read: anyone with an ID can fetch their report
CREATE POLICY "reports_public_read" ON reports
  FOR SELECT USING (true);

-- Public insert: client inserts new reports
CREATE POLICY "reports_public_insert" ON reports
  FOR INSERT WITH CHECK (true);

-- Public update: client can update user_email
CREATE POLICY "reports_public_update" ON reports
  FOR UPDATE USING (true);

-- Leads: insert only
CREATE POLICY "leads_public_insert" ON leads
  FOR INSERT WITH CHECK (true);
