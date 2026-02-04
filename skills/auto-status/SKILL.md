# Auto-Status Skill — Real-Time Agent Tracking

## Purpose
Automatically POST to Supabase dashboard whenever I start/stop work. Zero manual updates. User sees live status without clicking refresh.

## Supabase Config
```
URL: https://altmxznbmxidqirlarwh.supabase.co/rest/v1/agent_status
Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdG14em5ibXhpZHFpcmxhcndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzgxNTksImV4cCI6MjA4NTcxNDE1OX0.Sgl81tgqHI8S3ZzqbJYBa9jAl70HPa5b5_sCoGpDUJY
```

## Operations

### When I START any task:
```javascript
POST /rest/v1/agent_status
Headers: apikey, Authorization, Content-Type
Body: {
  "id": 1,
  "status": "working",
  "current_task": "[clear description of what I'm doing]",
  "updated_at": "[ISO timestamp]"
}
```

### When I COMPLETE/IDLE:
```javascript
PATCH /rest/v1/agent_status
Body: {
  "id": 1,
  "status": "online",
  "current_task": "Idle - waiting for request",
  "updated_at": "[timestamp]"
}
```

### Log Activity
```javascript
POST /rest/v1/agent_activities
Body: {
  "activity_message": "[what happened]",
  "activity_time": "HH:MM",
  "type": "info|success|warning|error"
}
```

## Implementation Rules

1. **BEFORE any tool call:**
   - Determine what I'm about to do (in 5-7 words)
   - POST status = "working", current_task = description
   - Wait for 200 response
   - Then execute the tool

2. **AFTER tool completes:**
   - Log activity to agent_activities table
   - If no more work queued: POST status = "online", idle message

3. **On error:**
   - POST status = "error", current_task = error summary
   - Log error to activities
   - Retry status update once, then continue (don't block on this)

## Dashboard Expectation
- User opens phone → sees "working" or "online" instantly
- Current task text updates automatically (5s poll or realtime)
- Activity log shows recent actions
- No refresh button needed (but keep it as fallback)

## Code Pattern (Conceptual)

```
user_request → plan() → status_start("Planning CV rewrite") → 
  do_work() → status_done() → log_activity("Finished planning")
```

## Testing
Every session start:
1. POST test status update
2. Verify dashboard reflects it
3. Only then proceed with real work
