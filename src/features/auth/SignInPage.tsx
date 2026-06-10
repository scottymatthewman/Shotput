import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { db, hasInstantConfig } from '@/lib/instant/db'
import { cn } from '@/lib/utils'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'

type Step = { kind: 'email' } | { kind: 'code'; email: string }

const cardClass = cn(
  'flex w-full max-w-sm flex-col gap-6 rounded-xl inset-edge-ring inset-edge-ring-full bg-surface-1 p-8',
)

/** Magic-code sign-in via InstantDB. Guest mode shows a bypass link instead. */
export function SignInPage() {
  const { user } = db.useAuth()
  const location = useLocation()
  const [step, setStep] = useState<Step>({ kind: 'email' })
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  if (user) return <Navigate to={from} replace />

  async function handleSendCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = new FormData(e.currentTarget).get('email')
    if (typeof email !== 'string' || !email.trim()) return
    setPending(true)
    setError(null)
    try {
      await db.auth.sendMagicCode({ email: email.trim() })
      setStep({ kind: 'code', email: email.trim() })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send code')
    } finally {
      setPending(false)
    }
  }

  async function handleVerifyCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (step.kind !== 'code') return
    const code = new FormData(e.currentTarget).get('code')
    if (typeof code !== 'string' || !code.trim()) return
    setPending(true)
    setError(null)
    try {
      await db.auth.signInWithMagicCode({ email: step.email, code: code.trim() })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code')
      setPending(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-background p-4">
      <div className={cardClass}>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            {step.kind === 'email'
              ? 'Enter your email and we will send you a one-time code.'
              : `We sent a code to ${step.email}.`}
          </p>
        </div>

        {!hasInstantConfig ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              No <code className="font-mono text-xs">VITE_INSTANT_APP_ID</code> configured — the
              app is running in guest mode without auth.
            </p>
            <Button asChild className="w-full">
              <Link to="/">Continue as guest</Link>
            </Button>
          </div>
        ) : step.kind === 'email' ? (
          <form className="flex flex-col gap-4" onSubmit={handleSendCode}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sign-in-email">Email</Label>
              <Input
                id="sign-in-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Sending…' : 'Send code'}
            </Button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleVerifyCode}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sign-in-code">One-time code</Label>
              <Input
                id="sign-in-code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                required
                autoFocus
              />
            </div>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Verifying…' : 'Sign in'}
            </Button>
            <button
              type="button"
              className="text-left text-xs text-muted-foreground transition-surface duration-150 ease-hover hover:text-foreground"
              onClick={() => {
                setStep({ kind: 'email' })
                setError(null)
              }}
            >
              Use a different email
            </button>
          </form>
        )}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  )
}
