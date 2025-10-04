import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UKNF Communication Platform",
  description:
    "Secure communication platform for Polish financial supervisory authority (UKNF) - enabling structured communication between client organizations and UKNF institution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
