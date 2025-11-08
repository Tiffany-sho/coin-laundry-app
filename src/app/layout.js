import { Provider } from "@/components/ui/provider";
import Footer from "@/app/feacher/partials/Footer";
import { Toaster } from "@/components/ui/toaster";
import NavbarWrapper from "@/app/feacher/partials/Navber/NavbarWrapper";
import FooterNavbarWrapper from "@/app/feacher/partials/FooterNavbar/FooterNavbarWrapper";
import styles from "./layout.module.css";

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <Provider>
          <div className={styles.layoutContainer}>
            <NavbarWrapper />
            <main className={styles.mainContent}>{children}</main>
            <Toaster />
            <FooterNavbarWrapper />
            <Footer />
          </div>
        </Provider>
      </body>
    </html>
  );
}
