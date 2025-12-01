import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCcw } from "lucide-react";

export default function PaymentFailedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
        <XCircle className="w-12 h-12 text-red-600" />
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        We couldn&apos;t process your payment. Please try again or contact support if the problem persists.
      </p>

      <div className="flex gap-4">
        <Link href="/pricing">
          <Button variant="outline" className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
