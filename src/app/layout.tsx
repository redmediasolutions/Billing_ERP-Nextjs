import type { Metadata } from "next";
import { QueryProvider } from "@/components/providers/query-provider";
// @ts-ignore
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Billing ERP",
    template: "%s | Billing ERP",
  },
  description: "Enterprise Billing ERP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
<body>
  <QueryProvider>{children}</QueryProvider>
</body>
  );
}
