import { createFileRoute } from '@tanstack/react-router'
import { Settings2 } from 'lucide-react'

export const Route = createFileRoute('/settings')({
  component: Settings,
})

function Settings() {
  return (
    <section className="flex flex-1 flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3 text-primary">
        <Settings2 className="size-5" />
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Manage integrations, project permissions, and advanced preferences. Hooks into backend APIs will appear here.
      </p>
    </section>
  )
}

