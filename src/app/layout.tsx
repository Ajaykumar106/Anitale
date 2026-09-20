import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: '%s | Anitale',
    default: 'Anitale - Entertainment Discovery',
  },
  description: 'Discover your next favorite movie, series, or anime. Track watch progress, build lists, and find tailored recommendations.',
  keywords: ['movies', 'tv shows', 'anime', 'tracker', 'recommendations', 'entertainment'],
  authors: [{ name: 'Anitale Team' }],
  openGraph: {
    title: 'Anitale - Entertainment Discovery',
    description: 'Discover your next favorite movie, series, or anime.',
    url: 'https://anitale.example.com',
    siteName: 'Anitale',
    locale: 'en_US',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    title: 'Anitale',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: 'Anitale',
    card: 'summary_large_image',
  },
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-background font-sans antialiased`}
      >
        <div className="relative flex min-h-screen flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <BottomNav />
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
