import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "San Pablo City Mayor's Dashboard",
  description: "Department statistics and analytics for the City of San Pablo.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
