export interface CVAnswers {
  personal_details: string;
  experience: string;
  education: string;
  skills: string;
  languages: string;
  military_service: string;
  recommendations: string;
  highlights: string;
}

export interface SaveCVRequest {
  content: CVAnswers;
  sessionId: string;
} 