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
  container: {
    width: '500px',
    borderRadius: "32px"
  },
  buttons: {
    primary: {
      backgroundColor: "#5789f7",
      textColor: "#FFFFFF",
      borderColor: "#5789f7",
      borderRadius: "9.6px"
    },
    secondary: {
      backgroundColor: "#FFFFFF",
      textColor: "#1D1D1D",
      borderColor: "#CECECE",
      borderRadius: "9.6px"
    }
  },
  inputs: {
    borderColor: "#CECECE",
    borderRadius: "4px",
    textColor: "#1D1D1D",
    placeholderColor: "#525151",
    backgroundColor: "#FFFFFF"
  },
  fontFamily: customFont.style.fontFamily,
};

export const customStrings = {
  'login.title': '👋🏻 Welcome to Tavily!',
  'button.continueWithEmail': 'Continue',
  'button.createAnOrganization': 'Create team',
  'methodDivider.text': 'OR',
  'organizationDiscovery.title': 'Select a team to continue',
  'formField.email.placeholder': 'Email address*',
};