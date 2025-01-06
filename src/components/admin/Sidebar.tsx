'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  DocumentTextIcon,
  TicketIcon,
  BuildingOfficeIcon,
  MegaphoneIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface SidebarProps {
  lang: string;
}

export default function Sidebar({ lang }: SidebarProps) {
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = `/${lang}/admin/login`;
  };

  const menuItems = [
    {
      name: 'דשבורד',
      href: `/${lang}/admin`,
      icon: HomeIcon,
    },
    {
      name: 'קורות חיים',
      href: `/${lang}/admin/cv-management`,
      icon: DocumentTextIcon,
    },
    {
      name: 'קופונים',
      href: `/${lang}/admin/coupons`,
      icon: TicketIcon,
    },
    {
      name: 'חברות השמה',
      href: `/${lang}/admin/agencies`,
      icon: BuildingOfficeIcon,
    },
    {
      name: 'קמפיינים',
      href: `/${lang}/admin/campaigns`,
      icon: MegaphoneIcon,
    },
    {
      name: 'התראות',
      href: `/${lang}/admin/notifications`,
      icon: BellIcon,
    },
    {
      name: 'הגדרות',
      href: `/${lang}/admin/settings`,
      icon: Cog6ToothIcon,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-l">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <img
            className="h-8 w-auto"
            src="/logo.png"
            alt="CVIT"
          />
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`ml-3 flex-shrink-0 h-6 w-6 ${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
        >
          <ArrowLeftOnRectangleIcon
            className="ml-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500"
            aria-hidden="true"
          />
          התנתקות
        </button>
      </div>
    </div>
  );
} 