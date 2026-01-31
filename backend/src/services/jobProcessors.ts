import { Job } from 'bull';
import Resume from '../models/Resume';
import Evaluation from '../models/Evaluation';
import { evaluateResume } from '../ai/evaluation-engine/geminiService';
import HiringForm from '../models/HiringForm';
import Prompt from '../models/Prompt';
import Audit from '../models/Audit';

// Resume parsing job processor
export const processResumeParseJob = async (job: Job) => {
  const { resumeId } = job.data;
  
  try {
    console.log(`Processing resume parse job for resume: ${resumeId}`);
    
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      throw new Error('Resume not found');
    }

    // Here you would implement AI-powered parsing
    // For now, we'll do basic text extraction and structuring
    const rawText = resume.rawText || '';
    
    // Basic parsing logic (replace with actual AI parsing)
    const parsedContent = {
      skills: extractSkills(rawText),
      experience: extractExperience(rawText),
      education: extractEducation(rawText),
      projects: extractProjects(rawText)
    };

    // Update resume with parsed content
    resume.parsedContent = parsedContent;
    resume.processingStatus = 'completed';
    resume.processingCompletedAt = new Date();
    resume.parseStatus = 'pending'; // Ready for human review
    resume.searchText = `${resume.originalName} ${rawText} ${parsedContent.skills.join(' ')}`.substring(0, 2000);
    
    await resume.save();
    
    console.log(`Successfully parsed resume: ${resumeId}`);
    return { success: true, resumeId };
    
  } catch (error) {
    console.error(`Failed to parse resume ${resumeId}:`, error);
    
    // Update resume with error
    await Resume.findByIdAndUpdate(resumeId, {
      processingStatus: 'failed',
      processingError: error instanceof Error ? error.message : 'Unknown error',
      processingCompletedAt: new Date()
    });
    
    throw error;
  }
};

// Evaluation job processor
export const processEvaluationJob = async (job: Job) => {
  const { resumeId, hiringFormId, userId } = job.data;
  
  try {
    console.log(`Processing evaluation job for resume: ${resumeId}, form: ${hiringFormId}`);
    
    const [resume, hiringForm] = await Promise.all([
      Resume.findById(resumeId),
      HiringForm.findById(hiringFormId)
    ]);
    
    if (!resume || !hiringForm) {
      throw new Error('Resume or HiringForm not found');
    }

    if (resume.parseStatus !== 'approved') {
      throw new Error('Resume must be approved before evaluation');
    }

    // Get appropriate prompt
    let prompt;
    if (hiringForm.industry) {
      prompt = await Prompt.findActiveByIndustry(hiringForm.industry);
    }
    if (!prompt) {
      prompt = await Prompt.findDefault();
    }
    
    const systemPrompt = prompt?.systemPrompt || 'Evaluate this resume objectively.';
    const promptVersion = prompt?.version || 1;

    // Prepare resume text for evaluation
    const resumeText = formatResumeForEvaluation(resume.parsedContent);
    
    // Evaluate using AI
    const startTime = Date.now();
    const evaluationResult = await evaluateResume(
      resumeText,
      hiringForm,
      systemPrompt,
      {
        autoShortlist: hiringForm.autoShortlistThreshold,
        furtherReview: hiringForm.cutoffThreshold - 20
      },
      promptVersion
    );
    const processingTime = Date.now() - startTime;

    // Create evaluation record
    const evaluation = new Evaluation({
      resumeId: resume._id,
      hiringFormId: hiringForm._id,
      evaluatedBy: userId,
      promptVersion,
      candidateName: evaluationResult.evaluation.candidateName || resume.originalName.replace(/\.[^/.]+$/, ''),
      overallScore: evaluationResult.evaluation.score || 0,
      confidence: evaluationResult.evaluation.confidence || 0,
      eligibility: evaluationResult.evaluation.eligibility || 'NOT_MATCHED',
      categoryScores: buildCategoryScores(evaluationResult.evaluation, hiringForm),
      explanation: evaluationResult.evaluation.explanation || '',
      plainLanguageSummary: evaluationResult.evaluation.plainLanguageSummary || '',
      strengths: evaluationResult.evaluation.strengths || [],
      gaps: evaluationResult.evaluation.gaps || [],
      riskFlags: evaluationResult.evaluation.riskFlags || [],
      integritySignals: evaluationResult.evaluation.integritySignals || [],
      resumeQualityScore: evaluationResult.evaluation.resumeQualityScore || 0,
      evidence: evaluationResult.evaluation.evidence || [],
      isFlaggedForReview: evaluationResult.evaluation.isFlaggedForReview || false,
      processingTime,
      aiModelVersion: 'gemini-3-flash-preview'
    });

    await evaluation.save();
    
    // Update resume with evaluation reference
    resume.evaluationId = evaluation._id;
    resume.status = 'evaluated';
    await resume.save();

    // Update hiring form usage
    hiringForm.usageCount = (hiringForm.usageCount || 0) + 1;
    hiringForm.lastUsedAt = new Date();
    await hiringForm.save();

    // Update prompt usage
    if (prompt) {
      prompt.usageCount = (prompt.usageCount || 0) + 1;
      prompt.lastUsedAt = new Date();
      await prompt.save();
    }
    
    console.log(`Successfully evaluated resume: ${resumeId}`);
    return { success: true, evaluationId: evaluation._id, resumeId };
    
  } catch (error) {
    console.error(`Failed to evaluate resume ${resumeId}:`, error);
    throw error;
  }
};

// Helper functions for parsing (replace with actual AI parsing)
function extractSkills(text: string): string[] {
  const skills: string[] = [];
  const skillKeywords = ['javascript', 'python', 'react', 'node.js', 'aws', 'docker', 'mongodb', 'sql', 'java', 'c++', 'typescript', 'git'];
  
  const lowerText = text.toLowerCase();
  skillKeywords.forEach(skill => {
    if (lowerText.includes(skill)) {
      skills.push(skill);
    }
  });
  
  return [...new Set(skills)]; // Remove duplicates
}

function extractExperience(text: string): any[] {
  const experiences: any[] = [];
  // Basic regex to extract experience (replace with proper AI parsing)
  const experienceRegex = /(\d{4})\s*[-–]\s*(\d{4}|\w+)\s*(.+?)(?=\d{4}\s*[-–]|$)/gi;
  let match;
  
  while ((match = experienceRegex.exec(text)) !== null) {
    experiences.push({
      title: 'Position',
      company: match[3]?.trim().split('\n')[0] || 'Unknown Company',
      duration: `${match[1]} - ${match[2]}`,
      startDate: new Date(match[1], 0, 1),
      endDate: match[2] === 'present' ? new Date() : new Date(match[2], 0, 1),
      description: match[3]?.trim()
    });
  }
  
  return experiences.slice(0, 3); // Limit to 3 most recent
}

function extractEducation(text: string): any[] {
  const education: any[] = [];
  // Basic regex to extract education (replace with proper AI parsing)
  const educationRegex = /(bachelor|master|phd|degree|diploma|certificate)/gi;
  const matches = text.match(educationRegex);
  
  if (matches) {
    education.push({
      degree: matches[0] + ' Degree',
      institution: 'University',
      startDate: new Date(2015, 0, 1),
      endDate: new Date(2019, 0, 1)
    });
  }
  
  return education;
}

function extractProjects(text: string): any[] {
  const projects: any[] = [];
  // Basic extraction (replace with proper AI parsing)
  const projectKeywords = ['project', 'developed', 'built', 'created', 'implemented'];
  const sentences = text.split('.');
  
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    if (projectKeywords.some(keyword => lowerSentence.includes(keyword))) {
      projects.push({
        name: 'Project',
        description: sentence.trim(),
        technologies: extractSkills(sentence),
        duration: '3 months'
      });
    }
  });
  
  return projects.slice(0, 3); // Limit to 3 projects
}

function formatResumeForEvaluation(parsedContent: any): string {
  const { skills = [], experience = [], education = [], projects = [] } = parsedContent;
  
  return `
SKILLS:
${skills.join(', ')}

EXPERIENCE:
${experience.map((exp: any) => `${exp.title} at ${exp.company} (${exp.duration})\n${exp.description || ''}`).join('\n\n')}

EDUCATION:
${education.map((edu: any) => `${edu.degree} from ${edu.institution}`).join('\n')}

PROJECTS:
${projects.map((proj: any) => `${proj.name}: ${proj.description}\nTechnologies: ${proj.technologies?.join(', ') || ''}`).join('\n\n')}
  `.trim();
}

function buildCategoryScores(evaluation: any, hiringForm: any): any[] {
  const categories = hiringForm.evaluationCategories || [];
  
  return categories.map((category: any) => ({
    name: category.name,
    score: Math.floor(Math.random() * 40) + 60, // Placeholder - replace with actual AI scoring
    weight: category.weight,
    reasoning: `${category.name} assessment based on resume content`,
    evidence: evaluation.evidence?.filter((e: any) => e.category === category.name) || [],
    strengths: [],
    gaps: [],
    confidence: 0.8
  }));
}