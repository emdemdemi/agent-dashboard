-- Supabase setup for Agent Dashboard
-- Run this in your Supabase SQL Editor (https://app.supabase.com/project/_/editor)

-- Create agent_status table
CREATE TABLE IF NOT EXISTS agent_status (
    id BIGINT PRIMARY KEY DEFAULT 1,
    status TEXT DEFAULT 'online',
    current_task TEXT DEFAULT 'Idle',
    tokens_daily BIGINT DEFAULT 0,
    tokens_session BIGINT DEFAULT 0,
    tokens_limit BIGINT DEFAULT 100000,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for agent_status
ALTER TABLE agent_status REPLICA IDENTITY FULL;
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_status;

-- Create agent_tasks table
CREATE TABLE IF NOT EXISTS agent_tasks (
    id TEXT PRIMARY KEY,
    task_title TEXT NOT NULL,
    task_priority TEXT DEFAULT 'medium',
    task_status TEXT DEFAULT 'backlog',
    task_tokens BIGINT DEFAULT 0,
    agent_status_id BIGINT REFERENCES agent_status(id) DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for agent_tasks
ALTER TABLE agent_tasks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_tasks;

-- Create agent_activities table
CREATE TABLE IF NOT EXISTS agent_activities (
    id BIGSERIAL PRIMARY KEY,
    activity_time TEXT DEFAULT '--:--',
    activity_message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    agent_status_id BIGINT REFERENCES agent_status(id) DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for agent_activities
ALTER TABLE agent_activities REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_activities;

-- Insert initial data
INSERT INTO agent_status (id, status, current_task, tokens_daily, tokens_session)
VALUES (1, 'online', 'Dashboard initialized', 0, 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO agent_tasks (id, task_title, task_priority, task_status, task_tokens)
VALUES 
    ('t1', 'Build Dashboard', 'high', 'inprogress', 5200),
    ('t2', 'Create CV Website', 'high', 'todo', 8000),
    ('t3', 'Job Market Research', 'medium', 'backlog', 2500)
ON CONFLICT (id) DO NOTHING;

INSERT INTO agent_activities (activity_time, activity_message, type)
VALUES 
    ('23:00', 'Dashboard deployed successfully', 'success'),
    ('23:01', 'Connected to Supabase', 'success'),
    ('23:02', 'Waiting for live data feed', 'info')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON agent_status TO anon;
GRANT ALL ON agent_tasks TO anon;
GRANT ALL ON agent_activities TO anon;
GRANT ALL ON agent_activities_id_seq TO anon;
