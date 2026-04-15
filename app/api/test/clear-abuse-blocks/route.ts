import { NextRequest, NextResponse } from "next/server";
import { clearAllAbuseBlocks } from "@/lib/services/abuse-guard";
import { testRouteGuard } from "../guard";

export async function POST(request: NextRequest) {
  const guard = await testRouteGuard(request);
  if (!guard.success) return guard.response;

  const cleared = await clearAllAbuseBlocks();

  return NextResponse.json({ success: true, blocksCleared: cleared });
}
