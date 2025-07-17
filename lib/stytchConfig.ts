import { IBM_Plex_Sans } from '@next/font/google';
import { AdminPortalB2BProducts } from '@stytch/nextjs/b2b/adminPortal'
import { B2BProducts, AuthFlowType, B2BOAuthProviders } from '@stytch/vanilla-js/b2b';

const customFont = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: '400',
  style: 'normal',
});

type Role = {
  role_id: string;
  description: string;
}

export const adminPortalConfig = {
  allowedAuthMethods: [
    AdminPortalB2BProducts.emailMagicLinks,
    AdminPortalB2BProducts.sso,
    AdminPortalB2BProducts.oauthGoogle,
    AdminPortalB2BProducts.password,
    AdminPortalB2BProducts.oauthGithub,
  ],
  getRoleDescription: (role: Role) => {
    if (role.role_id == 'stytch_admin') {
      return 'Able to manage settings and members'
    } else if (role.role_id == 'stytch_member') {
      return 'Able to view settings and members, but cannot edit'
    } else if (role.role_id == 'manager') {
      return 'Able to invite members, but cannot update organization settings'
    } else {
      return role.description;
    }
  },
  getRoleDisplayName: (role: Role) => {
    if (role.role_id == 'stytch_admin') {
      return 'Admin'
    } else if (role.role_id == 'stytch_member') {
      return 'Member'
    } else if (role.role_id == 'manager') {
      return 'Manager'
    } else {
      return role.role_id
    }
  }
}

export const discoveryConfig = {
  authFlowType: AuthFlowType.Discovery,
  products: [B2BProducts.sso, B2BProducts.oauth, B2BProducts.emailOtp],
  sessionOptions: {
    sessionDurationMinutes: 60,
  },
  oauthOptions: {
    providers: [{type: B2BOAuthProviders.Google}, {type: B2BOAuthProviders.GitHub}]
  },
  directLoginForSingleMembership: {
    status: true,
    ignoreInvites: true,
    ignoreJitProvisioning: true,
  },
  directCreateOrganizationForNoMembership: true,
};

export const adminPortalStyles = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
  container: {
    backgroundColor: "#ffffff",
    borderColor: "rgba(55, 53, 47, 0.09)",
    borderRadius: "8px",
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.02)",
    width: "1000px",
    maxWidth: "calc(100vw - 2rem)",
  },
  colors: {
    primary: "rgba(55, 53, 47, 1)",           // main text color
    secondary: "rgba(55, 53, 47, 0.8)",       // secondary text
    success: "#22c55e",
    error: "#ef4444",
    accentText: "#2383e2",                    // accent blue
    accent: "rgba(35, 131, 226, 0.14)",       // light blue accent
    subtle: "rgba(55, 53, 47, 0.6)",
  },
  buttons: {
    primary: {
      backgroundColor: "rgba(55, 53, 47, 1)",
      textColor: "#ffffff",
      borderColor: "rgba(55, 53, 47, 1)",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
    },
    secondary: {
      backgroundColor: "#ffffff",
      textColor: "rgba(55, 53, 47, 1)",
      borderColor: "rgba(55, 53, 47, 0.16)",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
    },
    disabled: {
      backgroundColor: "rgba(55, 53, 47, 0.09)",
      textColor: "rgba(55, 53, 47, 0.4)",
      borderColor: "rgba(55, 53, 47, 0.09)",
      borderRadius: "6px",
    },
  },
  inputs: {
    backgroundColor: "#ffffff",
    textColor: "rgba(55, 53, 47, 1)",
    placeholderColor: "rgba(55, 53, 47, 0.4)",
    borderColor: "rgba(55, 53, 47, 0.16)",
    borderRadius: "6px",
    fontSize: "14px",
  },
  borderRadius: "8px",
}

export const discoveryStyles = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', system-ui, sans-serif",
  hideHeaderText: true,
  container: {
    width: '420px',
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.08)"
  },
  colors: {
    primary: "#2d2d2d",
    secondary: "#787774", 
    success: "#22c55e",
    error: "#f56565"
  },
  buttons: {
    primary: {
      backgroundColor: "#2d2d2d",
      textColor: "#ffffff",
      borderColor: "#2d2d2d",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500"
    },
    secondary: {
      backgroundColor: "#ffffff",
      textColor: "#2d2d2d",
      borderColor: "#e9e9e7",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500"
    }
  },
  inputs: {
    backgroundColor: "#ffffff",
    textColor: "#2d2d2d",
    placeholderColor: "#9b9a97",
    borderColor: "#e9e9e7",
    borderRadius: "8px",
    fontSize: "14px"
  }
};

export const customStrings = {
  'button.continueWithEmail': 'Continue with email',
  'button.createAnOrganization': 'Create workspace',
  'methodDivider.text': 'OR',
  'organizationDiscovery.title': 'Choose your workspace',
  'formField.email.placeholder': 'Enter your email...',
};