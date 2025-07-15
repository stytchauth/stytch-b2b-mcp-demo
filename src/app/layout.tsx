'use client';

import './globals.css';
import './layout.css';

import { ReactNode } from 'react';
import StytchProvider from '../components/StytchProvider';
import OrgSwitcher from '@/src/components/OrgSwitcher';
import Link from 'next/link';
import { useStytchB2BClient, useStytchMemberSession, useStytchMember } from '@stytch/nextjs/b2b';
import { useRouter } from 'next/navigation';
import { FiLogOut } from 'react-icons/fi';
import Image from 'next/image';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <StytchProvider>
      <html lang="en">
        <title>Stytch Next.js App Router Example</title>
        <meta
          name="description"
          content="An example Next.js App Router application using Stytch for authentication"
        />
        <body>
          <div className="page-container">
            <SideNav />
            <main className="content-container">{children}</main>
          </div>
        </body>
      </html>
    </StytchProvider>
  );
}

const SideNav = () => {
  const stytch = useStytchB2BClient();
  const { session } = useStytchMemberSession();
  const { member } = useStytchMember();
  const router = useRouter();

  const handleLogOut = () => {
    stytch.session.revoke().then(() => {
      router.replace('/');
    });
  };

  if (!session) {
    return null;
  }

  // Get user name and initial for avatar
  const userName = member?.name || member?.email_address || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <nav className="sidebar">
      <div className="sidebar-logo-area">
        <Image src="/tavily.svg" alt="Tavily Logo" width={150} height={150} />
      </div>
      <div className="sidebar-divider" />
      <div className="sidebar-top-links">
        <OrgSwitcher />
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/members">Members</Link>
        <Link href="/settings">Settings</Link>
        <Link href="/sso">SSO</Link>
        <Link href="/scim">SCIM</Link>
      </div>
      <div className="sidebar-user-section">
        <span className="sidebar-user-avatar">{userInitial}</span>
        <span className="sidebar-user-name">{userName}</span>
        <button className="sidebar-logout-btn" onClick={handleLogOut} title="Log out">
          <FiLogOut />
        </button>
      </div>
    </nav>
  );
};
