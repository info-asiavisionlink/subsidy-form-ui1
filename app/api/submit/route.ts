// app/api/submit/route.ts
import { NextResponse } from "next/server";

type Payload = Record<string, unknown>;

export async function POST(req: Request) {
  const webhookUrl =
    process.env.N8N_WEBHOOK_URL ??
    "https://nextasia.app.n8n.cloud/webhook/54ca3ed5-707b-4208-87d1-23a6f743727a";

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "JSONが壊れてる" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      // n8nは遅いことある。必要ならここは延ばす
      cache: "no-store",
    });

    const text = await res.text(); // n8nの返答をそのままログ用途で返す

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "n8nがエラー", status: res.status, detail: text },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, n8n: text }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json(
      { ok: false, error: "n8nへ到達できない", detail: msg },
      { status: 504 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "POSTだけ使え" },
    { status: 405 }
  );
}