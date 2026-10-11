import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { query } from "@/lib/db"

const COOKIE_NAME = "skillswap_token"
const secret = process.env.JWT_SECRET
if (!secret) throw new Error("JWT_SECRET is missing. Add it to .env.local")
const JWT_SECRET = new TextEncoder().encode(secret)

export type AuthUser = {
  id: string
  name: string
  email: string
  image: string | null
  isAdmin: boolean
}

export function isAdminEmail(email: string) {
  const configured = (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)

  return configured.includes(email.trim().toLowerCase())
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createToken(user: AuthUser) {
  return new SignJWT({
    name: user.name,
    email: user.email,
    image: user.image ?? null,
    isAdmin: user.isAdmin,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
}

export async function setAuthCookie(user: AuthUser) {
  const token = await createToken(user)
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearAuthCookie() {
  const store = await cookies()
  store.set(COOKIE_NAME, "", { httpOnly: true, expires: new Date(0), path: "/" })
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    if (!payload.sub) return null

    const result = await query<{ id: string; name: string; email: string; image: string | null }>(
      `SELECT id, name, email, image FROM users WHERE id = $1`,
      [payload.sub],
    )

    const user = result.rows[0]
    if (!user) return null

    return { ...user, isAdmin: isAdminEmail(user.email) }
  } catch {
    return null
  }
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) throw new Error("UNAUTHENTICATED")
  return user
}

export async function requireAdmin() {
  const user = await requireUser()
  if (!user.isAdmin) throw new Error("FORBIDDEN")
  return user
}
