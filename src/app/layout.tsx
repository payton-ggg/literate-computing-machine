import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { LocaleProvider } from "@/lib/i18n";
import { AuthLoader } from "@/lib/providers/AuthLoader";
import HeaderSwitch from "@/components/layout/HeaderSwitch";
import MainContentWrapper from "@/components/layout/MainContentWrapper";
import GlobalUploadManager from "@/modules/research/components/global/GlobalUploadManager";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zernote - AI workspace for customer interviews",
  description:
    "Zernote turns customer interviews, notes, and hypotheses into transcripts and insights. AI workspace for UX research and customer development.",
  metadataBase: new URL("https://zernote.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Zernote",
    url: "https://zernote.com/",
    title: "Zernote - AI workspace for customer interviews",
    description:
      "Zernote turns customer interviews, notes, and hypotheses into transcripts and insights. AI workspace for UX research and customer development.",
    images: [
      {
        url: "/og-image.png",
        secureUrl: "/og-image.png",
        type: "image/png",
        width: 1200,
        height: 630,
        alt: "Zernote - AI workspace for customer interviews",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zernote - AI workspace for customer interviews",
    description:
      "Zernote turns customer interviews, notes, and hypotheses into transcripts and insights. AI workspace for UX research and customer development.",
    images: [
      {
        url: "/og-image.png",
        alt: "Zernote - AI workspace for customer interviews",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="icon" href="/Dark_eyes_logo.svg" />
        <link rel="icon" href="/Dark_eyes_logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/Dark_eyes_logo.svg" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Onest:wght@400;500;600;700&family=Playfair+Display:wght@500&family=Source+Serif+4:opsz,wght@8..60,600&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="min-h-full bg-[#121c2d] flex flex-col">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <LocaleProvider initialLocale={locale as "en" | "ru"}>
            <AuthLoader>
              <HeaderSwitch />
              <MainContentWrapper>{children}</MainContentWrapper>
              <GlobalUploadManager />
            </AuthLoader>
          </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
