import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '@/components/Header'
import { AppSidebar } from '@/components/AppSidebar'

export const Route = createRootRoute({
  component: () => (
    <AppSidebar>
      <div className="flex min-h-svh flex-col">
        <Header />
        <div className="flex flex-1 flex-col gap-6 p-6">
          <Outlet />
        </div>
      </div>
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </AppSidebar>
  ),
})
