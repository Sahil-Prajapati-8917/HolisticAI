
import { GoogleGenAI, Type } from "@google/genai";
import { HiringForm, EligibilityStatus, EvaluationResult, CandidateStatus, CandidateProfile } from "../../types";
import { INDUSTRY_BASE_PROMPTS } from "../../constants";

const getAiClient = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

export const evaluateResume = async (
    resumeText: string,
    hiringForm: HiringForm,
    systemPrompt: string,
    thresholds: { autoShortlist: number; furtherReview: number },
    promptVersion: number = 1
): Promise<{ evaluation: Partial<EvaluationResult>, profile: CandidateProfile }> => {
    const ai = getAiClient();
    const industryBase = INDUSTRY_BASE_PROMPTS[hiringForm.industry] || INDUSTRY_BASE_PROMPTS['Other'];

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
      General Instructions: ${systemPrompt}
      Industry-Specific Focus: ${industryBase}
      
      Hiring Context:
      Role: ${hiringForm.jobTitle}
      Requirements: ${hiringForm.requirements}
      
      Resume Text:
      ${resumeText}

      TASK:
      1. Evaluation Scorecard (Score, Confidence, Explanation, Strengths, Gaps, Risks).
      2. Structured Profile (Skills, Experience Timeline, Education, Key Projects).
      3. Resume Integrity Check (Score 0-100).
    `,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    evaluation: {
                        type: Type.OBJECT,
                        properties: {
                            candidateName: { type: Type.STRING },
                            score: { type: Type.NUMBER },
                            confidence: { type: Type.NUMBER },
                            explanation: { type: Type.STRING },
                            plainLanguageSummary: { type: Type.STRING },
                            resumeQualityScore: { type: Type.NUMBER },
                            integritySignals: { type: Type.ARRAY, items: { type: Type.STRING } },
                            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                            gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                            riskFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
                            evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ['candidateName', 'score', 'confidence', 'explanation', 'resumeQualityScore', 'strengths', 'gaps']
                    },
                    profile: {
                        type: Type.OBJECT,
                        properties: {
                            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                            experienceTimeline: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        company: { type: Type.STRING },
                                        duration: { type: Type.STRING }
                                    }
                                }
                            },
                            education: { type: Type.ARRAY, items: { type: Type.STRING } },
                            keyProjects: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['skills', 'experienceTimeline', 'education']
                    }
                },
                required: ['evaluation', 'profile'],
            },
        },
    });

    const data = JSON.parse(response.text || '{}');
    const evalData = data.evaluation;

    let eligibility = EligibilityStatus.NOT_MATCHED;
    if (evalData.score >= thresholds.autoShortlist) {
        eligibility = EligibilityStatus.AUTO_SHORTLIST;
    } else if (evalData.score >= thresholds.furtherReview) {
        eligibility = EligibilityStatus.POTENTIAL_MATCH;
    } else if (evalData.score >= thresholds.furtherReview - 20) {
        eligibility = EligibilityStatus.FURTHER_REVIEW;
    }

    return {
        evaluation: {
            ...evalData,
            eligibility,
            status: CandidateStatus.UNDER_PROCESS,
            feedback: [],
            promptVersion,
            isFlaggedForReview: evalData.confidence < 0.6, // AI Safety Flag
            timestamp: new Date().toISOString()
        },
        profile: data.profile
    };
};
