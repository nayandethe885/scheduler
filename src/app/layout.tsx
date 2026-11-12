import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'TRAILHEAD // Personal Productivity & Schedule OS',
  description: 'Rugged, intelligent personal productivity manager with natural language task execution, smart schedule management, habits, and ambient focus.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Trailhead OS',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f5f0' },
    { media: '(prefers-color-scheme: dark)', color: '#121312' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = localStorage.getItem('lifeos_theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (stored === 'dark' || (!stored && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
                var storedFont = localStorage.getItem('lifeos_font') || 'editorial';
                document.documentElement.setAttribute('data-font', storedFont);
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen aesthetic-bg text-[#141514] dark:text-[#f4f3ef] antialiased selection:bg-[#d95326] selection:text-white transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
