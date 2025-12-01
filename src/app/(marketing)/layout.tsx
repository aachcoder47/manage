import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

import Providers from "@/components/providers";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Futuristic HR - AI-Powered Hiring Platform",
  description: "Revolutionize your recruitment process with Futuristic HR. AI-driven interviews, smart analytics, and unbiased evaluation.",
  openGraph: {
    title: "Futuristic HR",
    description: "AI-powered Interviews and Hiring Platform",
    siteName: "Futuristic HR",
    images: [
      {
        url: "/foloup.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
