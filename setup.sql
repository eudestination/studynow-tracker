-- StudyNow University Partnership Tracker
-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)

CREATE TABLE IF NOT EXISTS universities (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  country        TEXT NOT NULL,
  status         TEXT DEFAULT 'Not Contacted',
  contact        TEXT DEFAULT '',
  date_contacted DATE,
  last_contact   DATE,
  meeting        DATE,
  followup       DATE,
  verbal         DATE,
  signed         DATE,
  contract_start DATE,
  contract_end   DATE,
  reminder       DATE,
  notes          TEXT DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: allow public read, allow all writes (admin auth is client-side)
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read"  ON universities FOR SELECT USING (true);
CREATE POLICY "public_write" ON universities FOR ALL    USING (true);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_universities_updated
  BEFORE UPDATE ON universities
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
