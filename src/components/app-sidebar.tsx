"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronUp, FileText, Home, Plus, Search, Settings, User, Users, Shield, Grid } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { useStytchB2BClient, useStytchMemberSession, useStytchMember, useStytchOrganization } from '@stytch/nextjs/b2b'
import { useRouter } from 'next/navigation'
import { getRecentNotes } from "../../lib/notesData"
import { useMemo } from 'react'
import OrgSwitcher from './OrgSwitcher'

const projects = [
  { name: "Dashboard", href: "/dashboard", icon: <Home className="w-4 h-4" /> },
]

const settingsItems = [
  { name: "Members", href: "/members", icon: <Users className="w-4 h-4" /> },
  { name: "Organization", href: "/settings", icon: <Settings className="w-4 h-4" /> },
  { name: "SSO", href: "/sso", icon: <Shield className="w-4 h-4" /> },
  { name: "SCIM", href: "/scim", icon: <Grid className="w-4 h-4" /> },
]

export function AppSidebar() {
  const stytch = useStytchB2BClient()
  const { session, isInitialized } = useStytchMemberSession()
  const { member } = useStytchMember()
  const { organization } = useStytchOrganization()
  const router = useRouter()
  const pathname = usePathname()
  const { state, isMobile } = useSidebar()



  // Get recent notes for sidebar
  const recentNotes = useMemo(() => getRecentNotes(3), [])

  const handleLogOut = () => {
    stytch.session.revoke()
      .then(() => {
        router.replace('/')
      })
      .catch((error) => {
        // If session is already invalid (401), still redirect to home
        console.log('Session revoke failed (likely already expired):', error.message)
        router.replace('/')
      })
  }

  const isActive = (href: string) => {
    return pathname === href
  }

  // Only hide sidebar if initialization is complete and there's no session
  if (isInitialized && !session) {
    return null;
  }

  // Get user name and initial for avatar - use loading placeholders if data not yet available
  const userName = member?.name || member?.email_address || '...'
  const userInitial = member ? userName.charAt(0).toUpperCase() : '...'
  const orgName = organization?.organization_name || '...'
  const orgInitial = organization ? orgName.charAt(0).toUpperCase() : '...'

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <span className="text-sm font-semibold">{orgInitial}</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{orgName}</span>
                <span className="truncate text-xs">Workspace</span>
              </div>
              <ChevronDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            <OrgSwitcher variant="sidebar" />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Search">
                  <Search />
                  <span>Search</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard")} tooltip="Home">
                  <Link href="/dashboard">
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupAction>
            <Link href="/notes">
              <Plus className="size-4" />
            </Link>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.filter(project => project.href !== "/dashboard").map((project) => (
                <SidebarMenuItem key={project.name}>
                  <SidebarMenuButton asChild isActive={isActive(project.href)} tooltip={project.name}>
                    <Link href={project.href}>
                      {project.icon}
                      <span>{project.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {recentNotes.map((note) => (
                <SidebarMenuItem key={note.id}>
                  <SidebarMenuButton asChild isActive={pathname === "/notes" && new URLSearchParams(window.location.search).get('id') === note.id} tooltip={note.title}>
                    <Link href={`/notes?id=${note.id}`}>
                      <FileText className="w-4 h-4" />
                      <span className="truncate">{note.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {recentNotes.length === 0 && projects.filter(project => project.href !== "/dashboard").length === 1 && (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <FileText className="w-4 h-4" />
                    <span className="text-muted-foreground">No additional notes yet</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.name}>
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userName}</span>
                    <span className="truncate text-xs">{member?.email_address}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogOut} className="text-red-600">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
} 