import { NextResponse } from "next/server"
import { z } from "zod"

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function error(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status })
}

export function handleError(err: unknown, label: string) {
  console.error(label, err)
  if (err instanceof Error && err.message === "UNAUTHENTICATED") return error("Unauthorised", 401)
  return error("Something went wrong. Please try again.", 500)
}

export function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown) {
  const result = schema.safeParse(body)
  if (!result.success) {
    return { ok: false as const, response: error(result.error.issues[0]?.message ?? "Invalid request", 400) }
  }
  return { ok: true as const, data: result.data as z.infer<T> }
}

export function pageParams(searchParams: URLSearchParams) {
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1)
  const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "12", 10) || 12))
  return { page, limit, offset: (page - 1) * limit }
}
