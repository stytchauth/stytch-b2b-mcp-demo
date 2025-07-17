'use client';

import { AppSidebar } from "../../components/app-sidebar"
import { SidebarTrigger } from "../../components/ui/sidebar"
import SCIM from '../../components/SCIM'

export default function SCIMPage() {
  return (
    <div className="flex h-full">
      <AppSidebar />
      <main className="flex-1 p-4 md:p-6">
        <header className="flex items-center mb-4">
          <SidebarTrigger className="md:hidden mr-2" />
          <h1 className="text-2xl font-semibold">SCIM Provisioning</h1>
        </header>
        <div className="h-[calc(100%-4rem)]">
          <SCIM />
        </div>
      </main>
    </div>
  )
}