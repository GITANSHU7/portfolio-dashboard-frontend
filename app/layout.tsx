import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { Providers } from "@/app/providers";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Portfolio Dashboard",
  description: "Enterprise-grade portfolio UI built with Next.js and shadcn-inspired components.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var savedTheme = localStorage.getItem("portfolio-theme");
                var theme = savedTheme === "light" || savedTheme === "dark"
                  ? savedTheme
                  : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
                document.documentElement.dataset.theme = theme;
              })();
            `,
          }}
        />
      </head>
      <body className={ibmPlexSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
