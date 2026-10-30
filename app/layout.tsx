import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mayors-dashboard.vercel.app"),
  title: "San Pablo City Mayor's Dashboard",
  description:
    "A clear executive view of key BPLO, CTMO, and Finance-Cashier statistics for the City of San Pablo.",
  openGraph: {
    title: "San Pablo City Mayor's Dashboard",
    description:
      "A clear executive view of key BPLO, CTMO, and Finance-Cashier statistics for the City of San Pablo.",
    url: "https://mayors-dashboard.vercel.app/",
    siteName: "San Pablo City Mayor's Dashboard",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Preview of the San Pablo City Mayor's Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "San Pablo City Mayor's Dashboard",
    description:
      "A clear executive view of key BPLO, CTMO, and Finance-Cashier statistics for the City of San Pablo.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
