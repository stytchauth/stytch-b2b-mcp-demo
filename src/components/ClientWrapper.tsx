'use client';

import { ReactNode } from 'react';
import { SidebarProvider } from './ui/sidebar';
import StytchProvider from './StytchProvider';
import { NotesProvider } from '../contexts/NotesContext';

interface ClientWrapperProps {
  children: ReactNode;
  defaultOpen: boolean;
}

export default function ClientWrapper({
  children,
  defaultOpen,
}: ClientWrapperProps) {
  return (
    <StytchProvider>
      <NotesProvider>
        <SidebarProvider defaultOpen={defaultOpen}>{children}</SidebarProvider>
      </NotesProvider>
    </StytchProvider>
  );
}
