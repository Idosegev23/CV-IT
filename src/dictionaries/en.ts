import { Dictionary } from "./dictionary";

export const en: Dictionary = {
 editor: {
   edit: 'Edit',
   preview: 'Preview', 
   save: 'Save',
   selectFont: 'Select Font',
   selectSize: 'Select Size',
   bold: 'Bold',
   italic: 'Italic',
   underline: 'Underline',
   alignLeft: 'Align Left',
   alignCenter: 'Align Center', 
   alignRight: 'Align Right',
   toggleDirection: 'Toggle Direction',
   bulletList: 'Bullet List',
   numberList: 'Number List',
   indent: 'Indent',
   addLink: 'Add Link',
   removeLink: 'Remove Link',
   addImage: 'Add Image',
   openToolbar: 'Open Toolbar',
   undo: 'Undo',
   redo: 'Redo'
 },
 errors: {
   notFound: 'Not Found',
   saveFailed: 'Save Failed',
   loadFailed: 'Load Failed',
   invalidData: 'Invalid Data',
   formatFailed: 'Format Failed',
   autoSaveFailed: 'Auto Save Failed'
 },
 messages: {
   saved: 'Saved',
   unsaved: 'Unsaved Changes',
   confirmDelete: 'Are you sure?',
   editTemplate: 'Edit Template',
   autoSaved: 'Auto Saved',
   downloadSuccess: 'File downloaded successfully',
   downloadError: 'Failed to download file',
   processing: 'Processing file...',
   sendSuccess: 'Sent successfully',
   sendError: 'Error sending'
 },
 buttons: {
   save: 'Save',
   saving: 'Saving...',
   cancel: 'Cancel',
   delete: 'Delete',
   edit: 'Edit',
   add: 'Add',
   download: 'Download',
   close: 'Close',
   back: 'Back',
   downloadDocx: 'Download as Word',
   downloadPdf: 'Download as PDF',
   select: 'Select',
   selected: 'Selected',
   finish: 'Finish'
 },
 sections: {
   personalInfo: 'Personal Information',
   experience: 'Experience', 
   education: 'Education',
   military: 'Military Service',
   skills: 'Skills',
   recommendations: 'Recommendations',
   navigation: {
     next: 'Next',
     back: 'Back'
   }
 },
 personal: {
   name: 'Full Name',
   namePlaceholder: 'Enter your full name',
   title: 'Job Title',
   titlePlaceholder: 'Enter your current job title',
   email: 'Email',
   emailPlaceholder: 'Enter your email address',
   phone: 'Phone',
   phonePlaceholder: 'Enter your phone number',
   address: 'Address',
   addressPlaceholder: 'Enter your address',
   linkedin: 'LinkedIn',
   linkedinPlaceholder: 'Enter your LinkedIn profile URL',
   summary: 'Professional Summary',
   summaryPlaceholder: 'Write a short summary of your experience and skills',
   birthYear: 'Birth Year',
   status: 'Marital Status',
   viewProfile: 'View Profile'
 },
 experience: {
   title: 'Work Experience',
   position: 'Position',
   positionPlaceholder: 'Enter job title',
   company: 'Company', 
   companyPlaceholder: 'Enter company name',
   location: 'Location',
   locationPlaceholder: 'City, Country',
   startDate: 'Start Date',
   endDate: 'End Date',
   current: 'Present',
   description: 'Job Description',
   descriptionPlaceholder: 'Describe your main responsibilities and tasks',
   achievements: 'Achievements',
   achievementsPlaceholder: 'Describe significant achievements in this role',
   addDescription: 'Add Description',
   addAchievement: 'Add Achievement',
   addNew: 'Add Work Experience'
 },
 education: {
   title: 'Education',
   degree: 'Degree',
   degreePlaceholder: 'Type of degree (e.g., Bachelor\'s)',
   institution: 'Institution',
   institutionPlaceholder: 'Name of educational institution',
   field: 'Field of Study',
   fieldPlaceholder: 'Your major or specialization',
   graduationDate: 'Graduation Date',
   description: 'Additional Details',
   descriptionPlaceholder: 'Add relevant information about your studies',
   addDescription: 'Add Details',
   addNew: 'Add Education'
 },
 military: {
   title: 'Military Service',
   role: 'Role',
   rolePlaceholder: 'Your military role',
   unit: 'Unit',
   unitPlaceholder: 'Unit name',
   startDate: 'Start Date',
   endDate: 'End Date', 
   description: 'Service Description',
   descriptionPlaceholder: 'Describe your role and responsibilities',
   achievements: 'Achievements',
   achievementsPlaceholder: 'List significant achievements during service',
   addDescription: 'Add Description',
   addAchievement: 'Add Achievement'
 },
 skills: {
   title: 'Skills',
   technical: 'Technical Skills',
   technicalPlaceholder: 'Add a technical skill',
   soft: 'Soft Skills',
   softPlaceholder: 'Add a soft skill',
   languages: 'Languages',
   languagePlaceholder: 'Add a language',
   addTechnical: 'Add Technical Skill',
   addSoft: 'Add Soft Skill',
   addLanguage: 'Add Language',
   levels: {
     native: 'Native',
     fluent: 'Fluent',
     professional: 'Professional',
     intermediate: 'Intermediate',
     basic: 'Basic'
   }
 },
 references: {
   title: 'References',
   name: 'Reference Name',
   namePlaceholder: 'Full name of reference',
   position: 'Position',
   positionPlaceholder: 'Reference\'s position',
   company: 'Company',
   companyPlaceholder: 'Company name',
   relationship: 'Professional Relationship',
   relationshipPlaceholder: 'Describe your professional relationship',
   phone: 'Phone',
   phonePlaceholder: 'Reference\'s phone number',
   email: 'Email',
   emailPlaceholder: 'Reference\'s email address',
   addNew: 'Add Reference'
 },
 direction: 'ltr',
 aria: {
   cvPreview: 'CV Preview',
   downloadOptions: 'Download Options',
 },
 templates: {
   title: 'Choose Your Perfect Template',
   classic: {
     name: 'Classic',
     description: 'Perfect for administrative positions, agents, and roles requiring order and organization',
     suitable: ['Administrative', 'Agents', 'Management', 'Traditional']
   },
   professional: {
     name: 'Professional',
     description: 'Suitable for managers, finance and high-tech professionals - emphasizes expertise',
     suitable: ['High-Tech', 'Finance', 'Senior Management', 'Professional']
   },
   general: {
     name: 'General',
     description: 'Flexible and suitable for various roles like customer service, sales and students',
     suitable: ['Customer Service', 'Sales', 'Students', 'Entry Level']
   },
   creative: {
     name: 'Creative',
     description: 'Designed for designers, marketers and artists who want to stand out',
     suitable: ['Design', 'Marketing', 'Media', 'Art']
   }
 },
 header: {
   templates: 'See Examples',
 },
 finish: {
   title: 'All Done!',
   subtitle: 'Your CV is ready! What would you like to do next?',
   translateButton: 'Translate CV to English',
   lookButton: 'Find a Job?',
   imageAlt: 'Process completed',
   translateAlt: 'Translate CV',
   lookAlt: 'Job search'
 }
};