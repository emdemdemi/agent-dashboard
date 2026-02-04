# Autonomous Job Application Agent

## Purpose
Navigate job sites (LinkedIn, Indeed), parse job postings, tailor CV, fill applications, and queue for user approval before submission.

## Capabilities

### 1. Browser Automation (`browser` tool)
- Navigate to job sites
- Log in with stored credentials
- Search for jobs matching criteria
- Scrape job details (requirements, description, company)
- Interact with forms (fill, click, upload)
- Take screenshots for verification

### 2. Job Parsing Engine
Extract from job posting:
- Job title
- Company name
- Location
- Key requirements
- Required skills
- Experience level
- Salary range (if visible)

### 3. CV Tailoring
Compare job requirements to master CV:
- Identify matching skills/projects
- Generate tailored "experience" bullets
- Adjust keywords for ATS
- Create job-specific CV variant
- Save as new version (e.g., "stripe-pm-v1")

### 4. Form Autofill
- Upload tailored CV (PDF)
- Fill text fields (name, email, phone)
- Answer common questions (why this company, salary expectations)
- Handle dropdowns and radio buttons

### 5. Approval Workflow
**NEVER auto-submit.** Always:
1. Fill application completely
2. Screenshot final form
3. Create "Pending Approval" job entry in dashboard
4. Send you notification (Telegram)
5. Wait for your "approve" command
6. Then submit and log to "Submitted"

## Workflow

```
User: "Apply to Product Manager jobs on LinkedIn"

1. browser:navigate to LinkedIn Jobs
2. browser:login (stored credentials)
3. browser:search "Product Manager" + location filter
4. For each job:
   a. Scrape job details
   b. Parse requirements
   c. Tailor CV from master
   d. Click "Apply" or "Easy Apply"
   e. Fill form with tailored data
   f. Screenshot completed form
   g. Create dashboard entry: "Pending Approval"
5. Report: "Found 5 jobs, filled 3, awaiting your approval"

User: "Approve Stripe PM"
6. Find job in "Pending Approval"
7. browser:submit form
8. Update dashboard: "Submitted"
9. Log activity
```

## Data Storage

**File: `memory/job-credentials.enc` (encrypted)**
```
linkedin_email: xxx
linkedin_pass: xxx
indeed_email: xxx
indeed_pass: xxx
phone: xxx
address: xxx
```

**Table: `job_applications`** (already created)
Tracks all jobs, status, CV version used.

## Safety Rules

1. **Never submit without explicit approval**
2. **Rate limit:** Max 10 applications/day to avoid bans
3. **Human-like delays:** Random 2-5s between actions
4. **Screenshot proof:** Every filled form gets screenshot
5. **Blacklist:** Never apply to current employer (user specified)
6. **Log everything:** Every action logged to dashboard

## Commands

```
"Find PM jobs on LinkedIn" → Search and list
"Apply to first 5" → Fill 5 applications, queue for approval
"Approve Stripe" → Submit approved application
"Reject Google" → Delete from queue, don't apply
"Status" → Show pending approvals count
```
