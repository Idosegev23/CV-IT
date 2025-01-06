export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
}

export interface ConversationState {
  currentTopic: TopicType;
  depth: {
    experience: number;
    education: number;
    projects: number;
    recommendations: number;
    volunteering: number;
  };
  previousResponses: string[];
}

export type TopicType = 
  | 'INTRO'
  | 'EXPERIENCE'
  | 'EDUCATION'
  | 'PROJECTS'
  | 'SKILLS'
  | 'RECOMMENDATIONS'
  | 'VOLUNTEERING'
  | 'SUMMARY';

export interface CVData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  experience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
    achievements: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationYear: string;
    achievements: string[];
  }>;
  recommendations: Array<{
    name: string;
    role: string;
    company: string;
    relationship: string;
    quote?: string;
    contactInfo?: {
      phone?: string;
      email?: string;
    };
  }>;
  volunteering: Array<{
    organization: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
    impact: string;
    achievements: string[];
    skills: string[];
  }>;
} 