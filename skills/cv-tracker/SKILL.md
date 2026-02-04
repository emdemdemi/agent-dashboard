# CV Tracker — Job Application System

## Purpose
Track job applications, CV versions, and outcomes in a structured database.

## Database Schema (Notion-style)

**Table: job_applications**
```
- company (title)
- role (text)
- status (select: Applied, Phone Screen, Interview, Offer, Rejected, Ghosted)
- applied_date (date)
- cv_version (text — which CV file used)
- source (select: LinkedIn, Indeed, Referral, Company Site, Recruiter)
- notes (text)
- salary_range (text)
- contact_person (text)
- follow_up_date (date)
- outcome (select)
```

## Workflow

1. **Find job** → Add to "Applied" status with CV version noted
2. **Interview scheduled** → Move to "Interview", add interview date
3. **Outcome** → Move to Offer/Rejected/Ghosted
4. **Weekly review** → Follow up on "Applied" older than 1 week

## Quick Commands

```bash
# List all active applications
openclaw skill cv-tracker list --status Applied,Interview

# Add new application
openclaw skill cv-tracker add --company "Stripe" --role "Senior PM" --source LinkedIn

# Update status
openclaw skill cv-tracker update --company "Stripe" --status "Phone Screen"

# Weekly report
openclaw skill cv-tracker report --week
```

## Integration with Dashboard

When I apply for jobs autonomously:
1. I log to this tracker
2. Dashboard shows: "Applied: 12, Interviews: 3, Offers: 1"
3. You see real-time progress without asking
