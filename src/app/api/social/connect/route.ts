import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

type PlatformType = 'facebook' | 'instagram' | 'linkedin' | 'google' | 'tiktok';

const PLATFORM_URLS: Record<PlatformType, string> = {
  facebook: 'https://www.facebook.com/login',
  instagram: 'https://www.instagram.com/accounts/login',
  linkedin: 'https://www.linkedin.com/login',
  google: 'https://ads.google.com',
  tiktok: 'https://www.tiktok.com/login'
};

const PLATFORM_SELECTORS: Record<PlatformType, {
  username: string;
  password: string;
  submit: string;
  success: string;
  beforeLogin?: () => Promise<void>;
  afterLogin?: () => Promise<void>;
}> = {
  facebook: {
    username: '#email',
    password: '#pass',
    submit: '[name="login"]',
    success: '[aria-label="Your profile"]'
  },
  instagram: {
    username: 'input[name="username"]',
    password: 'input[name="password"]',
    submit: 'button[type="submit"]',
    success: 'svg[aria-label="הפרופיל שלך"]',
    beforeLogin: async () => {
      // המתנה לטעינת הדף
      await new Promise(resolve => setTimeout(resolve, 2000));
    },
    afterLogin: async () => {
      // סגירת חלונות פופ-אפ אם יש
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  },
  linkedin: {
    username: '#username',
    password: '#password',
    submit: '[type="submit"]',
    success: '.profile-rail-card__actor-link'
  },
  google: {
    username: '[type="email"]',
    password: '[type="password"]',
    submit: '#signIn',
    success: '.customer-info'
  },
  tiktok: {
    username: 'input[name="username"]',
    password: 'input[name="password"]',
    submit: 'button[type="submit"]',
    success: '.profile-icon',
    beforeLogin: async () => {
      // המתנה לטעינת הדף
      await new Promise(resolve => setTimeout(resolve, 2000));
    },
    afterLogin: async () => {
      // טיפול בחלונות פופ-אפ
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
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

    const platformUrl = PLATFORM_URLS[platform as PlatformType];
    const selectors = PLATFORM_SELECTORS[platform as PlatformType];

    if (!platformUrl || !selectors) {
      return NextResponse.json(
        { message: 'פלטפורמה לא נתמכת' },
        { status: 400 }
      );
    }

    // הפעלת דפדפן עם הגדרות מתקדמות
    const browser = await puppeteer.launch({
      headless: false, // לצורך דיבוג
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });

    try {
      const page = await browser.newPage();
      
      // הגדרות נוספות לדף
      await page.setViewport({ width: 1280, height: 800 });
      await page.setDefaultNavigationTimeout(20000);
      
      // ניווט לדף ההתחברות
      await page.goto(platformUrl, { waitUntil: 'networkidle0' });
      
      // הפעלת פונקציית beforeLogin אם קיימת
      if (selectors.beforeLogin) {
        await selectors.beforeLogin();
      }

      console.log('ממתין לטעינת שדה שם משתמש:', selectors.username);
      await page.waitForSelector(selectors.username, { visible: true, timeout: 10000 });
      
      // הזנת פרטי התחברות
      await page.type(selectors.username, username, { delay: 100 });
      await page.type(selectors.password, password, { delay: 100 });
      
      // לחיצה על כפתור התחברות
      const submitButton = await page.$(selectors.submit);
      if (!submitButton) {
        throw new Error('לא נמצא כפתור התחברות');
      }
      
      await submitButton.click();
      
      // הפעלת פונקציית afterLogin אם קיימת
      if (selectors.afterLogin) {
        await selectors.afterLogin();
      }

      // המתנה להתחברות מוצלחת
      try {
        await page.waitForSelector(selectors.success, { timeout: 15000 });
      } catch (error) {
        console.error('שגיאה בהמתנה לסלקטור:', selectors.success);
        throw new Error('פרטי ההתחברות שגויים או שיש בעיה בהתחברות');
      }

      // שליפת מידע נוסף על החשבון
      const accountInfo = await page.evaluate((platform: PlatformType) => {
        const getTextContent = (selector: string) => {
          const element = document.querySelector(selector);
          return element ? element.textContent?.trim() : null;
        };

        switch (platform) {
          case 'instagram':
            return {
              name: getTextContent('h2'),
              profileUrl: window.location.href,
              followers: getTextContent('.followers span'),
              following: getTextContent('.following span')
            };
          case 'tiktok':
            return {
              name: getTextContent('.profile-name'),
              profileUrl: window.location.href,
              followers: getTextContent('.followers-count'),
              following: getTextContent('.following-count')
            };
          default:
            return {
              name: null,
              profileUrl: window.location.href
            };
        }
      }, platform as PlatformType);

      return NextResponse.json({
        success: true,
        accountInfo
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Error connecting to platform:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'אירעה שגיאה בהתחברות' },
      { status: 500 }
    );
  }
} 