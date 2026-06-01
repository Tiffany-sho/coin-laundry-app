import { Suspense } from "react";
import { Provider } from "@/components/ui/provider";
import Footer from "@/app/feacher/partials/Footer";
import { Toaster } from "@/components/ui/toaster";
import NavbarWrapper from "@/app/feacher/partials/Navber/NavbarWrapper";
import FooterNavbarWrapper from "@/app/feacher/partials/FooterNavbar/FooterNavbarWrapper";
import NavVisibilityWrapper from "@/app/feacher/partials/NavVisibilityWrapper";
import SplashScreen from "@/app/feacher/splash/SplashScreen";
import SWRegistration from "@/app/feacher/pwa/SWRegistration";
import styles from "./layout.module.css";

const siteUrl = "https://www.collecie.com";
const siteName = "Collecie";
const siteDescription =
  "コインランドリーの集金記録・売上管理・在庫管理・機器状態をスマホでかんたん一元管理。月次レポートの自動生成やCSV/Excelエクスポートにも対応。3店舗まで永久無料の集金管理アプリ。";

export const metadata = {
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.json",
  title: {
    default: `${siteName} | コインランドリー集金アプリ - 無料で始める`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "コインランドリー",
    "集金",
    "集金管理",
    "集金アプリ",
    "コインランドリー管理",
    "コインランドリーアプリ",
    "売上管理",
    "在庫管理",
    "機器管理",
    "コインランドリー集金システム",
    "ランドリー管理",
    "集金記録",
    "売上グラフ",
    "Collecie",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName,
    title: `${siteName} | コインランドリー集金アプリ - 無料で始める`,
    description: siteDescription,
    images: [
      {
        url: "/screenshots/revenue-report-pc.png",
        width: 1200,
        height: 630,
        alt: "Collecie - コインランドリー集金アプリ - 無料で始める",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | コインランドリー集金アプリ - 無料で始める`,
    description: siteDescription,
    images: ["/screenshots/revenue-report-pc.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#0891B2",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SplashScreen />
        <SWRegistration />
        <Provider>
          <div className={styles.layoutContainer}>
            <NavVisibilityWrapper>
              <Suspense fallback={null}>
                <NavbarWrapper />
              </Suspense>
            </NavVisibilityWrapper>
            <main className={styles.mainContent}>{children}</main>
            <Toaster />
            <NavVisibilityWrapper>
              <Suspense fallback={null}>
                <FooterNavbarWrapper />
              </Suspense>
              <div className={styles.footerWrapper}>
                <Footer />
              </div>
            </NavVisibilityWrapper>
          </div>
        </Provider>
      </body>
    </html>
  );
}
