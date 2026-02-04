#!/usr/bin/env node
// Setup credentials for job applications

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (q) => new Promise(resolve => rl.question(q, resolve));

async function setup() {
  console.log('=== Job Application Credentials Setup ===\n');
  console.log('This will store your login info for automated job applications.');
  console.log('Data is stored locally in ~/.openclaw/job-credentials.json\n');
  
  const credentials = {
    linkedin: {
      email: await question('LinkedIn Email: '),
      password: await question('LinkedIn Password: ')
    },
    indeed: {
      email: await question('Indeed Email (or same): '),
      password: await question('Indeed Password (or same): ')
    },
    personal: {
      name: await question('Your Full Name: '),
      phone: await question('Phone Number: '),
      address: await question('City/Location: '),
      salary: await question('Salary Expectation (or "Negotiable"): ') || 'Negotiable'
    }
  };
  
  // Additional data
  credentials.personal.whyCompany = await question('Generic "Why this company" answer: ') || 'Excited about company mission and growth';
  credentials.personal.notice = await question('Notice Period: ') || '2 weeks';
  
  // Save
  const configDir = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw');
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
  
  const credPath = path.join(configDir, 'job-credentials.json');
  fs.writeFileSync(credPath, JSON.stringify(credentials, null, 2));
  
  console.log('\n✓ Credentials saved to:', credPath);
  console.log('\nNext steps:');
  console.log('1. Create your master CV at: memory/cv-master.json');
  console.log('2. Run: node apply-to-jobs.js linkedin "Product Manager" "" 5');
  
  rl.close();
}

setup().catch(console.error);
