import "./globals.css";

export const metadata = {
  title: "CVIT - קורות חיים מקצועיים",
  description: "צור קורות חיים מקצועיים בעזרת AI תוך 10 דקות",
  icons: {
    icon: '/Wlogo.svg',
    shortcut: '/Wlogo.svg',
    apple: '/Wlogo.svg',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body>
        {children}
      </body>
    </html>
  )
}