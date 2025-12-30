import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

function isAdminUserId(userId: string | null | undefined) {
  if (!userId) return false;
  const raw = process.env.ADMIN_USER_IDS || "";
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.includes(userId);
}

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  return NextResponse.json({ isAdmin: isAdminUserId(userId) });
}
