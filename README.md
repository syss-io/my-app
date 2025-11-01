# Naming Sprint Workspace

Interactive naming environment where founders capture an idea, tweak tonal and market constraints, and receive curated name directions with live domain availability checks.

Built with Next.js App Router, shadcn/ui components, TanStack Query, LangChain + OpenAI, and Domainr’s RapidAPI search.

## Prerequisites

- Node.js 18+
- pnpm 8+
- OpenAI account with API access
- RapidAPI key for the Domainr Search API

## Environment Variables

Create a `.env.local` file and provide the following values:

```bash
OPENAI_API_KEY=sk-...
# Optional: override default `gpt-4o-mini`
OPENAI_MODEL=gpt-4o-mini
RAPIDAPI_KEY=59aaf6572cmsh516a74960baa3e8p1c2d24jsn1e91dc4f8d23
```

> The provided RapidAPI key matches the development key from the project brief. Replace it with your own key in production.

## Install & Run

```bash
pnpm install
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to open the workspace.

## Tech Notes

- UI uses only shadcn/ui primitives. Add new pieces with `pnpm dlx shadcn@latest add <component>`.
- LangChain registers a `domainr_search` tool so the LLM must verify each candidate through Domainr before responding.
- Naming results stream through a dedicated API route at `POST /api/naming`.
- Query Client provider lives in `components/providers/query-client-provider.tsx` and wraps the App Router layout so React Query is available across client components.

## Scripts

```bash
pnpm dev     # start dev server
pnpm lint    # run eslint
pnpm build   # production build
pnpm start   # start production server
```
