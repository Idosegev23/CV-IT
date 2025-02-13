import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ErrorContext {
  location: string;
  action: string;
  previousState?: any;
  currentState?: any;
  additionalData?: any;
  userAgent?: string;
  timestamp: number;
  paymentStage?: string;
  lastSuccessfulStep?: string;
  route?: string;
}

interface ErrorDetails {
  error: Error | unknown;
  sessionId?: string;
  userId?: string;
  context: ErrorContext;
  request?: {
    url?: string;
    method?: string;
    body?: any;
    headers?: any;
  };
}

export async function reportError(details: ErrorDetails) {
  try {
    const errorTime = new Date().toISOString();
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // שליפת מידע נוסף מ-Supabase אם יש sessionId
    let userData = null;
    let cvData = null;
    if (details.sessionId) {
      const { data: cv } = await supabase
        .from('cv_data')
        .select('*, sessions!inner(*)')
        .eq('session_id', details.sessionId)
        .single();
      
      cvData = cv;
    }

    // בניית תוכן המייל
    const emailContent = `
      <h2 style="color: #ff0000;">שגיאה קריטית ב-CVIT</h2>
      <div style="background: #f8f8f8; padding: 15px; border-radius: 5px;">
        <h3>פרטים מהירים:</h3>
        <ul>
          <li>זמן: ${new Date().toLocaleString('he-IL')}</li>
          <li>סוג שגיאה: ${details.context.action}</li>
          <li>מיקום: ${details.context.location}</li>
          <li>שלב בתהליך: ${details.context.paymentStage || 'לא ידוע'}</li>
        </ul>

        <h3>פרטי משתמש:</h3>
        ${cvData ? `
          <ul>
            <li>חבילה: ${cvData.sessions?.package}</li>
            <li>סטטוס תשלום: ${cvData.payment_status}</li>
            <li>זמן התחלה: ${cvData.created_at}</li>
          </ul>
        ` : 'אין מידע על המשתמש'}

        <h3>שחזור השגיאה:</h3>
        <ol>
          <li>מיקום אחרון: ${details.context.route || 'לא ידוע'}</li>
          <li>שלב אחרון שהצליח: ${details.context.lastSuccessfulStep || 'לא ידוע'}</li>
          <li>פעולה שנכשלה: ${details.context.action}</li>
        </ol>

        <div style="background: #fff3f3; padding: 10px; margin-top: 15px;">
          <h4>Stack Trace:</h4>
          <pre>${details.error instanceof Error ? details.error.stack : JSON.stringify(details.error, null, 2)}</pre>
        </div>
      </div>

      <div style="margin-top: 20px; padding: 10px; background: #e6f3ff;">
        <h3>קישורים מהירים:</h3>
        <ul>
          <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/session/${details.sessionId}">צפה בסשן</a></li>
          <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/errors/${errorId}">צפה בפרטי השגיאה</a></li>
        </ul>
      </div>
    `;

    // שליחת המייל
    const priority = determineErrorPriority(details);
    const subject = `[CVIT ${priority.toUpperCase()}] ${details.context.location} - ${errorTime}`;
    await fetch('/api/send-error-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'support@cvit.co.il',
        subject: subject,
        html: emailContent,
        errorId
      }),
    });

    // שמירת השגיאה בדאטהבייס לתיעוד
    await supabase.from('error_logs').insert({
      error_id: errorId,
      session_id: details.sessionId,
      user_id: details.userId,
      error_details: {
        error: details.error instanceof Error ? 
          { message: details.error.message, stack: details.error.stack } : 
          details.error,
        context: details.context,
        request: details.request
      },
      created_at: errorTime
    });

  } catch (reportError) {
    console.error('Failed to report error:', reportError);
  }
}

function determineErrorPriority(details: ErrorDetails): 'low' | 'medium' | 'high' | 'critical' {
  if (details.context.location.includes('Payment') || 
      details.context.action.includes('payment')) {
    return 'critical';
  }
  
  if (details.context.action.includes('generate-cv')) {
    return 'high';
  }
  
  return 'medium';
}

async function sendUrgentNotification(errorDetails: ErrorDetails) {
  if (determineErrorPriority(errorDetails) === 'critical') {
    await fetch('/api/notifications/urgent', {
      method: 'POST',
      body: JSON.stringify({
        message: `שגיאה קריטית ב-CVIT:
                 מיקום: ${errorDetails.context.location}
                 פעולה: ${errorDetails.context.action}
                 Session: ${errorDetails.sessionId}`
      })
    });
  }
} 