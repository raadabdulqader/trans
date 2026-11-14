import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://trans.mdd-iq.com'),
  title: 'نظام مكتب النجم للتخليص الكمركي والمالية',
  description: 'نظام متكامل لإدارة التخليص الكمركي، البوالص والمعاملات، الحاويات، حسابات المخلصين والسلف، الوصولات والأرشيف، والتقارير المالية',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className={`${cairo.className} bg-slate-950 text-slate-100 antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
