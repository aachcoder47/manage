import { NextRequest, NextResponse } from "next/server";
import { SubscriptionService } from "@/services/subscription.service";

export async function POST(req: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('🔄 Running email reminders cron job...');

    // Send trial expiration reminders
    await SubscriptionService.checkAndSendTrialReminders();

    // Send monthly usage reports (run on 1st of each month)
    const today = new Date();
    if (today.getDate() === 1) {
      console.log('📊 Sending monthly usage reports...');
      await SubscriptionService.sendMonthlyUsageReports();
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email reminders processed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Email reminders cron job error:', error);
    return NextResponse.json(
      { error: error.message || "Cron job failed" },
      { status: 500 }
    );
  }
}

// Support for GET requests for testing
export async function GET(req: NextRequest) {
  return POST(req);
}
