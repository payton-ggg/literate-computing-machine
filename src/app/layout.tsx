import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { LocaleProvider } from "@/lib/i18n";
import { AuthLoader } from "@/lib/providers/AuthLoader";
import HeaderSwitch from "@/components/layout/HeaderSwitch";
import GlobalUploadManager from "@/modules/research/components/global/GlobalUploadManager";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zernote – Know what to build",
  description:
    "Zernote turns customer interviews into clear decisions on what to build next.",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@500&family=Source+Serif+4:opsz,wght@8..60,600&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="min-h-full bg-[#121c2d] flex flex-col">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <LocaleProvider initialLocale={locale as "en" | "ru"}>
            <AuthLoader>
              <HeaderSwitch />
              <div
                className="flex-1 overflow-hidden"
                style={{
                  backgroundColor: "var(--bg)",
                  borderTopLeftRadius: "28px",
                  borderTopRightRadius: "28px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {children}
              </div>
              <GlobalUploadManager />
            </AuthLoader>
          </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
