import type { ReactNode } from "react";

import { Link, useRouterState } from "@tanstack/react-router";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import {
  BookOpen,
  LayoutDashboard,
  LifeBuoy,
  Settings2,
  Sparkles,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    label: "Overview",
    to: "/",
    icon: LayoutDashboard,
    description: "Latest activity and quick stats",
  },
  {
    label: "Playground",
    to: "/playground",
    icon: Sparkles,
    description: "Experiment with realtime tools",
  },
  {
    label: "Learn",
    to: "/learn",
    icon: BookOpen,
    description: "Documentation and tutorials",
  },
];

export function AppSidebar({ children }: { children: ReactNode }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-muted/20">
        <Sidebar variant="floating" collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.description}
                        isActive={pathname === item.to}
                      >
                        <Link to={item.to} className="flex items-center gap-2">
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Resources</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip="Adjust preferences for your workspace"
                      asChild
                    >
                      <Link to="/settings" className="flex items-center gap-2">
                        <Settings2 className="size-4" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip="Guided help when you need it"
                      asChild
                    >
                      <Link to="/support" className="flex items-center gap-2">
                        <LifeBuoy className="size-4" />
                        <span>Support</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter></SidebarFooter>
        </Sidebar>
        <SidebarRail />
        <SidebarInset>{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}
