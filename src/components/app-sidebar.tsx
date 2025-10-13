'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Home,
  Plus,
  Settings,
  Users,
  Shield,
  Grid,
  Lock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@/components/ui/sidebar';
import {
  useStytchB2BClient,
  useStytchMemberSession,
  useStytchMember,
  useStytchOrganization,
} from '@stytch/nextjs/b2b';
import { useRouter } from 'next/navigation';
import {
  getAllNotes,
  Note,
  clearNotesCache,
  notesEnabled,
} from '@/lib/notesData';
import { useMemo, useState, useEffect, useRef } from 'react';
import OrgSwitcher from './OrgSwitcher';
import CreateTeamModal from './CreateTeamModal';
import { useNotes } from '../contexts/NotesContext';

const settingsItems = [
  { name: 'Members', href: '/members', icon: <Users className="w-4 h-4" /> },
  {
    name: 'Organization',
    href: '/settings',
    icon: <Settings className="w-4 h-4" />,
  },
  { name: 'SSO', href: '/sso', icon: <Shield className="w-4 h-4" /> },
  { name: 'SCIM', href: '/scim', icon: <Grid className="w-4 h-4" /> },
];

export function AppSidebar() {
  const stytch = useStytchB2BClient();
  const { session, isInitialized } = useStytchMemberSession();
  const { member } = useStytchMember();
  const { organization } = useStytchOrganization();
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [notesDisabled, setNotesDisabled] = useState(false);

  // Use notes context for sidebar
  const { recentNotes, setRecentNotes, addNote } = useNotes();

  // Track the current organization ID to detect changes
  const previousOrgIdRef = useRef<string | null>(null);

  useEffect(() => {
    const loadAllNotes = async () => {
      try {
        const allNotes = await getAllNotes();
        // Sort by most recently updated
        const sortedNotes = allNotes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        setRecentNotes(sortedNotes);
        setNotesDisabled(!notesEnabled());
      } catch (error) {
        console.error('Error loading notes:', error);
        if (error instanceof Error && error.message.includes('Notes are disabled')) {
          setNotesDisabled(true);
        }
      }
    };

    if (session && organization) {
      const currentOrgId = organization.organization_id;

      // Check if organization has changed
      if (
        previousOrgIdRef.current !== null &&
        previousOrgIdRef.current !== currentOrgId
      ) {
        // Organization changed - clear notes and reload
        setRecentNotes([]);
        clearNotesCache(); // Clear cache for the new organization
      }

      // Update the tracked organization ID
      previousOrgIdRef.current = currentOrgId;

      // Load notes if we don't have any or if organization changed
      if (!notesDisabled && recentNotes.length === 0) {
        loadAllNotes();
      }
    }
  }, [session, organization, recentNotes.length, setRecentNotes, notesDisabled]);

  const handleLogOut = () => {
    stytch.session
      .revoke()
      .then(() => {
        router.replace('/');
      })
      .catch(error => {
        // If session is already invalid (401), still redirect to home
        router.replace('/');
      });
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  // Only hide sidebar if initialization is complete and there's no session
  if (isInitialized && !session) {
    return null;
  }

  // Get user name and organization info - use loading placeholders if data not yet available
  const userName = member?.name || member?.email_address || '...';
  const orgName = organization?.organization_name || '...';
  const orgInitial = organization ? orgName.charAt(0).toUpperCase() : '...';

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
              </div>
              <ChevronDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="start"
            sideOffset={4}
          >
            <OrgSwitcher
              key={organization?.organization_id || 'no-org'}
              onCreateTeam={() => setIsCreateTeamModalOpen(true)}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/dashboard')}
                  tooltip="Home"
                >
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
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map(item => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.name}
                  >
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
        <SidebarGroup className="flex-1 min-h-0">
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupAction
            onClick={async () => {
              try {
                if (notesDisabled) {
                  alert('Notes are disabled because no database is configured.');
                  return;
                }

                const response = await fetch('/api/notes/new', {
                  method: 'POST',
                });

                if (!response.ok) {
                  if (response.status === 503) {
                    setNotesDisabled(true);
                    alert('Notes are disabled because no database is configured.');
                  }
                  console.error('Failed to create note');
                  return;
                }

                const data = await response.json();
                setNotesDisabled(false);

                // Convert API response to Note format and add to sidebar
                const newNote: Note = {
                  id: data.note.id,
                  title: data.note.title,
                  content: data.note.content,
                  member_id: data.note.member_id,
                  organization_id: data.note.organization_id,
                  visibility: data.note.visibility,
                  createdAt: new Date(data.note.created_at),
                  updatedAt: new Date(data.note.updated_at),
                  isFavorite: data.note.is_favorite,
                  tags: data.note.tags || [],
                };

                addNote(newNote);

                router.push(`/notes?id=${data.note.id}`);
              } catch (error) {
                console.error('Error creating new note:', error);
                if (
                  error instanceof Error &&
                  error.message.includes('Notes are disabled')
                ) {
                  setNotesDisabled(true);
                  alert('Notes are disabled because no database is configured.');
                }
              }
            }}
          >
            <Plus className="size-4" />
          </SidebarGroupAction>
          <SidebarGroupContent className="overflow-y-auto">
            <SidebarMenu>
              {notesDisabled ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <FileText className="w-4 h-4" />
                    <span className="text-muted-foreground">
                      Notes disabled (no database configured)
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                <>
                  {recentNotes.map(note => (
                    <SidebarMenuItem key={note.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={
                          pathname === '/notes' &&
                          new URLSearchParams(window.location.search).get('id') ===
                            note.id
                        }
                        tooltip={note.title}
                      >
                        <Link href={`/notes?id=${note.id}`}>
                          <FileText className="w-4 h-4" />
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            <span className="truncate">{note.title}</span>
                            {note.visibility === 'private' && (
                              <Lock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                            )}
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  {recentNotes.length === 0 && (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>
                        <FileText className="w-4 h-4" />
                        <span className="text-muted-foreground">No notes yet</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </>
              )}
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
                    <span className="truncate text-xs">
                      {member?.email_address}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem
                  onClick={handleLogOut}
                  className="text-red-600"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
      <CreateTeamModal
        isOpen={isCreateTeamModalOpen}
        onClose={() => setIsCreateTeamModalOpen(false)}
        onSuccess={() => {
          // Modal will handle session exchange, just close the modal
          setIsCreateTeamModalOpen(false);
        }}
      />
    </Sidebar>
  );
}
