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

export const metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Collecie",
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
    <html suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var m=localStorage.getItem('colorMode');if(m==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();` }} />
      </head>
      <body>
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
              <Footer />
            </NavVisibilityWrapper>
          </div>
        </Provider>
      </body>
    </html>
  );
}
