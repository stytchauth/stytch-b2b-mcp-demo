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
  fontFamily: "'Inter', 'IBM Plex Sans', Arial, sans-serif",
  container: {
    backgroundColor: "#fff",
    borderColor: "#f1f1f1",
    borderRadius: "18px",
  },
  colors: {
    primary: "#222",             // main text color
    secondary: "#222",        // main blue for accent text
    success: "#22c55e",
    error: "#ef4444",
    accentText: "#222",
    accent: "#e0e7ff",           // light blue accent
    subtle: "#6b7280",
  },
  buttons: {
    primary: {
      backgroundColor: "#6366f1",
      textColor: "#fff",
      borderColor: "#6366f1",
      borderRadius: "10px",
    },
    secondary: {
      backgroundColor: "#fff",
      textColor: "#222",
      borderColor: "#e5e7eb",
      borderRadius: "10px",
    },
    disabled: {
      backgroundColor: "#f1f1f1",
      textColor: "#bdbdbd",
      borderColor: "#e5e7eb",
      borderRadius: "10px",
    },
  },
  inputs: {
    backgroundColor: "#fff",
    textColor: "#222",
    placeholderColor: "#bdbdbd",
    borderColor: "#e5e7eb",
    borderRadius: "6px",
  },
  borderRadius: "18px",
}

export const discoveryStyles = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', system-ui, sans-serif",
  container: {
    width: '420px',
    backgroundColor: "#ffffff",
    borderColor: "#e9e9e7",
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
  'login.title': '👋 Welcome to Notion',
  'button.continueWithEmail': 'Continue with email',
  'button.createAnOrganization': 'Create workspace',
  'methodDivider.text': 'OR',
  'organizationDiscovery.title': 'Choose your workspace',
  'formField.email.placeholder': 'Enter your email...',
};