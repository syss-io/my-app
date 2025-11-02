import { createFileRoute } from '@tanstack/react-router'
import { Sparkles } from 'lucide-react'

export const Route = createFileRoute('/playground')({
  component: Playground,
})

function Playground() {
  return (
    <section className="flex flex-1 flex-col items-start gap-4 rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3 text-primary">
        <Sparkles className="size-5" />
        <h1 className="text-2xl font-semibold">Realtime Playground</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Experiment with new ideas, mock data, and network flows. We'll surface metrics and shareable snippets here soon.
      </p>
    </section>
  )
}

