import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStytchB2BClient } from '@stytch/nextjs/b2b';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const stytch = useStytchB2BClient();
  const [organizationName, setOrganizationName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationName.trim()) return;

    // Generate slug from organization name (lowercase, replace spaces with hyphens)
    const orgSlug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    try {
      setIsCreating(true);

      // Call our backend API to create the organization
      const response = await fetch('/api/organizations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization_name: organizationName.trim(),
          organization_slug: orgSlug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create organization');
      }

      console.log('Organization created:', data.organization.organization_name);

      // Close modal and reset form first
      handleCloseModal();

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Exchange session to the new organization using frontend SDK
      await stytch.session.exchange({
        organization_id: data.organization.organization_id,
        session_duration_minutes: 60,
      });

      console.log('Session exchanged to new organization');

      // Navigate to current page to refresh organization context
      router.push(pathname);
    } catch (error) {
      console.error('Failed to create organization:', error);
      alert(
        `Failed to create organization: ${error instanceof Error ? error.message : 'Please try again.'}`
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseModal = () => {
    setOrganizationName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Enter a name for your new team. You&apos;ll be automatically added
            as an admin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateOrganization}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="org-name">Team Name</Label>
              <Input
                id="org-name"
                value={organizationName}
                onChange={e => setOrganizationName(e.target.value)}
                placeholder="Enter team name"
                disabled={isCreating}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !organizationName.trim()}
            >
              {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeamModal;
