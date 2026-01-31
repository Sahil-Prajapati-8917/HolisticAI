
import { HiringForm, EvaluationResult, CandidateProfile } from "../types";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const evaluateResume = async (
  resumeText: string,
  hiringForm: HiringForm,
  systemPrompt: string,
  thresholds: { autoShortlist: number; furtherReview: number },
  promptVersion: number = 1
): Promise<{ evaluation: Partial<EvaluationResult>, profile: CandidateProfile }> => {
  try {
    const response = await fetch(`${API_URL}/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText,
        hiringForm,
        systemPrompt,
        thresholds,
        promptVersion
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Evaluation failed:', error);
    throw error;
  }
};

