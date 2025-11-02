import type { ReactNode } from 'react'

import { createFileRoute } from '@tanstack/react-router'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useUser,
} from '@clerk/clerk-react'
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import logo from '../logo.svg'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { user } = useUser()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between rounded-lg border bg-card p-6 shadow-sm">
        <div className="grid gap-2 text-left">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="text-sm font-medium uppercase tracking-wide">
              Quick access
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p className="text-sm text-muted-foreground">
            Stay in flow with a floating command center and unified auth powered by Clerk.
          </p>
        </div>
        <img src={logo} alt="TanStack" className="hidden h-20 md:block" />
      </div>

      <SignedOut>
        <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed bg-muted/30 p-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Join the workspace</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to sync projects, manage teams, and pick up right where you left off.
            </p>
          </div>
          <SignInButton mode="modal">
            <Button size="lg" className="gap-2">
              Continue with Clerk
              <ArrowRight className="size-4" />
            </Button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Layered security"
            description="Multi-tenant, passwordless, and enterprise SSO in minutes."
            icon={<ShieldCheck className="size-5" />}
          />
          <FeatureCard
            title="Instant context"
            description="All your routes, queries, and activity a single trigger away."
            icon={<Zap className="size-5" />}
          />
          <FeatureCard
            title="Team ready"
            description="Invite teammates, manage roles, and deploy without friction."
            icon={<ArrowRight className="size-5" />}
          />
        </div>
      </SignedIn>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3 text-primary">
        {icon}
        <span className="text-sm font-medium uppercase tracking-wide">Featured</span>
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
