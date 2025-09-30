import { Provider } from "@/components/ui/provider";
import Navber from "@/partials/Navbar";

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <Navber />
        <Provider>{children && children}</Provider>
      </body>
    </html>
  );
}
