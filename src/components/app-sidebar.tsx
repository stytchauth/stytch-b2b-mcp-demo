"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronUp, FileText, Home, Plus, Search, Settings, User, Users, Shield, Grid } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useStytchB2BClient, useStytchMemberSession, useStytchMember, useStytchOrganization } from '@stytch/nextjs/b2b'
import { useRouter } from 'next/navigation'

const projects = [
  { name: "Dashboard", href: "/dashboard", icon: <Home className="w-4 h-4" /> },
  { name: "Team Notes", href: "/notes", icon: <FileText className="w-4 h-4" /> },
]

const settingsItems = [
  { name: "Members", href: "/members", icon: <Users className="w-4 h-4" /> },
  { name: "Organization", href: "/settings", icon: <Settings className="w-4 h-4" /> },
  { name: "SSO", href: "/sso", icon: <Shield className="w-4 h-4" /> },
  { name: "SCIM", href: "/scim", icon: <Grid className="w-4 h-4" /> },
]

export function AppSidebar() {
  const stytch = useStytchB2BClient()
  const { session } = useStytchMemberSession()
  const { member } = useStytchMember()
  const { organization } = useStytchOrganization()
  const router = useRouter()
  const pathname = usePathname()
  const { state, isMobile } = useSidebar()

  const handleLogOut = () => {
    stytch.session.revoke().then(() => {
      router.replace('/')
    })
  }

  const isActive = (href: string) => {
    return pathname === href
  }

  // Get user name and initial for avatar
  const userName = member?.name || member?.email_address || 'User'
  const userInitial = userName.charAt(0).toUpperCase()
  const orgName = organization?.organization_name || 'Organization'
  const orgInitial = orgName.charAt(0).toUpperCase()

  if (!session) {
    return (
      <div className="w-64 h-screen bg-gray-100 border-r border-gray-200 p-4">
        <div className="text-gray-600">Please log in to view sidebar</div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg">
                <Avatar className="size-6">
                  <AvatarFallback>{orgInitial}</AvatarFallback>
                </Avatar>
                <span className="flex-1">{orgName}</span>
                <ChevronDown className="size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
              <DropdownMenuItem>
                <Avatar className="size-6 mr-2">
                  <AvatarFallback>{orgInitial}</AvatarFallback>
                </Avatar>
                <span>{orgName}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Plus className="w-4 h-4 mr-2" />
                New Workspace
              </DropdownMenuItem>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
                        <Link href="/dashboard">
                          <Home />
                          <span>Home</span>
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile}>
                      Home
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupAction>
              <Plus className="size-4" />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                {projects.filter(project => project.href !== "/dashboard").map((project) => (
                  <SidebarMenuItem key={project.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild isActive={isActive(project.href)}>
                          <Link href={project.href}>
                            {project.icon}
                            <span>{project.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile}>
                        {project.name}
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsItems.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild isActive={isActive(item.href)}>
                          <Link href={item.href}>
                            {item.icon}
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile}>
                        {item.name}
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton>
                <User className="size-4" />
                <span>{userName}</span>
                <ChevronUp className="size-4 ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
              <DropdownMenuItem>Account</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogOut}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  )
} 