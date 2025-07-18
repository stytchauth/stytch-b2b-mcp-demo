'use client';

import { ReactNode } from 'react';
import { SidebarProvider } from './ui/sidebar';
import StytchProvider from './StytchProvider';

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
      <SidebarProvider defaultOpen={defaultOpen}>{children}</SidebarProvider>
    </StytchProvider>
  );
}
