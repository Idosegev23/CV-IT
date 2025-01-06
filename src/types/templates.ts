export interface Template {
  id: string;
  name: {
    he: string;
    en: string;
  };
  description: {
    he: string;
    en: string;
  };
  suitable: {
    he: string[];
    en: string[];
  };
  image: string;
}

export const templates: { [key: string]: Template[] } = {
  he: [
    {
      id: 'modern-1',
      name: {
        he: 'מודרני מקצועי',
        en: 'Modern Professional'
      },
      description: {
        he: 'תבנית מודרנית עם דגש על ניסיון מקצועי',
        en: 'Modern template focusing on professional experience'
      },
      image: '/templates/modern-1.png',
      suitable: {
        he: [
          'אנשי מקצוע',
          'מנהלים',
          'מפתחים'
        ],
        en: [
          'Professionals',
          'Managers',
          'Developers'
        ]
      }
    },
    // ... more templates
  ],
  en: [
    {
      id: 'modern-1',
      name: {
        he: 'מודרני מקצועי',
        en: 'Modern Professional'
      },
      description: {
        he: 'תבנית מודרנית עם דגש על ניסיון מקצועי',
        en: 'Modern template focusing on professional experience'
      },
      image: '/templates/modern-1.png',
      suitable: {
        he: [
          'אנשי מקצוע',
          'מנהלים',
          'מפתחים'
        ],
        en: [
          'Professionals',
          'Managers',
          'Developers'
        ]
      }
    },
    // ... more templates
  ]
}; 