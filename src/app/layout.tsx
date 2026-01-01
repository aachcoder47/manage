import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/providers";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { AdSenseProvider } from "@/contexts/AdSenseContext";
import { AdSenseScriptLoader } from "@/components/ads/AdSenseScriptLoader";
import { NoSSRWrapper } from "@/components/NoSSRWrapper";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/browser-client-icon.ico" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ClerkProvider
          signInForceRedirectUrl="/dashboard"
          signUpForceRedirectUrl="/dashboard"
        >
          <AdSenseScriptLoader>
            <AdSenseProvider enabled={process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true'}>
              <Providers>
                <div className="antialiased min-h-screen">
                  <NoSSRWrapper>
                    {children}
                  </NoSSRWrapper>
                </div>
                <NoSSRWrapper>
                  <Toaster
                    toastOptions={{
                      classNames: {
                        toast: "bg-white",
                        title: "text-black",
                        description: "text-muted-foreground",
                        actionButton: "bg-indigo-600 text-white",
                        cancelButton: "bg-secondary text-secondary-foreground",
                      },
                    }}
                  />
                </NoSSRWrapper>
              </Providers>
            </AdSenseProvider>
          </AdSenseScriptLoader>
        </ClerkProvider>
      </body>
    </html>
  );
}
