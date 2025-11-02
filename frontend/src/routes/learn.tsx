import { createFileRoute } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'

export const Route = createFileRoute('/learn')({
  component: Learn,
})

function Learn() {
  return (
    <section className="flex flex-1 flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3 text-primary">
        <BookOpen className="size-5" />
        <h1 className="text-2xl font-semibold">Documentation</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Dive into guides and API contracts. Curated resources will appear here to keep your team aligned.
      </p>
    </section>
  )
}

