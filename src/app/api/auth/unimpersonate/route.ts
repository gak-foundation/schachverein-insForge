import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/super-admin", request.url));
  response.cookies.delete("impersonation_payload");
  response.cookies.delete("impersonation_sig");
  return response;
}
