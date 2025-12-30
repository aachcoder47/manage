"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RazorpayPaymentButtonProps {
  trialId: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayPaymentButton({
  trialId,
  amount,
  onSuccess,
  onError,
  disabled = false,
  children,
  className,
}: RazorpayPaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (loading) return;

    setLoading(true);
    try {
      // Free trial: skip Razorpay and activate directly
      if (amount === 0) {
        const response = await fetch("/api/payments/work-trial/activate-free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trialId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to activate free trial");
        toast.success("Free trial activated!");
        onSuccess?.();
        return;
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Create order
      const response = await fetch("/api/payments/work-trial/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trialId,
          amount,
        }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      // Initialize Razorpay
      const razorpay = new window.Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "Work Trial Payment",
        description: `Payment for work trial ${trialId}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/payments/work-trial/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                trialId,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              toast.success("Payment successful! Work trial activated.");
              onSuccess?.();
            } else {
              throw new Error(verifyData.error || "Payment verification failed");
            }
          } catch (error: any) {
            console.error("Payment verification error:", error);
            toast.error(error.message || "Payment verification failed");
            onError?.(error.message || "Payment verification failed");
          }
        },
        prefill: {
          name: "",
          email: "",
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info("Payment cancelled");
          },
        },
      });

      razorpay.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed");
      onError?.(error.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading}
      className={className || "bg-indigo-600 hover:bg-indigo-700"}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : amount === 0 ? (
        "Start Free Trial"
      ) : (
        children || `Pay ₹${amount}`
      )}
    </Button>
  );
}
