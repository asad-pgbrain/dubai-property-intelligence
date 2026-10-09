import { NextResponse } from "next/server";

export function safeError(
  error: unknown,
  context: string,
  status: number = 500
): NextResponse {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [${context}] Error:`, {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  return NextResponse.json(
    {
      detail: "An unexpected error occurred. Please try again.",
      code: "INTERNAL_ERROR",
      context,
    },
    { status }
  );
}

export function badRequest(detail: string): NextResponse {
  return NextResponse.json(
    { detail, code: "BAD_REQUEST" },
    { status: 400 }
  );
}

export function notFoundError(detail: string = "Resource not found"): NextResponse {
  return NextResponse.json(
    { detail, code: "NOT_FOUND" },
    { status: 404 }
  );
}

export function rateLimited(retryAfterSeconds: number = 60): NextResponse {
  return NextResponse.json(
    {
      detail: `Too many requests. Please try again in ${retryAfterSeconds} seconds.`,
      code: "RATE_LIMITED",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}
