import { createFileRoute } from '@tanstack/react-router'
import { LifeBuoy } from 'lucide-react'

export const Route = createFileRoute('/support')({
  component: Support,
})

function Support() {
  return (
    <section className="flex flex-1 flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3 text-primary">
        <LifeBuoy className="size-5" />
        <h1 className="text-2xl font-semibold">Support</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Need a hand? Start a chat, open a ticket, or browse solutions tailored to your deployment.
      </p>
    </section>
  )
}

