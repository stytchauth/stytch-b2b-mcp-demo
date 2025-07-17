'use client';

import { AppSidebar } from "../../components/app-sidebar"
import { Button } from "../../components/ui/button"
import { SidebarTrigger } from "../../components/ui/sidebar"
import { Textarea } from "../../components/ui/textarea"
import { MoreHorizontal, Star } from "lucide-react"

export default function NotesPage() {
  return (
    <div className="flex h-full">
      <AppSidebar />
      <main className="flex-1 p-4 md:p-6">
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-2xl font-semibold">Team Notes</h1>
            <Button variant="ghost" size="icon">
              <Star className="w-5 h-5" />
              <span className="sr-only">Favorite</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost">Share</Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-5 h-5" />
              <span className="sr-only">More options</span>
            </Button>
          </div>
        </header>
        <div className="h-[calc(100%-4rem)]">
          <Textarea
            placeholder="Start writing your team notes here..."
            className="w-full h-full text-base border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
            defaultValue={`# Team Notes

This is your collaborative space for team notes and ideas.

## Meeting Notes

- **Date:** Today
- **Attendees:** Team members
- **Agenda:** 
  - Review project progress
  - Discuss upcoming features
  - Plan next sprint

## Action Items

- [ ] Update project documentation
- [ ] Schedule team review session
- [ ] Prepare for next sprint planning

## Ideas & Brainstorming

Use this space to capture creative ideas and thoughts that emerge during collaboration.
`}
          />
        </div>
      </main>
    </div>
  )
} 