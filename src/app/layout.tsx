import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cookies } from "next/headers";

import "./globals.css";

import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { parseTheme, THEME_COOKIE } from "@/lib/theme";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Billing ERP",
    template: "%s | Billing ERP",
  },
  description: "Enterprise Billing ERP",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialTheme = parseTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={initialTheme === "dark" ? "dark" : undefined}
    >
      <body
        className={cn(
          geist.variable,
          "min-h-screen bg-background font-sans text-foreground antialiased"
        )}
      >
        <ThemeProvider initialTheme={initialTheme}>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
