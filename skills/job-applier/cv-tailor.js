// CV Tailoring Engine
// Matches job requirements to master CV, generates tailored variant

const fs = require('fs');
const path = require('path');

class CVTailor {
  constructor(masterCVPath) {
    this.masterCV = this.loadMaster(masterCVPath);
  }

  loadMaster(path) {
    // Load master CV from JSON or parse from text
    try {
      return JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch {
      return { text: fs.readFileSync(path, 'utf8'), sections: {} };
    }
  }

  tailor(jobDetails) {
    // Parse job requirements
    const requirements = this.parseRequirements(jobDetails.description);
    
    // Match to CV sections
    const matchedExperience = this.matchExperience(requirements);
    const matchedSkills = this.matchSkills(requirements);
    
    // Generate tailored CV
    const tailored = {
      name: this.masterCV.name,
      title: jobDetails.title || this.masterCV.title,
      summary: this.generateSummary(jobDetails, requirements),
      experience: matchedExperience,
      skills: matchedSkills,
      education: this.masterCV.education,
      keywords: requirements // For ATS
    };
    
    // Save as new version
    const versionName = this.generateVersionName(jobDetails);
    this.saveVersion(versionName, tailored);
    
    return { versionName, tailored };
  }

  parseRequirements(description) {
    // Extract key requirements from job description
    const keywords = [
      'product management', 'agile', 'scrum', 'stakeholder', 'roadmap',
      'data analysis', 'sql', 'python', 'javascript', 'react',
      'leadership', 'team management', 'cross-functional',
      'b2b', 'b2c', 'saas', 'fintech', 'e-commerce'
    ];
    
    const found = keywords.filter(kw => 
      description.toLowerCase().includes(kw.toLowerCase())
    );
    
    return found;
  }

  matchExperience(requirements) {
    // Return experience bullets that match requirements
    if (!this.masterCV.experience) return [];
    
    return this.masterCV.experience.map(job => ({
      ...job,
      highlights: job.highlights.filter(bullet => 
        requirements.some(req => bullet.toLowerCase().includes(req))
      )
    })).filter(job => job.highlights.length > 0);
  }

  matchSkills(requirements) {
    // Match skills section to requirements
    if (!this.masterCV.skills) return [];
    
    return requirements.filter(req => 
      this.masterCV.skills.some(skill => 
        skill.toLowerCase().includes(req.toLowerCase())
      )
    );
  }

  generateSummary(jobDetails, requirements) {
    // Generate targeted summary paragraph
    return `${this.masterCV.name} is a ${jobDetails.title} with ${this.masterCV.yearsExperience} years of experience in ${requirements.slice(0, 3).join(', ')}. Proven track record of ${this.masterCV.keyAchievement}.`;
  }

  generateVersionName(jobDetails) {
    // Generate version name: company-role-timestamp
    const company = jobDetails.company?.toLowerCase().replace(/\s+/g, '-') || 'unknown';
    const role = jobDetails.title?.toLowerCase().replace(/\s+/g, '-').substring(0, 20) || 'role';
    const timestamp = new Date().toISOString().split('T')[0];
    return `${company}-${role}-${timestamp}`;
  }

  saveVersion(name, cvData) {
    const dir = path.join(process.cwd(), 'cv-versions');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    
    const filePath = path.join(dir, `${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(cvData, null, 2));
    
    // Also generate markdown for human reading
    const mdPath = path.join(dir, `${name}.md`);
    fs.writeFileSync(mdPath, this.generateMarkdown(cvData));
    
    return filePath;
  }

  generateMarkdown(cvData) {
    return `# ${cvData.name}
## ${cvData.title}

${cvData.summary}

## Experience
${cvData.experience.map(job => `
### ${job.title} | ${job.company}
${job.highlights.map(h => `- ${h}`).join('\n')}
`).join('\n')}

## Skills
${cvData.skills.join(', ')}
`;
  }
}

module.exports = CVTailor;
