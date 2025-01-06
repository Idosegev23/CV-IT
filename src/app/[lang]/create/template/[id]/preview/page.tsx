'use client';

import { use } from 'react';
import { CVDisplay } from '@/components/CVDisplay/index';

interface PreviewPageProps {
  params: Promise<{ lang: string; id: string }>;
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const resolvedParams = use(params);
  
  return (
    <div className="min-h-screen relative bg-[#EAEAE7]">
      <div 
        className="fixed bottom-0 right-0 w-full h-[75vh] pointer-events-none [mask-image:url('/design/BGvector.svg')] [mask-size:contain] [mask-position:bottom_right] [mask-repeat:no-repeat]"
        style={{
          backgroundColor: 'white',
          opacity: 0.5
        }}
      />

      <div className="container mx-auto relative z-10">
        <CVDisplay 
          sessionId={resolvedParams.id} 
          lang={resolvedParams.lang}
          hideButtons={true}
        />
      </div>
    </div>
  );
}