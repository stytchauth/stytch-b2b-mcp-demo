import { AdminPortalOrgSettings } from '@stytch/nextjs/b2b/adminPortal';
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
    <div className="page-container">
      <div className="page-header">
        <p className="page-subtitle">
          Manage your organization&apos;s configuration and preferences
        </p>
      </div>
      <AdminPortalOrgSettings
        config={adminPortalConfig}
        styles={adminPortalStyles}
      />
    </div>
  );
};

export default Settings;
