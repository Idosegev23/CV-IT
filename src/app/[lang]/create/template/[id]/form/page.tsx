import type { Metadata } from 'next'
import FormPageClient from './FormPageClient'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'

type PageProps = {
 params: Promise<{
   lang: string;
   id: string;
 }>;
}

export default async function FormPage({ params }: PageProps) {
 const resolvedParams = await params;
 
 try {
   if (!resolvedParams.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
     redirect(`/${resolvedParams.lang}/templates`);
   }

   const { data: initialData, error } = await supabase
     .from('sessions')
     .select('*')
     .eq('id', resolvedParams.id)
     .single();
   
   if (error) {
     console.error('Error fetching session:', error);
     redirect(`/${resolvedParams.lang}/templates`);
   }
   
   return (
     <div className="bg-[#EAEAE7]">
       <FormPageClient 
         initialLang={resolvedParams.lang} 
         initialId={resolvedParams.id} 
         initialData={initialData}
       />
     </div>
   );
 } catch (error) {
   console.error('Error in form page:', error);
   redirect(`/${resolvedParams.lang}/templates`);
 }
}