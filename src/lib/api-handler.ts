import { handleError } from "@/lib/errors";
import { NextResponse } from "next/server";

type HandlerFn = (req: Request, ctx?: unknown) => Promise<NextResponse>;

export function apiHandler(handler: HandlerFn): (req: Request, ctx?: unknown) => Promise<NextResponse> {
  return async (req: Request, ctx?: unknown) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      const { message, code, statusCode } = handleError(error);
      return NextResponse.json({ error: { message, code } }, { status: statusCode });
    }
  };
}