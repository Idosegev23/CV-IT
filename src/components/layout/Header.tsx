'use client';

import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface NavLinksProps {
  lang: 'he' | 'en';
  pathname: string | null;
  isRTL: boolean;
  isMobile?: boolean;
  onNavClick?: () => void;
}

interface HeaderProps {
  isRTL: boolean;
}

const navContent = {
  he: {
    about: 'מי אנחנו?',
    templates: 'איך זה נראה',
    testimonials: 'מה אומרים עלינו',
    contact: 'צור קשר',
    packages: 'מסלולים',
    guides: 'מדריכים',
    terms: 'תקנון',
    langToggle: 'EN'
  },
  en: {
    about: 'About Us',
    templates: 'See Examples',
    testimonials: 'Testimonials',
    contact: 'Contact',
    packages: 'Packages',
    guides: 'Guides',
    terms: 'Terms',
    langToggle: 'עב'
  }
};

export function Header({ isRTL }: HeaderProps) {
  const params = useParams();
  const pathname = usePathname();
  const lang = (params?.lang ?? 'he') as 'he' | 'en';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleMainLanguageChange = () => {
    const currentUrl = new URL(window.location.href);
    const targetLang = lang === 'he' ? 'en' : 'he';
    const newPath = currentUrl.pathname.replace(/^\/(he|en)/, `/${targetLang}`);
    const newUrl = `${newPath}${currentUrl.search}`;
    router.push(newUrl);
    router.refresh();
  };

  return (
    <nav 
      className={cn(
        "relative z-50 w-full font-rubik bg-[#F4F4F1]",
        isRTL ? "rtl" : "ltr"
      )}
      role="navigation"
      aria-label={isRTL ? 'תפריט ראשי' : 'Main navigation'}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3 sm:py-4 md:px-11 md:py-4 md:gap-4 bg-[#EAEAE7]">
        {/* לוגו - תמיד בצד ימין */}
        <div className="order-first">
          <Link 
            href={`/${lang}`}
            aria-label={isRTL ? 'דף הבית' : 'Home page'}
          >
            <div className="h-[40px] sm:h-[45px] md:h-[50px] w-[90px] sm:w-[100px] md:w-[140px] bg-[#4856CD] rounded-full 
                         flex items-center justify-center transition-colors hover:bg-[#4856CD]/90
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4856CD]">
              <svg className="w-[70px] md:w-[100px]" viewBox="0 0 145 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M125.553 7.026C125.553 8.88 124.845 10.4849 123.506 11.6641C122.268 12.7562 120.589 13.3105 118.517 13.3105H113.667V36.6651C113.667 39.0277 113.034 40.9128 111.786 42.2686C110.486 43.6783 108.746 44.4236 106.757 44.4236C104.769 44.4236 102.998 43.6741 101.692 42.2561C100.436 40.8942 99.7982 39.0132 99.7982 36.6651V13.3105H94.9463C92.8577 13.3105 91.176 12.7479 89.949 11.635C89.8618 11.5562 89.7767 11.4752 89.6957 11.3921V36.6651C89.6957 39.0111 89.0583 40.8921 87.8023 42.2561C86.4943 43.6741 84.7337 44.4236 82.7116 44.4236C80.6894 44.4236 78.9932 43.6658 77.6852 42.2312C77.0603 41.5481 76.589 40.7364 76.2755 39.8063C75.9599 38.8782 75.8022 37.8277 75.8022 36.6651V9.88278C75.7648 9.99074 75.7274 10.0966 75.688 10.2025C75.5447 10.5907 75.4015 10.9935 75.2603 11.4067L75.2354 11.471L66.3848 35.3592C66.063 36.2872 65.7349 37.1882 65.409 38.0374C65.0083 39.0796 64.5287 40.0243 63.9827 40.8443C63.2913 41.8845 62.3695 42.7399 61.2484 43.3876C60.0608 44.0748 58.6615 44.4236 57.0919 44.4236C55.5224 44.4236 54.1417 44.0852 52.9625 43.4167C51.8268 42.7731 50.8905 41.9052 50.1846 40.8381C49.6323 40.0076 49.1528 39.063 48.7541 38.0353C48.4261 37.1903 48.096 36.2872 47.7742 35.355L39.0502 11.606C38.9111 11.2053 38.7658 10.8087 38.6205 10.4226C38.4087 9.86825 38.2302 9.26616 38.0869 8.63294C37.927 7.91252 37.8481 7.27929 37.8481 6.70005C37.8481 5.00384 38.5208 3.41974 39.7935 2.11592C41.0849 0.791336 42.7769 0.0916748 44.6828 0.0916748C47.8282 0.0916748 49.3957 1.70899 50.0476 2.6744C50.3984 3.19344 50.7389 3.82043 51.0711 4.56784C51.4033 5.31526 51.7292 6.18308 52.0531 7.18171L57.2601 22.6033L62.5127 6.99071C62.9716 5.608 63.3224 4.64051 63.5757 4.04466C63.9972 3.05434 64.6719 2.17405 65.5813 1.43287C66.6713 0.542203 68.0477 0.0916748 69.6775 0.0916748C70.8879 0.0916748 72.0298 0.398945 73.072 1.00726C74.0956 1.60726 74.9136 2.41904 75.5032 3.42389C75.8001 3.93047 76.0264 4.45158 76.1779 4.98307C76.4873 3.93047 76.9856 3.02319 77.6707 2.27163C78.9703 0.845316 80.7122 0.0916748 82.7116 0.0916748C84.7109 0.0916748 86.4819 0.830782 87.7877 2.23218C88.2051 2.67855 88.5559 3.18513 88.8362 3.74361C89.158 3.21627 89.5649 2.73876 90.0549 2.31938C91.2944 1.25432 92.9407 0.714518 94.9463 0.714518H118.517C120.622 0.714518 122.316 1.28338 123.551 2.40243C124.861 3.58998 125.553 5.18861 125.553 7.026Z" fill="#F3F4F1"/>
                <path d="M138.466 11.8925H138.433C138.39 11.8925 138.356 11.8966 138.336 11.8987C138.329 11.9444 138.325 12.0087 138.325 12.0938C138.325 12.1707 138.334 12.2163 138.338 12.2309C138.34 12.2371 138.344 12.2433 138.348 12.2475C138.429 12.1624 138.464 12.1084 138.477 12.0855C138.477 12.0004 138.471 11.9361 138.466 11.8925Z" fill="#F3F4F1"/>
                <path d="M138.284 30.9411C138.167 30.6587 138.076 30.5861 138.076 30.5861C138.064 30.5778 138.055 30.5736 138.053 30.5715H138.016C137.925 30.5715 137.908 30.5715 137.812 30.6629C137.796 30.6774 137.785 30.6899 137.779 30.6982C137.777 30.7106 137.773 30.7355 137.773 30.7708C137.773 30.8892 137.783 30.966 137.792 31.0096C137.858 31.0594 137.933 31.0885 138.103 31.0885H138.34C138.321 31.0324 138.302 30.9826 138.284 30.9411Z" fill="#F3F4F1"/>
                <path d="M144.267 28.4539C143.705 27.1023 142.87 26.0352 141.786 25.2753C140.663 24.4905 139.392 24.0919 138.016 24.0919C136.241 24.0919 134.621 24.748 133.328 25.9854C131.999 27.2601 131.295 28.9148 131.295 30.7709C131.295 33.2539 132.363 34.8069 133.313 35.6976C132.095 36.6754 131.405 38.0748 131.405 39.6132C131.405 40.8236 131.831 41.9447 132.637 42.8561C133.529 43.8672 134.783 44.4236 136.166 44.4236C137.688 44.4236 139.216 43.7613 140.711 42.4554C141.938 41.3821 142.97 39.9557 143.775 38.218C144.587 36.4616 145 34.564 145 32.573C145 31.0096 144.753 29.6248 144.267 28.4539ZM138.103 31.0885C137.933 31.0885 137.858 31.0595 137.792 31.0096C137.783 30.966 137.773 30.8892 137.773 30.7709C137.773 30.7356 137.777 30.7107 137.779 30.6982C137.785 30.6899 137.796 30.6775 137.812 30.6629C137.908 30.5716 137.925 30.5716 138.016 30.5716H138.053C138.053 30.5716 138.064 30.5778 138.076 30.5861C138.076 30.5861 138.167 30.6588 138.284 30.9411C138.302 30.9826 138.321 31.0325 138.34 31.0885H138.103Z" fill="#F3F4F1"/>
                <path d="M142.968 7.20663C141.72 6.03361 140.152 5.41492 138.433 5.41492C136.714 5.41492 135.124 6.02115 133.876 7.16718C132.95 8.0184 131.846 9.56305 131.846 12.0939C131.846 13.3333 132.147 14.4773 132.738 15.4925H132.741C133.314 16.4766 134.096 17.2739 135.066 17.8635C136.085 18.4822 137.219 18.7957 138.433 18.7957C139.648 18.7957 141.398 18.4365 143.034 16.7195C144.292 15.4032 144.957 13.8046 144.957 12.0939C144.957 9.6025 143.875 8.05993 142.968 7.20663ZM138.348 12.2475C138.348 12.2475 138.34 12.2371 138.338 12.2309C138.334 12.2164 138.325 12.1707 138.325 12.0939C138.325 12.0088 138.33 11.9444 138.336 11.8987C138.356 11.8966 138.39 11.8925 138.433 11.8925H138.467C138.471 11.9361 138.477 12.0005 138.477 12.0856C138.464 12.1084 138.429 12.1624 138.348 12.2475Z" fill="#F3F4F1"/>
                <path d="M40.8792 28.7528C40.655 30.5923 40.0363 32.5044 39.0398 34.4352C38.0142 36.4221 36.5006 38.2346 34.5449 39.8249C32.5954 41.4069 30.158 42.6236 27.2992 43.4436C25.2168 44.0416 23.2195 44.3924 21.3593 44.49C21.0188 44.5066 20.6783 44.5149 20.342 44.5149C18.7496 44.5149 17.207 44.3177 15.7433 43.9274C13.9579 43.4499 12.2035 42.6464 10.5301 41.5398L10.5073 41.5253C9.04154 40.5391 7.67959 39.3412 6.45467 37.9626C5.24012 36.5944 4.17091 35.0498 3.28232 33.3702C2.40826 31.7217 1.67953 29.8968 1.12105 27.9431C0.207547 24.7562 -0.151628 21.696 0.0580622 18.8496C0.271905 15.9347 1.03385 13.2274 2.31898 10.8046C3.60827 8.37754 5.36677 6.28479 7.54672 4.58442C9.69345 2.91105 12.1641 1.66536 14.888 0.884731C18.2202 -0.0702961 21.4527 -0.252996 24.5005 0.340782C27.5566 0.938712 30.1539 2.08059 32.2238 3.73735C34.4141 5.49377 35.8342 7.46611 36.4487 9.60454C36.9055 11.2011 36.7456 12.8475 35.9837 14.361C35.1761 15.9659 33.8556 17.0683 32.1636 17.5541C30.4321 18.0503 28.875 17.9506 27.5379 17.2551C26.6223 16.7797 25.6694 16.0094 24.5358 14.8323C23.4811 13.7423 22.4389 13.0198 21.4403 12.6835C20.5642 12.3907 19.5531 12.4156 18.3468 12.7624C16.3869 13.325 15.1371 14.417 14.4167 16.2025C13.6008 18.2268 13.6755 20.959 14.6409 24.3265C15.3032 26.631 16.1482 28.4331 17.1572 29.6829C18.0333 30.7646 18.9572 31.4394 19.987 31.7425C21.0583 32.0601 22.2105 32.0331 23.506 31.6615C24.8991 31.2629 25.9165 30.638 26.6182 29.7515C27.3282 28.8525 27.731 27.6857 27.8452 26.1826C27.9012 24.8331 28.1359 23.6227 28.5428 22.5888C29.0016 21.422 30.075 19.8815 32.5726 19.1652C34.2314 18.6898 35.9131 18.8704 37.4349 19.6863H37.437C38.9879 20.5209 40.0695 21.8725 40.5637 23.5936C41.0038 25.1299 41.1097 26.8656 40.8792 28.7528Z" fill="#F3F4F1"/>
              </svg>
            </div>
          </Link>
        </div>
        
        {/* המבורגר למובייל */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 order-last"
          aria-expanded={isMenuOpen}
          aria-label={isRTL ? 'פתח תפריט' : 'Open menu'}
        >
          <Image
            src="/design/burgerMenu.svg"
            width={36}
            height={36}
            alt=""
            aria-hidden="true"
            className="sm:w-7 sm:h-7"
          />
        </button>

        {/* תפריט ראשי - דסקטופ */}
        <div className="hidden md:flex h-[50px] bg-white rounded-full flex-1 items-center px-4 sm:px-8 order-2">
          <div className={cn(
            "flex gap-8 text-base font-medium justify-center flex-1",
            isRTL ? "flex-row-reverse" : "flex-row"
          )}>
            <NavLinks 
              lang={lang} 
              pathname={pathname} 
              isRTL={isRTL} 
              onNavClick={closeMenu}
            />
          </div>
        </div>

        {/* צור קשר - דסקטופ */}
        <div className="hidden md:block order-3">
          <Link href={`/${lang}/contact`}>
            <div className="h-[50px] w-[140px] bg-[#B78BE6] rounded-full flex items-center justify-center transition-colors hover:bg-[#B78BE6]/90">
              <span className="text-[#F3F4F1] text-base font-medium">
                {isRTL ? 'צור קשר' : 'Contact'}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 top-[56px] sm:top-[64px] z-40 p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* רקע מטושטש */}
          <div className="absolute inset-0 bg-[#EAEAE7]/80 backdrop-blur-sm" />

          {/* תוכן התפריט */}
          <div className="relative max-w-[800px] mx-auto">
            <div className="bg-white rounded-[44px] border border-white p-6 relative">
              {/* כפתור סגירה */}
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-6 left-6"
                aria-label={isRTL ? 'סגור תפריט' : 'Close menu'}
              >
                <Image
                  src="/design/exitmobilemenu.svg"
                  width={36}
                  height={36}
                  alt=""
                  aria-hidden="true"
                  className="sm:w-7 sm:h-7"
                />
              </button>

              <div className="flex flex-col gap-6 items-center text-lg">
                <NavLinks 
                  lang={lang} 
                  pathname={pathname} 
                  isRTL={isRTL} 
                  isMobile 
                  onNavClick={closeMenu}
                />
                
                {/* צור קשר - מובייל */}
                <Link 
                  href={`/${lang}/contact`}
                  onClick={closeMenu}
                  className="h-[45px] w-[120px] bg-[#B78BE6] rounded-full flex items-center justify-center transition-colors hover:bg-[#B78BE6]/90"
                >
                  <span className="text-[#F3F4F1] text-base font-medium">
                    {isRTL ? 'צור קשר' : 'Contact'}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// קומפונטה נפרדת לקישורי הניוט
function NavLinks({ lang, pathname, isRTL, isMobile = false, onNavClick }: NavLinksProps) {
  const content = navContent[lang as keyof typeof navContent];
  const targetLang = lang === 'he' ? 'en' : 'he';
  const router = useRouter();
  
  const handleLanguageChange = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const currentUrl = new URL(window.location.href);
    const newPath = currentUrl.pathname.replace(/^\/(he|en)/, `/${targetLang}`);
    const newUrl = `${newPath}${currentUrl.search}`;
    router.push(newUrl);
    router.refresh();
    if (onNavClick) {
      onNavClick();
    }
  };

  return (
    <>
      <Link 
        href={`/${lang}/about`}
        onClick={onNavClick}
        className={cn(
          "text-[#4754D6] hover:text-[#4754D6]/80 transition-colors",
          pathname?.includes('/about') && "font-semibold",
          isMobile && "py-2"
        )}
      >
        {content.about}
      </Link>
      
      <Link 
        href={`/${lang}/gallery`}
        onClick={onNavClick}
        className={cn(
          "text-[#4754D6] hover:text-[#4754D6]/80 transition-colors",
          pathname?.includes('/gallery') && "font-semibold",
          isMobile && "py-2"
        )}
      >
        {content.templates}
      </Link>
      
      <Link 
        href={`/${lang}/testimonials`}
        onClick={onNavClick}
        className={cn(
          "text-[#4754D6] hover:text-[#4754D6]/80 transition-colors",
          pathname?.includes('/testimonials') && "font-semibold",
          isMobile && "py-2"
        )}
      >
        {content.testimonials}
      </Link>
      
      <Link 
        href={`/${lang}/packages`}
        onClick={onNavClick}
        className={cn(
          "text-[#4754D6] hover:text-[#4754D6]/80 transition-colors",
          pathname?.includes('/packages') && "font-semibold",
          isMobile && "py-2"
        )}
      >
        {content.packages}
      </Link>

      <Link 
        href={`/${lang}/guides`}
        onClick={onNavClick}
        className={cn(
          "text-[#4754D6] hover:text-[#4754D6]/80 transition-colors",
          pathname?.includes('/guides') && "font-semibold",
          isMobile && "py-2"
        )}
      >
        {content.guides}
      </Link>

      <Link 
        href={`/${lang}/terms`}
        onClick={onNavClick}
        className={cn(
          "text-[#4754D6] hover:text-[#4754D6]/80 transition-colors",
          pathname?.includes('/terms') && "font-semibold",
          isMobile && "py-2"
        )}
      >
        {content.terms}
      </Link>

      <Link 
        href={`/${targetLang}${pathname?.substring(3) ?? ''}`}
        onClick={handleLanguageChange}
        className={cn(
          "text-[#4754D6] hover:text-[#4754D6]/80 transition-colors",
          isMobile && "py-2"
        )}
      >
        {content.langToggle}
      </Link>
    </>
  );
}