import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "Quality Leads — AI Sales Intelligence for Insurance & Staffing",
  description: "Verified prospects for P&C insurance and staffing sales teams. Intent triggers, personalized outreach, and CRM tracking powered by AI."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
