import { NextRequest } from "next/server"
import { z } from "zod"
import { query } from "@/lib/db"
import { hashPassword, isAdminEmail, setAuthCookie } from "@/lib/auth"
import { error, ok, parseBody } from "@/lib/api"

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(72),
})

export async function POST(req: NextRequest) {
  const parsed = parseBody(schema, await req.json())
  if (!parsed.ok) return parsed.response
  const { name, email, password } = parsed.data

  const existing = await query("select id from users where lower(email) = lower($1)", [email])
  if (existing.rowCount) return error("An account with this email already exists", 409)

  const baseHandle = name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 18) || "user"
  let handle = baseHandle
  let suffix = 1
  while ((await query("select 1 from users where handle = $1", [handle])).rowCount) {
    handle = `${baseHandle}${suffix++}`
  }

  const passwordHash = await hashPassword(password)
  const result = await query<{ id: string; name: string; email: string; image: string | null }>(
    `insert into users (name,email,password_hash,handle) values ($1,$2,$3,$4) returning id,name,email,image`,
    [name, email.toLowerCase(), passwordHash, handle]
  )
  const user = { ...result.rows[0], isAdmin: isAdminEmail(result.rows[0].email) }
  await setAuthCookie(user)
  return ok({ user }, 201)
}
