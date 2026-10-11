import { NextRequest } from "next/server"
import { z } from "zod"
import { query } from "@/lib/db"
import { comparePassword, isAdminEmail, setAuthCookie } from "@/lib/auth"
import { error, ok, parseBody } from "@/lib/api"

const schema = z.object({ email: z.string().trim().email(), password: z.string().min(1).max(72) })

export async function POST(req: NextRequest) {
  const parsed = parseBody(schema, await req.json())
  if (!parsed.ok) return parsed.response
  const result = await query<{ id: string; name: string; email: string; image: string | null; password_hash: string }>(
    `select id,name,email,image,password_hash from users where lower(email)=lower($1)`,
    [parsed.data.email]
  )
  const user = result.rows[0]
  if (!user || !(await comparePassword(parsed.data.password, user.password_hash))) {
    return error("Invalid email or password", 401)
  }
  const safeUser = { id: user.id, name: user.name, email: user.email, image: user.image, isAdmin: isAdminEmail(user.email) }
  await setAuthCookie(safeUser)
  return ok({ user: safeUser })
}
