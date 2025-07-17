'use client';

import { AppSidebar } from "../../components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "../../components/ui/sidebar"
import { useStytchMemberSession, useStytchOrganization } from '@stytch/nextjs/b2b';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link"
import { FileText, PlusCircle, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"

const recentNotes = [
  { title: "Getting Started", href: "/notes/getting-started" },
  { title: "Project Roadmap Q3", href: "#" },
  { title: "Meeting Notes - 2024-07-15", href: "#" },
]

const favoriteNotes = [
  { title: "Company OKRs", href: "#" },
  { title: "Design System Principles", href: "#" },
]

export default function DashboardPage() {
  const { session, isInitialized } = useStytchMemberSession();
  const { organization } = useStytchOrganization();
  const router = useRouter();

  const role = useMemo(() => {
    return session?.roles.includes('stytch_admin') ? 'admin' : 'member';
  }, [session?.roles]);

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-600">Loading your workspace...</div>
      </div>
    );
  }

  if (isInitialized && !session) {
    router.replace("/");
    return null;
  }

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 p-4 md:p-6">
          <header className="flex items-center gap-2 mb-6">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-2xl font-semibold">Good morning!</h1>
          </header>
          <div className="grid gap-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Quick Note</CardTitle>
                  <PlusCircle className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Jot down a quick thought or reminder.</p>
                  <Button size="sm" className="w-full mt-4" asChild>
                    <Link href="/notes">New Note</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Team Updates</CardTitle>
                  <Avatar className="w-6 h-6">
                    <AvatarImage src="/placeholder.svg?height=24&width=24" />
                    <AvatarFallback>V</AvatarFallback>
                  </Avatar>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Last update from team members in {organization?.organization_name}.</p>
                  <Button size="sm" variant="outline" className="w-full mt-4 bg-transparent" asChild>
                    <Link href="/members">View Updates</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
                  <span className="text-xs text-muted-foreground">3 open</span>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Tasks assigned to you across all projects.</p>
                  <Button size="sm" variant="outline" className="w-full mt-4 bg-transparent">
                    View Tasks
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="w-4 h-4" />
                    Recent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {recentNotes.map((note) => (
                      <li key={note.title}>
                        <Link href={note.href} className="text-sm hover:underline">
                          {note.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Star className="w-4 h-4" />
                    Favorites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {favoriteNotes.map((note) => (
                      <li key={note.title}>
                        <Link href={note.href} className="text-sm hover:underline">
                          {note.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </>
  );
}
