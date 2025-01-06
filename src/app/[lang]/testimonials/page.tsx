import { TestimonialsClient } from './TestimonialsClient';

type PageProps = {
  params: Promise<{
    lang: string;
  }>;
};

interface TestimonialsPageProps extends PageProps {}

async function TestimonialsPage({ params }: TestimonialsPageProps) {
  const { lang } = await params;
  return <TestimonialsClient lang={lang} />;
}

export default TestimonialsPage; 