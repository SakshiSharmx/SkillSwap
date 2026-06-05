"use client"

import Link from "next/link"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1A6.2 6.2 0 0 1 12 5.8c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.1 14.7 2.2 12 2.2 6.9 2.2 2.8 6.3 2.8 12s4.1 9.8 9.2 9.8c5.3 0 8.8-3.7 8.8-9 0-.6-.06-1-.16-1.6H12z" />
    </svg>
  )
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSignup = mode === "signup"

  async function handleGoogleSignIn() {
    try {
      setLoading(true)
      setError(null)
      // callbackUrl tells NextAuth where to redirect after successful login
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {isSignup
          ? "Join SkillSwap and start trading skills with people nearby."
          : "Log in to manage your offers, requests, and swaps."}
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        variant="outline"
        className="mt-6 w-full gap-2"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
        {loading ? "Redirecting to Google..." : "Continue with Google"}
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignup ? "Already have an account? " : "New to SkillSwap? "}
        <Link href={isSignup ? "/login" : "/signup"} className="font-medium text-primary hover:underline">
          {isSignup ? "Log in" : "Create one"}
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        SkillSwap uses Google for secure sign-in. No password needed.
      </p>
    </div>
  )
}
