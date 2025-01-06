export interface PageProps {
  params: { 
    lang: string;
    id?: string;
    templateId?: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
} 