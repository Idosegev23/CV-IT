import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

type PlatformType = 'facebook' | 'instagram' | 'linkedin' | 'google' | 'tiktok';

const PLATFORM_URLS: Record<PlatformType, { insights: string; ads: string }> = {
  facebook: {
    insights: 'https://business.facebook.com/insights',
    ads: 'https://business.facebook.com/ads/manager'
  },
  instagram: {
    insights: 'https://www.instagram.com/professional/dashboard',
    ads: 'https://business.facebook.com/ads/manager'
  },
  linkedin: {
    insights: 'https://www.linkedin.com/analytics',
    ads: 'https://www.linkedin.com/campaignmanager'
  },
  google: {
    insights: 'https://ads.google.com/aw/overview',
    ads: 'https://ads.google.com/aw/campaigns'
  },
  tiktok: {
    insights: 'https://ads.tiktok.com/i18n/statistics',
    ads: 'https://ads.tiktok.com/i18n/campaign'
  }
};

export async function POST(request: Request) {
  try {
    const { platform, username, password } = await request.json();

    if (!platform || !username || !password) {
      return NextResponse.json(
        { message: 'חסרים פרטי התחברות' },
        { status: 400 }
      );
    }

    const platformUrls = PLATFORM_URLS[platform as PlatformType];
    if (!platformUrls) {
      return NextResponse.json(
        { message: 'פלטפורמה לא נתמכת' },
        { status: 400 }
      );
    }

    // הפעלת דפדפן headless
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // סנכרון נתוני קמפיינים
      const campaignData = await syncCampaigns(page, platform as PlatformType, platformUrls.ads);
      
      // סנכרון נתוני תובנות
      const insightsData = await syncInsights(page, platform as PlatformType, platformUrls.insights);

      return NextResponse.json({
        success: true,
        platformData: {
          campaigns: campaignData,
          insights: insightsData,
          last_sync: new Date().toISOString()
        }
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Error syncing platform data:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'אירעה שגיאה בסנכרון הנתונים' },
      { status: 500 }
    );
  }
}

async function syncCampaigns(page: any, platform: PlatformType, url: string) {
  try {
    await page.goto(url);
    await page.waitForSelector('table', { timeout: 10000 });

    // שליפת נתוני קמפיינים לפי הפלטפורמה
    return await page.evaluate((platform: PlatformType) => {
      const campaigns = [];
      const rows = document.querySelectorAll('table tr');

      for (const row of rows) {
        switch (platform) {
          case 'facebook':
          case 'instagram':
            campaigns.push({
              name: row.querySelector('.campaign-name')?.textContent,
              status: row.querySelector('.status')?.textContent,
              budget: row.querySelector('.budget')?.textContent,
              results: row.querySelector('.results')?.textContent
            });
            break;

          case 'google':
            campaigns.push({
              name: row.querySelector('.campaign-name')?.textContent,
              status: row.querySelector('.status')?.textContent,
              budget: row.querySelector('.budget')?.textContent,
              clicks: row.querySelector('.clicks')?.textContent,
              impressions: row.querySelector('.impressions')?.textContent
            });
            break;

          // הוספת מקרים נוספים לפי הצורך
        }
      }

      return campaigns;
    }, platform);
  } catch (error) {
    console.error('Error syncing campaigns:', error);
    return [];
  }
}

async function syncInsights(page: any, platform: PlatformType, url: string) {
  try {
    await page.goto(url);
    await page.waitForSelector('.insights-data', { timeout: 10000 });

    // שליפת נתוני תובנות לפי הפלטפורמה
    return await page.evaluate((platform: PlatformType) => {
      switch (platform) {
        case 'facebook':
        case 'instagram':
          return {
            reach: document.querySelector('.reach-value')?.textContent,
            engagement: document.querySelector('.engagement-value')?.textContent,
            impressions: document.querySelector('.impressions-value')?.textContent,
            clicks: document.querySelector('.clicks-value')?.textContent
          };

        case 'google':
          return {
            impressions: document.querySelector('.impressions-value')?.textContent,
            clicks: document.querySelector('.clicks-value')?.textContent,
            ctr: document.querySelector('.ctr-value')?.textContent,
            cost: document.querySelector('.cost-value')?.textContent
          };

        // הוספת מקרים נוספים לפי הצורך
        default:
          return {};
      }
    }, platform);
  } catch (error) {
    console.error('Error syncing insights:', error);
    return {};
  }
} 