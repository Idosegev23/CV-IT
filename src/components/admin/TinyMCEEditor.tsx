'use client';

import { Editor } from '@tinymce/tinymce-react';

interface TinyMCEEditorProps {
  initialValue: string;
  onEditorChange: (content: string) => void;
}

export default function TinyMCEEditor({ initialValue, onEditorChange }: TinyMCEEditorProps) {
  return (
    <Editor
      apiKey="your-api-key" // קבל מפתח מ-https://www.tiny.cloud/
      init={{
        height: 300,
        menubar: false,
        directionality: 'rtl',
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignright aligncenter alignleft alignjustify | ' +
          'bullist numlist outdent indent | ' +
          'removeformat | help',
        content_style: 'body { font-family:Arial,Helvetica,sans-serif; font-size:14px }',
        language: 'he_IL',
        language_url: '/tinymce/langs/he_IL.js'
      }}
      initialValue={initialValue}
      onEditorChange={onEditorChange}
    />
  );
} 