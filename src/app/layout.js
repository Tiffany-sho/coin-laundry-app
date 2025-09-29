export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children && children}</body>
    </html>
  );
}
