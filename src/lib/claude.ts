import { Language, ChatMessage } from './types';
import { CV_CREATION_SYSTEM_PROMPT, generateNextPrompt } from './prompts';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from './supabase';

export class ClaudeService {
  processChat(sessionId: any, message: any, language: any) {
      throw new Error('Method not implemented.');
  }
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
    });
  }

  async getChatResponse(message: string, session_id: string, language: Language) {
    try {
      // שליפת היסטוריית השיחה מהדאטהבייס
      const { data: chatHistory } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session_id)
        .order('created_at', { ascending: true });

      // יצירת הקונטקסט לפרומפט הבא
      const currentContext = chatHistory?.reduce((acc, msg) => {
        if (msg.role === 'assistant') {
          try {
            const response = JSON.parse(msg.content);
            return response.collectedData || acc;
          } catch (e) {
            return acc;
          }
        }
        return acc;
      }, {});

      // יצירת הפרומפט המלא
      const fullPrompt = generateNextPrompt(currentContext, message, language);

      // שליחה לקלוד
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8192,
        messages: [{
          role: 'user',
          content: fullPrompt
        }],
        system: CV_CREATION_SYSTEM_PROMPT
      });

      // שמירת התשובה בדאטהבייס
      const assistantMessage: Omit<ChatMessage, 'id' | 'created_at'> = {
        role: 'assistant',
        content: response.content[0].type === 'text' ? response.content[0].text : '',
        session_id,
        language
      };

      const { error: saveError } = await supabase
        .from('chat_messages')
        .insert({
          ...assistantMessage,
          created_at: new Date()
        });

      if (saveError) throw saveError;

      // שמירת הודעת המשתמש
      const userMessage: Omit<ChatMessage, 'id' | 'created_at'> = {
        role: 'user',
        content: message,
        session_id,
        language
      };

      const { error: userMsgError } = await supabase
        .from('chat_messages')
        .insert({
          ...userMessage,
          created_at: new Date()
        });

      if (userMsgError) throw userMsgError;

      return response.content[0].type === 'text' ? response.content[0].text : '';

    } catch (error) {
      console.error('Error in getChatResponse:', error);
      throw error;
    }
  }
}

// יצירת מופע יחיד של השירות
export const claudeService = new ClaudeService();