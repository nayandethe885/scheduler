import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LifeOS – Your Personal AI Assistant',
  description: 'A modern, intelligent personal productivity manager with natural language task execution, smart schedule management, habits, and ambient focus.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
