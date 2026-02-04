# Project Management & Structure Skill

## Purpose
Track work state across sessions, validate tool outputs, manage dependencies, and report progress accurately. Eliminates: lost tasks, silent failures, "I forgot I was doing that."

## Core Capabilities

### 1. Task State Tracking
**File:** `memory/active-tasks.json`
```json
{
  "tasks": [
    {
      "id": "task-001",
      "description": "Build CV analysis module",
      "status": "in-progress|blocked|done|abandoned",
      "started": "2026-02-04T01:00:00Z",
      "lastUpdate": "2026-02-04T01:30:00Z",
      "blocks": ["skill-002"],
      "blockedBy": [],
      "deliverable": "File path or URL",
      "verified": false
    }
  ]
}
```

**Operations:**
- `task_start(id, description, deliverable)` — Create new task
- `task_update(id, status)` — Update progress
- `task_block(id, blockedById)` — Mark dependency
- `task_complete(id, verificationMethod)` — Mark done after verification
- `task_abandon(id, reason)` — Kill stalled work

### 2. Tool Output Validation
**Before declaring success:**
```
1. Run tool (write/edit/exec/web_fetch)
2. VERIFY: Read the result (file exists? content correct?)
3. If verification fails → retry (max 3x) or escalate to user
4. Only then: Update task status to "done"
```

**Common validations:**
- File write: Check file exists, size > 0, content matches intent
- Git operations: `git log -1` confirms commit
- Web operations: Status 200 + expected content
- Exec operations: Exit code 0 + expected output

### 3. Dependency Management
```
Task A (write HTML) → Task B (write CSS) → Task C (deploy)
```
- Never start B until A is `done` AND `verified`
- Queue system: `nextUp` array in `active-tasks.json`

### 4. Progress Reporting
**Template:**
```
## Progress Update
- [x] Task 1 (done)
- [▶] Task 2 (in-progress, 60%)
- [ ] Task 3 (blocked by Task 2)
- [ ] Task 4 (queued)

**ETA:** 2 hours remaining
**Blocked on:** Nothing / User input / External API
```

### 5. Rollback Capability
**Before destructive operations:**
```
1. Save backup: `cp file file.backup.YYYYMMDD`
2. Log: `"Created rollback point: file.backup.YYYYMMDD"`
3. Execute change
4. If fails → restore backup
```

## Usage Patterns

### Starting Work
```
1. Read memory/active-tasks.json
2. If empty: "What should I work on?"
3. If has tasks: "Resuming: [task list]"
4. task_start() for new work
```

### Ending Session
```
1. Update all task statuses
2. Log next steps to memory/YYYY-MM-DD.md
3. Report: "Paused: X in-progress, Y queued for tomorrow"
```

### Handling Sub-Agents
```
1. Create task: "Spawn specialist for [X]"
2. sessions_spawn() with clear deliverable
3. sessions_list() to monitor
4. When done: Verify deliverable exists
5. Only then: Mark task complete
```

## Integration with USER.md Personas

### CV Developer Mode
```
task_start("cv-audit", "Analyze user's CV and produce audit report", "memory/cv-audit.md")
task_start("cv-rewrite", "Rewrite CV based on audit", "output/cv-master.md")
task_block("cv-rewrite", "cv-audit")  # Can't rewrite until audit done
```

### Trading Coach Mode
```
task_start("risk-rules", "Define risk parameters with user", "memory/risk-config.json")
task_start("trade-journal", "Build trade logging system", "skills/trading-journal/")
task_block("trade-journal", "risk-rules")
```

## Anti-Patterns (NEVER DO)

- ❌ Mark task done without verification
- ❌ Start 3+ parallel sub-agents without coordination
- ❌ Silent failures (always log failure reason)
- ❌ "Mental notes" — if it's not in active-tasks.json, it doesn't exist
- ❌ Skip backup before destructive edits

## Quick Reference

| Situation | Action |
|-----------|--------|
| "Just do X" | task_start() → execute → verify → task_complete() |
| Multiple steps | task_start() each → chain with task_block() |
| Tool fails | Log error → retry (max 3x) → ask user if still failing |
| Sub-agent spawned | Monitor via sessions_list() → verify output → proceed |
| Session ending | Update all tasks → summarize in YYYY-MM-DD.md |
| User asks "what were you doing?" | Read active-tasks.json → summarize |
