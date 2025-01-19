import axios from 'axios';

const WHATSAPP_API_URL = 'https://7105.api.greenapi.com';
const ID_INSTANCE = '7105177139';
const API_TOKEN = '9121ab77b9bd466ba366496dc796d68ec805fc1a34b047088d';

interface ClientData {
  name: string;
  email: string;
  phone: string;
}

function formatPhoneNumber(phone: string): string {
  // הסרת כל התווים שאינם ספרות
  const digitsOnly = phone.replace(/\D/g, '');
  
  // אם המספר מתחיל ב-0, נחליף אותו ב-972
  if (digitsOnly.startsWith('0')) {
    return '972' + digitsOnly.substring(1);
  }
  
  // אם המספר כבר מתחיל ב-972, נחזיר אותו כמו שהוא
  if (digitsOnly.startsWith('972')) {
    return digitsOnly;
  }
  
  // אם המספר מתחיל ב-+972, נחזיר אותו בלי ה+
  if (digitsOnly.startsWith('972')) {
    return digitsOnly;
  }
  
  // במקרה שיש רק את הספרות ללא קידומת, נוסיף 972
  return '972' + digitsOnly;
}

export async function sendWhatsAppMessage(clientData: ClientData) {
  try {
    // בדיקה אם אנחנו במצב פיתוח
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - skipping WhatsApp message');
      console.log('Would have sent:', {
        to: '972509365605@c.us',
        message: createMessage(clientData, formatPhoneNumber(clientData.phone))
      });
      return;
    }

    const receiverPhone = '972509365605'; // מספר הטלפון של מקבל ההודעה
    const clientPhone = formatPhoneNumber(clientData.phone);
    const message = createMessage(clientData, clientPhone);

    console.log('Sending WhatsApp message to:', receiverPhone);
    console.log('Message:', message);

    const response = await axios.post(
      `${WHATSAPP_API_URL}/waInstance${ID_INSTANCE}/sendMessage/${API_TOKEN}`,
      {
        chatId: `${receiverPhone}@c.us`,
        message
      }
    );

    console.log('WhatsApp message sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    throw error;
  }
}

function createMessage(clientData: ClientData, formattedPhone: string): string {
  return `הודעה ממערכת סיוויט 🌟

פרטי לקוח חדש:
👤 שם: ${clientData.name}
📧 אימייל: ${clientData.email}
📱 טלפון: ${clientData.phone}

לשליחת הודעת וואטסאפ ללקוח:
https://wa.me/${formattedPhone}`;
} 