"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AuthForm({ mode }: { mode:"login"|"signup" }) {
  const router=useRouter(); const isSignup=mode==="signup"
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [loading,setLoading]=useState(false); const [error,setError]=useState<string|null>(null)
  async function submit(e:React.FormEvent){e.preventDefault();setLoading(true);setError(null);const res=await fetch(`/api/auth/${isSignup?"register":"login"}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(isSignup?{name,email,password}:{email,password})});const data=await res.json();if(!res.ok){setError(data.error??"Unable to continue");setLoading(false);return}router.push("/dashboard");router.refresh()}
  return <div><h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">{isSignup?"Create your account":"Welcome back"}</h1><p className="mt-1.5 text-sm text-muted-foreground">{isSignup?"Join SkillSwap and start trading skills with people nearby.":"Log in to manage your offers, requests, and swaps."}</p>{error&&<p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}<form onSubmit={submit} className="mt-6 space-y-4">{isSignup&&<div><Label htmlFor="name">Name</Label><Input id="name" value={name} onChange={e=>setName(e.target.value)} required className="mt-1.5"/></div>}<div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="mt-1.5"/></div><div><Label htmlFor="password">Password</Label><Input id="password" type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required className="mt-1.5"/></div><Button className="w-full" disabled={loading}>{loading&&<Loader2 className="size-4 animate-spin"/>}{isSignup?"Create account":"Log in"}</Button></form><p className="mt-6 text-center text-sm text-muted-foreground">{isSignup?"Already have an account? ":"New to SkillSwap? "}<Link href={isSignup?"/login":"/signup"} className="font-medium text-primary hover:underline">{isSignup?"Log in":"Create one"}</Link></p><p className="mt-4 text-center text-xs text-muted-foreground">Your password is securely hashed with bcrypt and your session uses JWT.</p></div>
}
