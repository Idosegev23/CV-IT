import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { profile, sessionId } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    // בדוק אם המשתמש רכש חבילת Advanced או Pro
    const { data: cvData, error: cvError } = await supabase
      .from('cv_data')
      .select('package')
      .eq('session_id', sessionId)
      .single();

    if (cvError) throw cvError;

    if (!['advanced', 'pro'].includes(cvData.package)) {
      return NextResponse.json(
        { error: 'Package upgrade required' },
        { status: 403 }
      );
    }

    // כאן תצטרך להוסיף את הלוגיקה של התחברות ל-LinkedIn API
    // ועדכון הפרופיל באמצעות הנתונים שהתקבלו

    const linkedInResponse = await fetch('https://api.linkedin.com/v2/people/(id:{person ID})', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-RestLi-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        patch: {
          $set: {
            firstName: {
              localized: {
                "en_US": profile.firstName
              },
              preferredLocale: {
                country: "US",
                language: "en"
              }
            },
            lastName: {
              localized: {
                "en_US": profile.lastName
              },
              preferredLocale: {
                country: "US",
                language: "en"
              }
            },
            headline: {
              localized: {
                "en_US": profile.headline
              },
              preferredLocale: {
                country: "US",
                language: "en"
              }
            },
            summary: {
              localized: {
                "en_US": {
                  rawText: profile.summary
                }
              },
              preferredLocale: {
                country: "US",
                language: "en"
              }
            },
            industryId: profile.industryId,
            vanityName: profile.vanityName
          }
        }
      })
    });

    if (!linkedInResponse.ok) {
      throw new Error('Failed to update LinkedIn profile');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating LinkedIn profile:', error);
    return NextResponse.json(
      { error: 'Failed to update LinkedIn profile' },
      { status: 500 }
    );
  }
} 