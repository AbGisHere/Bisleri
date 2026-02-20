import { NextRequest, NextResponse } from "next/server";

const AI_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const stream = req.headers.get("accept") === "text/event-stream";

  const res = await fetch(`${AI_URL}/api/pricing/${stream ? "stream" : ""}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (stream) {
    return new Response(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
