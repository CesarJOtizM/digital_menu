import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { buildSiteMetadata, buildThemeStyle } from "@/config/domain";
import { getConfig } from "@/config/infrastructure";
import { getTranslations } from "@/i18n/server";
import { I18nProvider } from "@/i18n";
import "./globals.css";

const heading = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-cormorant-garamond",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildSiteMetadata(config);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [config, { locale, messages }] = await Promise.all([
    getConfig(),
    getTranslations(),
  ]);
  const themeStyle = buildThemeStyle({
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
  });

  return (
    <html lang={locale}>
      <body
        className={`${heading.variable} ${body.variable}`}
        style={themeStyle}
      >
        <I18nProvider locale={locale} messages={messages}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
