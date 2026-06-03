import { NextResponse } from "next/server";
import { openApiDocument } from "@/lib/openapi/document";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(openApiDocument, {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
