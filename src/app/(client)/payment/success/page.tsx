import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
        <CheckCircle2 className="w-12 h-12 text-green-600" />
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Thank you for your subscription. Your account has been upgraded and you now have access to premium features.
      </p>

      <div className="flex gap-4">
        <Link href="/dashboard">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
