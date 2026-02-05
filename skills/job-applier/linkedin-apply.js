// LinkedIn Job Application Automation
// Node.js script using Playwright for browser automation

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  linkedin: {
    loginUrl: 'https://www.linkedin.com/login',
    jobsUrl: 'https://www.linkedin.com/jobs',
    searchUrl: (keywords, location) => 
      `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keywords)}${location ? '&location=' + encodeURIComponent(location) : ''}`
  }
};

class LinkedInJobApplier {
  constructor() {
    this.browser = null;
    this.page = null;
    this.credentials = this.loadCredentials();
  }

  loadCredentials() {
    const credPath = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'job-credentials.json');
    return JSON.parse(fs.readFileSync(credPath, 'utf8'));
  }

  async init() {
    this.browser = await chromium.launch({ headless: false }); // Set to true for production
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1280, height: 800 });
  }

  async login() {
    console.log('Logging into LinkedIn...');
    await this.page.goto(CONFIG.linkedin.loginUrl);
    
    await this.page.fill('#username', this.credentials.linkedin.email);
    await this.page.fill('#password', this.credentials.linkedin.password);
    await this.page.click('[type="submit"]');
    
    // Wait for login to complete
    await this.page.waitForTimeout(5000);
    
    // Check for security challenges
    const currentUrl = this.page.url();
    if (currentUrl.includes('checkpoint') || currentUrl.includes('verify')) {
      console.log('⚠️ Security verification required. Waiting 30 seconds for manual completion...');
      await this.page.waitForTimeout(30000);
    }
    
    console.log('✓ Logged in');
  }

  async searchJobs(keywords, location = '', maxResults = 10) {
    const searchUrl = CONFIG.linkedin.searchUrl(keywords, location);
    console.log(`Searching: ${searchUrl}`);
    
    await this.page.goto(searchUrl);
    await this.page.waitForTimeout(3000);
    
    // Scrape job listings
    const jobs = await this.page.evaluate(() => {
      const listings = [];
      const jobCards = document.querySelectorAll('[data-job-id]');
      
      jobCards.forEach((card, index) => {
        const jobId = card.getAttribute('data-job-id');
        const titleEl = card.querySelector('h3') || card.querySelector('[class*="job-title"]');
        const companyEl = card.querySelector('[class*="company"]') || card.querySelector('[class*="name"]');
        const locationEl = card.querySelector('[class*="location"]');
        const easyApply = card.textContent.includes('Easy Apply');
        
        if (jobId && titleEl) {
          listings.push({
            id: jobId,
            title: titleEl.textContent.trim(),
            company: companyEl ? companyEl.textContent.trim() : 'Unknown',
            location: locationEl ? locationEl.textContent.trim() : '',
            easyApply: easyApply
          });
        }
      });
      
      return listings.slice(0, 10);
    });
    
    return jobs;
  }

  async getJobDetails(jobId) {
    // Click on job to view details
    await this.page.click(`[data-job-id="${jobId}"]`);
    await this.page.waitForTimeout(2000);
    
    const details = await this.page.evaluate(() => {
      const descriptionEl = document.querySelector('[class*="description"]') || 
                           document.querySelector('.jobs-description');
      const criteriaEls = document.querySelectorAll('[class*="criteria"] li');
      
      return {
        description: descriptionEl ? descriptionEl.textContent.trim() : '',
        criteria: Array.from(criteriaEls).map(el => el.textContent.trim())
      };
    });
    
    return {
      id: jobId,
      url: this.page.url(),
      ...details
    };
  }

  async fillEasyApply(job, cvData) {
    if (!job.easyApply) {
      console.log(`  Skipping ${job.title} - no Easy Apply`);
      return { status: 'skipped', reason: 'no_easy_apply' };
    }
    
    console.log(`  Starting Easy Apply for: ${job.title}`);
    
    // Click Easy Apply button
    await this.page.click('button:has-text("Easy Apply")');
    await this.page.waitForTimeout(2000);
    
    // Upload resume
    try {
      const fileInput = await this.page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(cvData.resumePath);
      console.log('  ✓ Resume uploaded');
    } catch (e) {
      console.log('  ✗ Resume upload failed:', e.message);
    }
    
    // Fill contact info
    const fields = {
      'input[name*="firstName"], input[id*="firstName"]': cvData.firstName || cvData.name?.split(' ')[0] || '',
      'input[name*="lastName"], input[id*="lastName"]': cvData.lastName || cvData.name?.split(' ').slice(1).join(' ') || '',
      'input[name*="email"], input[type="email"]': cvData.email || this.credentials.linkedin.email,
      'input[name*="phone"], input[type="tel"]': cvData.phone || this.credentials.personal.phone
    };
    
    for (const [selector, value] of Object.entries(fields)) {
      try {
        await this.page.fill(selector, value);
      } catch (e) {
        // Field might not exist
      }
    }
    
    // Handle additional questions
    await this.answerQuestions(cvData);
    
    // Click next/review buttons
    while (await this.page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Review")').count() > 0) {
      await this.page.click('button:has-text("Next"), button:has-text("Continue"), button:has-text("Review")');
      await this.page.waitForTimeout(2000);
      await this.answerQuestions(cvData);
    }
    
    // Screenshot for approval
    const screenshot = await this.page.screenshot({ encoding: 'base64' });
    
    console.log('  ✓ Application filled - awaiting approval');
    
    return {
      status: 'filled_pending_approval',
      screenshot: screenshot,
      jobData: job
    };
  }

  async answerQuestions(cvData) {
    // Common questions and pre-filled answers
    const answers = {
      'experience': cvData.yearsExperience || '8+',
      'salary': cvData.salary || 'Negotiable',
      'sponsorship': 'No',
      'legally authorized': 'Yes',
      'notice period': cvData.notice || '2 weeks',
      'why': cvData.why || 'Excited about the mission and growth opportunity'
    };
    
    // Check for textareas and fill
    const textareas = await this.page.locator('textarea').all();
    for (const textarea of textareas) {
      const question = await textarea.evaluate(el => {
        const label = el.closest('label') || el.previousElementSibling;
        return label ? label.textContent.toLowerCase() : '';
      });
      
      for (const [key, answer] of Object.entries(answers)) {
        if (question.includes(key)) {
          await textarea.fill(answer);
          break;
        }
      }
    }
  }

  async submitApplication() {
    // Only call this after user approval!
    await this.page.click('button:has-text("Submit application")');
    await this.page.waitForTimeout(3000);
    
    // Close confirmation
    await this.page.click('button:has-text("Done"), button[aria-label*="Close"]');
    
    return { status: 'submitted' };
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function main() {
  const applier = new LinkedInJobApplier();
  
  try {
    await applier.init();
    await applier.login();
    
    const keywords = process.argv[2] || 'Product Manager';
    const location = process.argv[3] || '';
    const maxJobs = parseInt(process.argv[4]) || 5;
    
    console.log(`\nSearching for: ${keywords} in ${location || 'any location'}`);
    console.log(`Max jobs: ${maxJobs}\n`);
    
    const jobs = await applier.searchJobs(keywords, location, maxJobs);
    console.log(`Found ${jobs.length} jobs\n`);
    
    const results = [];
    
    for (let i = 0; i < Math.min(jobs.length, maxJobs); i++) {
      const job = jobs[i];
      console.log(`[${i + 1}/${Math.min(jobs.length, maxJobs)}] ${job.title} @ ${job.company}`);
      
      try {
        const details = await applier.getJobDetails(job.id);
        const result = await applier.fillEasyApply(job, {
          name: applier.credentials.personal.name,
          email: applier.credentials.linkedin.email,
          phone: applier.credentials.personal.phone,
          yearsExperience: '8+',
          salary: 'Negotiable'
        });
        
        results.push({ ...result, job, details });
        
        if (result.status === 'filled_pending_approval') {
          console.log('  → Queued for your approval\n');
        }
        
        // Rate limiting
        await new Promise(r => setTimeout(r, 3000 + Math.random() * 2000));
        
      } catch (e) {
        console.error(`  ✗ Error: ${e.message}\n`);
        results.push({ status: 'error', error: e.message, job });
      }
    }
    
    // Summary
    console.log('\n=== SUMMARY ===');
    const pending = results.filter(r => r.status === 'filled_pending_approval').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const errors = results.filter(r => r.status === 'error').length;
    
    console.log(`Processed: ${results.length}`);
    console.log(`Pending approval: ${pending}`);
    console.log(`Skipped (no Easy Apply): ${skipped}`);
    console.log(`Errors: ${errors}`);
    
    if (pending > 0) {
      console.log('\n⚠️ IMPORTANT: Applications are filled but NOT submitted.');
      console.log('Review in browser and approve each one.\n');
    }
    
  } catch (e) {
    console.error('Fatal error:', e);
  } finally {
    // Keep browser open for manual review
    console.log('\nBrowser staying open for review. Press Ctrl+C to exit.');
  }
}

if (require.main === module) {
  main();
}

module.exports = LinkedInJobApplier;
