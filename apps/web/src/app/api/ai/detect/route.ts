import { NextRequest, NextResponse } from "next/server";

const AI_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const body = new FormData();
  body.append("file", file);

  const res = await fetch(`${AI_URL}/api/detect/`, {
    method: "POST",
    body,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
