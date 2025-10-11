import { Provider } from "@/components/ui/provider";
import { Box } from "@chakra-ui/react";
import Navber from "@/partials/Navbar";
import Footer from "@/partials/Footer";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <Provider>
          <Box display="flex" flexDirection="column" minHeight="100vh">
            <Navber />
            {children && children}
            <Toaster />
            <Footer />
          </Box>
        </Provider>
      </body>
    </html>
  );
}
