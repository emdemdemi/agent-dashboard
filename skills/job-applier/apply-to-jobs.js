#!/usr/bin/env node
// Master script: Find jobs, tailor CVs, fill applications, queue for approval

const JobBrowser = require('./browser-automation');
const CVTailor = require('./cv-tailor');
const fs = require('fs');
const path = require('path');

// Load credentials from encrypted storage
function loadCredentials() {
  const credPath = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'job-credentials.json');
  try {
    return JSON.parse(fs.readFileSync(credPath, 'utf8'));
  } catch {
    console.error('No credentials found. Please run: node setup-credentials.js');
    process.exit(1);
  }
}

// Load master CV
function loadMasterCV() {
  const cvPath = path.join(process.cwd(), 'memory', 'cv-master.json');
  try {
    return JSON.parse(fs.readFileSync(cvPath, 'utf8'));
  } catch {
    console.error('No master CV found at', cvPath);
    process.exit(1);
  }
}

// Update dashboard via Supabase
async function updateDashboard(jobData) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    'https://altmxznbmxidqirlarwh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdG14em5ibXhpZHFpcmxhcndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzgxNTksImV4cCI6MjA4NTcxNDE1OX0.Sgl81tgqHI8S3ZzqbJYBa9jAl70HPa5b5_sCoGpDUJY'
  );
  
  const { error } = await supabase.from('job_applications').insert(jobData);
  if (error) console.error('Dashboard update failed:', error);
  else console.log('Added to dashboard:', jobData.job_title);
}

// Main workflow
async function applyToJobs(config) {
  const credentials = loadCredentials();
  const masterCV = loadMasterCV();
  const tailor = new CVTailor(masterCV);
  
  const browser = new JobBrowser(config.platform, credentials[config.platform]);
  
  console.log(`Starting job application workflow...`);
  console.log(`Platform: ${config.platform}`);
  console.log(`Keywords: ${config.keywords}`);
  console.log(`Max applications: ${config.maxJobs || 5}`);
  
  // Login
  console.log('Logging in...');
  await browser.login();
  
  // Search
  console.log('Searching for jobs...');
  const jobs = await browser.searchJobs(config.keywords, config.location);
  console.log(`Found ${jobs.length} jobs`);
  
  const results = [];
  
  for (let i = 0; i < Math.min(jobs.length, config.maxJobs || 5); i++) {
    const job = jobs[i];
    console.log(`\n[${i + 1}/${Math.min(jobs.length, config.maxJobs || 5)}] ${job.title} at ${job.company}`);
    
    try {
      // Get full details
      const details = await browser.getJobDetails(job.id);
      
      // Tailor CV
      console.log('Tailoring CV...');
      const { versionName, tailored } = tailor.tailor({ ...details, title: job.title, company: job.company });
      
      // Fill application
      console.log('Filling application...');
      const { ready, screenshot } = await browser.applyEasyApply(job.id, {
        ...credentials.personal,
        resumePath: path.join(process.cwd(), 'cv-versions', `${versionName}.pdf`)
      });
      
      // Queue for approval
      await updateDashboard({
        job_title: job.title,
        company: job.company,
        source: config.platform === 'linkedin' ? 'LinkedIn' : 'Indeed',
        status: 'Pending Approval',
        cv_version: versionName,
        job_url: details.url || `https://linkedin.com/jobs/view/${job.id}`
      });
      
      results.push({
        job,
        status: 'pending_approval',
        cvVersion: versionName,
        screenshot
      });
      
      console.log('✓ Queued for your approval');
      
      // Rate limiting
      await new Promise(r => setTimeout(r, 3000 + Math.random() * 2000));
      
    } catch (e) {
      console.error('✗ Failed:', e.message);
      results.push({ job, status: 'failed', error: e.message });
    }
  }
  
  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Total jobs: ${jobs.length}`);
  console.log(`Processed: ${results.length}`);
  console.log(`Pending your approval: ${results.filter(r => r.status === 'pending_approval').length}`);
  console.log(`Failed: ${results.filter(r => r.status === 'failed').length}`);
  console.log('\nCheck your dashboard to approve applications.');
  
  return results;
}

// CLI
const config = {
  platform: process.argv[2] || 'linkedin',
  keywords: process.argv[3] || 'Product Manager',
  location: process.argv[4] || '',
  maxJobs: parseInt(process.argv[5]) || 5
};

applyToJobs(config).catch(console.error);
