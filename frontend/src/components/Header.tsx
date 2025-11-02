import { Link } from '@tanstack/react-router'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center justify-between gap-4 px-4 pt-2 md:px-6 md:pt-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SidebarTrigger className="size-9 shrink-0" />
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <img
              src="/tanstack-word-logo-white.svg"
              alt="TanStack"
              className="hidden h-8 w-auto md:block"
            />
            <span className="truncate text-lg font-semibold text-foreground">Dashboard</span>
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm">Sign in</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'size-9' } }} />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}
