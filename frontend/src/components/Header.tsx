import { Link } from '@tanstack/react-router'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="size-9" />
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/tanstack-word-logo-white.svg"
              alt="TanStack"
              className="h-8 w-auto"
            />
            <span className="text-lg font-semibold text-foreground">Dashboard</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
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
