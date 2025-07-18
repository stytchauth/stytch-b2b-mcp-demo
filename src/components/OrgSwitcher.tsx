import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  useStytchB2BClient,
  useStytchOrganization,
  useStytchMemberSession,
  useStytchMember,
} from '@stytch/nextjs/b2b';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Loader2, Mail, Lock, Check, Plus } from 'lucide-react';

const OrgSwitcher = () => {
  const stytch = useStytchB2BClient();
  const { organization: currentOrganization } = useStytchOrganization();
  const { session } = useStytchMemberSession();
  const { member } = useStytchMember();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Auto-load organizations when component mounts
  useEffect(() => {
    loadOrganizations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadOrganizations = async () => {
    setIsLoading(true);
    try {
      const response = await stytch.discovery.organizations.list();
      setOrganizations(response.discovered_organizations);
    } catch (error) {
      console.error('Failed to load organizations:', error);

      // Fallback: try to get organizations from the session if discovery fails
      try {
        if (member) {
          // For now, just show empty state but log what we have
          setOrganizations([]);
        }
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
        setOrganizations([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrganizationSelect = async (organization: any) => {
    try {
      // Exchange session for the new organization
      await stytch.session.exchange({
        organization_id: organization.organization.organization_id,
        session_duration_minutes: 60,
      });
      // Stay on the current page after switching organizations
      router.push(pathname);
    } catch (error) {
      console.error('Failed to switch organization:', error);
    }
  };

  // Helper to get initials for avatar
  const getInitial = (name: any) => name.charAt(0).toUpperCase();

  return (
    <>
      <div className="px-2 py-1.5 text-left text-sm font-semibold">
        Switch Team
      </div>
      <DropdownMenuSeparator />

      {isLoading ? (
        <DropdownMenuItem disabled>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading organizations...
        </DropdownMenuItem>
      ) : organizations.length === 0 ? (
        <DropdownMenuItem disabled>
          <span className="text-muted-foreground">
            No other organizations found
          </span>
        </DropdownMenuItem>
      ) : (
        organizations.map(org => (
          <DropdownMenuItem
            key={org.organization.organization_id}
            onClick={() => handleOrganizationSelect(org)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="flex aspect-square size-6 items-center justify-center rounded bg-sidebar-primary text-sidebar-primary-foreground mr-2">
                <span className="text-xs font-semibold">
                  {getInitial(org.organization.organization_name)}
                </span>
              </div>
              <span>{org.organization.organization_name}</span>
            </div>
            <div className="flex items-center gap-1">
              {/* Pending invite icon */}
              {org.membership?.type === 'invited_member' && (
                <Mail className="w-4 h-4 text-orange-500" />
              )}
              {!org.member_authenticated && (
                <Lock className="w-4 h-4 text-gray-400" />
              )}
              {/* Current org checkmark */}
              {org.organization.organization_id ===
                currentOrganization?.organization_id && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </div>
          </DropdownMenuItem>
        ))
      )}

      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <Plus className="w-4 h-4 mr-2" />
        Create Team
      </DropdownMenuItem>
    </>
  );
};

export default OrgSwitcher;
