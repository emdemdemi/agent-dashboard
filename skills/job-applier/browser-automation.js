// Browser automation for job applications
// Uses browser tool to navigate, fill, submit

const CONFIG = {
  linkedin: {
    loginUrl: 'https://www.linkedin.com/login',
    jobsUrl: 'https://www.linkedin.com/jobs',
    searchUrl: 'https://www.linkedin.com/jobs/search/?keywords='
  },
  indeed: {
    loginUrl: 'https://secure.indeed.com/account/login',
    jobsUrl: 'https://www.indeed.com/jobs'
  }
};

class JobBrowser {
  constructor(platform, credentials) {
    this.platform = platform;
    this.credentials = credentials;
    this.loggedIn = false;
  }

  async login() {
    // Navigate to login page
    await browser({ action: 'navigate', targetUrl: CONFIG[this.platform].loginUrl });
    
    // Fill credentials
    await browser({ 
      action: 'type', 
      selector: '#username', 
      text: this.credentials.email 
    });
    
    await browser({ 
      action: 'type', 
      selector: '#password', 
      text: this.credentials.password 
    });
    
    // Click submit
    await browser({ action: 'click', selector: '[type="submit"]' });
    
    // Wait for redirect
    await new Promise(r => setTimeout(r, 3000));
    
    this.loggedIn = true;
    return true;
  }

  async searchJobs(keywords, location = '') {
    const searchUrl = `${CONFIG[this.platform].searchUrl}${encodeURIComponent(keywords)}`;
    await browser({ action: 'navigate', targetUrl: searchUrl });
    
    // Wait for results to load
    await new Promise(r => setTimeout(r, 3000));
    
    // Scrape job listings
    const result = await browser({ 
      action: 'evaluate', 
      script: `
        const jobs = [];
        document.querySelectorAll('[data-job-id]').forEach(el => {
          jobs.push({
            id: el.getAttribute('data-job-id'),
            title: el.querySelector('h3')?.textContent?.trim(),
            company: el.querySelector('[class*="company"]')?.textContent?.trim(),
            location: el.querySelector('[class*="location"]')?.textContent?.trim()
          });
        });
        return jobs.slice(0, 10);
      `
    });
    
    return result || [];
  }

  async getJobDetails(jobId) {
    await browser({ action: 'click', selector: `[data-job-id="${jobId}"]` });
    await new Promise(r => setTimeout(r, 2000));
    
    const details = await browser({
      action: 'evaluate',
      script: `
        return {
          title: document.querySelector('h1')?.textContent?.trim(),
          company: document.querySelector('[class*="company"]')?.textContent?.trim(),
          description: document.querySelector('[class*="description"]')?.textContent?.trim(),
          requirements: Array.from(document.querySelectorAll('li')).map(li => li.textContent).slice(0, 10)
        };
      `
    });
    
    return details;
  }

  async applyEasyApply(jobId, cvData) {
    // Click Easy Apply button
    await browser({ action: 'click', selector: '[aria-label*="Easy Apply"]' });
    await new Promise(r => setTimeout(r, 2000));
    
    // Fill form step by step
    // This varies by job but common fields:
    const fields = {
      name: cvData.name,
      email: cvData.email,
      phone: cvData.phone,
      resume: cvData.resumePath
    };
    
    // Upload resume
    await browser({
      action: 'upload',
      selector: 'input[type="file"]',
      filePath: cvData.resumePath
    });
    
    // Fill text fields
    for (const [field, value] of Object.entries(fields)) {
      if (field !== 'resume' && value) {
        await browser({
          action: 'type',
          selector: `input[name*="${field}"], input[id*="${field}"]`,
          text: value
        });
      }
    }
    
    // Answer questions (dynamic based on job)
    await this.answerCommonQuestions(cvData);
    
    // Screenshot before submission
    const screenshot = await browser({ action: 'screenshot' });
    
    return { ready: true, screenshot };
  }

  async answerCommonQuestions(cvData) {
    // Common questions and pre-written answers
    const answers = {
      'why this company': cvData.whyCompany || 'Interested in scaling mission',
      'salary expectation': cvData.salary || 'Negotiable',
      'why this role': cvData.whyRole || 'Ready for next challenge',
      'notice period': cvData.notice || '2 weeks'
    };
    
    // Check for question fields and fill
    for (const [question, answer] of Object.entries(answers)) {
      // Look for fields containing question keywords
      const hasField = await browser({
        action: 'evaluate',
        script: `document.body.innerText.toLowerCase().includes('${question}')`
      });
      
      if (hasField) {
        await browser({
          action: 'type',
          selector: 'textarea',
          text: answer
        });
      }
    }
  }

  async screenshot() {
    return await browser({ action: 'screenshot' });
  }
}

module.exports = JobBrowser;
