export interface Dictionary {
  errors: {
    notFound: string;
    saveFailed: string;
    loadFailed: string;
    invalidData: string;
    formatFailed: string;
    autoSaveFailed: string;
    pdfGenerationFailed: string;
    sendFailed: string;
    translationFailed: string;
  };
  messages: {
    saved: string;
    unsaved: string;
    confirmDelete: string;
    editTemplate: string;
    autoSaved: string;
    downloadSuccess: string;
    downloadError: string;
    processing: string;
    sendSuccess: string;
    sendError: string;
    cvSent: string;
    translationSuccess: string;
    translationError: string;
    previewError: string;
  };
  buttons: {
    save: string;
    saving: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    download: string;
    close: string;
    back: string;
    downloadDocx: string;
    downloadPdf: string;
    select: string;
    selected: string;
    findJob: string;
    loading: string;
    preview: string;
  };
  sections: {
    personalInfo: string;
    experience: string;
    education: string;
    military: string;
    skills: string;
    recommendations: string;
    navigation: {
      next: string;
      back: string;
    };
    [key: string]: string | { [key: string]: string };
  };
  personal: {
    name: string;
    namePlaceholder: string;
    title: string;
    titlePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    address: string;
    addressPlaceholder: string;
    linkedin: string;
    linkedinPlaceholder: string;
    summary: string;
    summaryPlaceholder: string;
    birthYear: string;
    status: string;
    viewProfile: string;
  };
  experience: {
    title: string;
    position: string;
    positionPlaceholder: string;
    company: string;
    companyPlaceholder: string;
    location: string;
    locationPlaceholder: string;
    startDate: string;
    endDate: string;
    current: string;
    description: string;
    descriptionPlaceholder: string;
    achievements: string;
    achievementsPlaceholder: string;
    addDescription: string;
    addAchievement: string;
    addNew: string;
  };
  education: {
    title: string;
    degree: string;
    degreePlaceholder: string;
    institution: string;
    institutionPlaceholder: string;
    field: string;
    fieldPlaceholder: string;
    graduationDate: string;
    description: string;
    descriptionPlaceholder: string;
    addDescription: string;
    addNew: string;
  };
  military: {
    title: string;
    role: string;
    rolePlaceholder: string;
    unit: string;
    unitPlaceholder: string;
    startDate: string;
    endDate: string;
    description: string;
    descriptionPlaceholder: string;
    achievements: string;
    achievementsPlaceholder: string;
    addDescription: string;
    addAchievement: string;
  };
  skills: {
    title: string;
    technical: string;
    technicalPlaceholder: string;
    soft: string;
    softPlaceholder: string;
    languages: string;
    languagePlaceholder: string;
    addTechnical: string;
    addSoft: string;
    addLanguage: string;
    levels: {
      native: string;
      fluent: string;
      professional: string;
      intermediate: string;
      basic: string;
    };
  };
  references: {
    title: string;
    name: string;
    namePlaceholder: string;
    position: string;
    positionPlaceholder: string;
    company: string;
    companyPlaceholder: string;
    relationship: string;
    relationshipPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    addNew: string;
  };
  editor: {
    edit: string;
    preview: string;
    save: string;
    selectFont: string;
    selectSize: string;
    bold: string;
    italic: string;
    underline: string;
    alignLeft: string;
    alignCenter: string;
    alignRight: string;
    bulletList: string;
    numberList: string;
    indent: string;
    addLink: string;
    removeLink: string;
    addImage: string;
    toggleDirection: string;
    openToolbar: string;
    undo: string;
    redo: string;
  };
  aria: {
    cvPreview: string;
    downloadOptions: string;
    [key: string]: string;
  };
  templates: {
    title: string;
    classic: {
      name: string;
      description: string;
      suitable: string[];
    };
    professional: {
      name: string;
      description: string;
      suitable: string[];
    };
    general: {
      name: string;
      description: string;
      suitable: string[];
    };
    creative: {
      name: string;
      description: string;
      suitable: string[];
    };
    [key: string]: any;
  };
  preview: {
    title: string;
  };
  mobile: {
    downloadPdf: string;
    downloadDocx: string;
    findJob: string;
    previewTitle: string;
    previewDescription: string;
    downloadTip: string;
  };
  [key: string]: any;
} 