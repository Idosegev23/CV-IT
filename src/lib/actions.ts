'use server';

export async function saveCV(answers: Record<string, string>) {
  try {
    const response = await fetch('/api/save-cv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: answers
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save CV');
    }

    return response.json();
  } catch (error) {
    console.error('Error saving CV:', error);
    throw error;
  }
} 