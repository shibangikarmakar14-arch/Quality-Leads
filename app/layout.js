import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "Quality Leads — AI Sales Intelligence",
  description: "Find smarter leads. Close more deals with AI."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster position="top-right" theme="dark" richColors />
      </body>
    </html>
  );
}
