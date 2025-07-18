import { AdminPortalSSO } from '@stytch/nextjs/b2b/adminPortal';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { adminPortalConfig, adminPortalStyles } from '@/lib/stytchConfig';

/*
 * SSO configures and renders the Stytch AdminPortalSSO pre-built UI component for setting up and managing SAML and OIDC SSO Connections.
 *
 * This component accepts style, config, and callbacks props. To learn more about possible options review the documentation at
 * https://stytch.com/docs/b2b/sdks/admin-portal/sso
 */

const SSO = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <p className="page-subtitle">
          Configure SAML and OIDC SSO connections for your organization
        </p>
      </div>
      <AdminPortalSSO config={adminPortalConfig} styles={adminPortalStyles} />
    </div>
  );
};

export default SSO;
