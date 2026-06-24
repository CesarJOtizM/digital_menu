import { NextResponse } from "next/server";

export function jsonSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

export function jsonCreated<T>(data: T): NextResponse {
  return NextResponse.json({ data }, { status: 201 });
}
