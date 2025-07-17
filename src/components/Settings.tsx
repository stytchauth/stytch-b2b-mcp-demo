import { AdminPortalOrgSettings } from '@stytch/nextjs/b2b/adminPortal'
import { adminPortalConfig, adminPortalStyles } from '@/lib/stytchConfig';

/*
 * Settings configures and renders the Stytch AdminPortalOrgSettings pre-built UI component 
 * This allows users with the requisite permissions to manage their Organization settings.
 *
 * This component accepts style, config, and callbacks props. To learn more about possible options review the documentation at
 * https://stytch.com/docs/b2b/sdks/admin-portal/org-settings
 */

const Settings = () => {

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Organization Settings</h1>
        <p className="page-subtitle">Manage your organization's configuration and preferences</p>
      </div>
      <div className="admin-content-wrapper">
        <AdminPortalOrgSettings config={adminPortalConfig} styles={adminPortalStyles} />
      </div>
    </div>
  );
};

export default Settings;
