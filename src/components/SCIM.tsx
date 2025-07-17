import { AdminPortalSCIM } from '@stytch/nextjs/b2b/adminPortal'
import { adminPortalConfig, adminPortalStyles } from '@/lib/stytchConfig';

/*
 * SCIM configures and renders the Stytch AdminPortalSCIM pre-built UI component for setting up SCIM.
 *
 * This component accepts style, config, and callbacks props. To learn more about possible options review the documentation at
 * https://stytch.com/docs/b2b/sdks/admin-portal/org-settings
 */

const SCIM = () => {

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">SCIM Provisioning</h1>
        <p className="page-subtitle">Manage user provisioning and directory sync for your organization</p>
      </div>
      <div className="admin-content-wrapper">
        <AdminPortalSCIM styles={adminPortalStyles} config={adminPortalConfig} />
      </div>
    </div>
  );
};

export default SCIM;