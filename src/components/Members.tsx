import { AdminPortalMemberManagement } from '@stytch/nextjs/b2b/adminPortal'
import { adminPortalConfig, adminPortalStyles } from '@/lib/stytchConfig';

/*
 * Members configures and renders the Stytch AdminPortalMemberManagement pre-built UI component 
 * This allows users with the requisite permissions to view, update, invite, and remove Members in their Organization
 *
 * This component accepts style, config, and callbacks props. To learn more about possible options review the documentation at
 * https://stytch.com/docs/b2b/sdks/admin-portal/member-management
 */

const Members = () => {

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Team Members</h1>
        <p className="page-subtitle">Invite and manage members of your organization</p>
      </div>
      <div className="admin-content-wrapper">
        <AdminPortalMemberManagement config={adminPortalConfig} styles={adminPortalStyles} />
      </div>
    </div>
  );
};

export default Members;
