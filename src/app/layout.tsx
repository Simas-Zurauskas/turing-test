import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import Registry from './_registry';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Interview Simulator Bot',
  description: 'Interview Simulator Bot',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable}`}>
        <AppRouterCacheProvider>
          <Registry>{children}</Registry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
