-- CV Tracker Tables for Supabase
-- Run this in your Supabase SQL Editor

-- Job applications table
CREATE TABLE IF NOT EXISTS job_applications (
    id SERIAL PRIMARY KEY,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'Applied',
    applied_date DATE DEFAULT CURRENT_DATE,
    cv_version TEXT,
    source TEXT,
    salary_range TEXT,
    notes TEXT,
    contact_person TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CV versions table
CREATE TABLE IF NOT EXISTS cv_versions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    file_path TEXT,
    target_role TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Interview log
CREATE TABLE IF NOT EXISTS interview_log (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES job_applications(id),
    round INTEGER,
    date TIMESTAMP,
    type TEXT, -- Phone, Video, Onsite
    notes TEXT,
    outcome TEXT
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE job_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE cv_versions;
ALTER PUBLICATION supabase_realtime ADD TABLE interview_log;
