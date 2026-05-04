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

const DEFAULT_MAX_BODY_SIZE = 1024 * 1024; // 1 MB

export async function parseRequestBody(req: Request, maxBytes: number = DEFAULT_MAX_BODY_SIZE): Promise<string> {
  const contentLength = req.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    throw Object.assign(new Error("Request body too large"), { status: 413 });
  }
  const reader = req.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value?.length ?? 0;
    if (totalBytes > maxBytes) {
      reader.cancel();
      throw Object.assign(new Error("Request body too large"), { status: 413 });
    }
    if (value) chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}