import { Suspense } from "react";
import { Provider } from "@/components/ui/provider";
import Footer from "@/app/feacher/partials/Footer";
import { Toaster } from "@/components/ui/toaster";
import NavbarWrapper from "@/app/feacher/partials/Navber/NavbarWrapper";
import FooterNavbarWrapper from "@/app/feacher/partials/FooterNavbar/FooterNavbarWrapper";
import NavVisibilityWrapper from "@/app/feacher/partials/NavVisibilityWrapper";
import SplashScreen from "@/app/feacher/splash/SplashScreen";
import styles from "./layout.module.css";

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <SplashScreen />
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
