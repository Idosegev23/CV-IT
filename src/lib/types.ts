// טיפוסים בסיסיים
export type Language = 'he' | 'en';

export interface CVData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  professionalSummary: string;
  experience: {
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    graduationYear: string;
    description: string;
  }[];
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  military: {
    role: string;
    unit: string;
    period: string;
    description: string;
    achievements: string[];
  };
  projects: {
    name: string;
    description: string;
    technologies: string[];
    achievements: string[];
  }[];
  recommendations: {
    name: string;
    role: string;
    company: string;
    text: string;
  }[];
}

export type ChatRole = 'assistant' | 'user' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  created_at: Date;
  session_id?: string;
  language?: string;
}

export interface SessionMetadata {
  fullName: string;
  city: string;
  phone: string;
  email: string;
  lastPosition: string;
  lastPositionYears: string;
  yearsOfExperience: string;
  currentCompany: string;
  desiredPosition: string;
  jobSearchArea: string;
  relevantPositions: string;
  availabilityDate: string;
  expectedSalary: string;
  willingToRelocate: boolean;
}

export interface Session {
  id: string;
  templateId: string;
  language: Language;
  status: 'active' | 'completed' | 'expired';
  currentStep: string;
  metadata: SessionMetadata;
  expiresAt: Date;
  createdAt: Date;
}

export interface ClaudeResponse {
  content: Array<{
    type: 'text' | 'image' | 'tool_use';
    text?: string;
  }>;
  role: string;
  model: string;
  id: string;
}

// מבנה קורות החיים
export interface CVStructure {
  personal_details: {
    name: string;
    email: string;
    phone: string;
    address: string;
    birth_date: string;
  };
  professional_summary: string;
  experience: Array<{
    title: string;
    company: string;
    years: string;
    achievements: string[];
  }>;
  education: {
    degrees: Array<{
      type: string;     // לדוגמה: "תואר ראשון" או "תואר שני"
      field: string;    // לדוגמה: "הנדסת תעשייה וניהול"
      institution: string;
      years: string;
      specialization?: string;
    }>;
  };
  military_service: {
    role: string;
    years: string;
    achievements: string[];
  };
  skills: string[];
  languages: Record<string, string>;
  additional_info: {
    certifications: string[];
  };
}

export const CV_STRUCTURE: CVStructure = {
  personal_details: {
    name: "",
    email: "",
    phone: "",
    address: "",
    birth_date: ""
  },
  professional_summary: "",
  experience: [{
    title: "",
    company: "",
    years: "",
    achievements: []
  }],
  education: {
    degrees: [{
      type: "",
      field: "",
      institution: "",
      years: "",
      specialization: ""
    }]
  },
  military_service: {
    role: "",
    years: "",
    achievements: []
  },
  skills: [],
  languages: {},
  additional_info: {
    certifications: []
  }
}; 