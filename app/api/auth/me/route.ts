import { getCurrentUser } from "@/lib/auth"
import { error, ok } from "@/lib/api"

export async function GET() {
  const user = await getCurrentUser()
  return user ? ok({ user }) : error("Unauthorised", 401)
}
