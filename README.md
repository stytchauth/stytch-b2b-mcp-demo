# B2B Demo App with Org Switcher

## Overview

This demo application demonstrates using Stytch B2B's pre-built UI components for both Login and Admin Portal (Member Management, Organization Settings, SSO and SCIM Configuration) along with a headless example of an Org Switcher.

It's largely a fork of the Next.js B2B Quickstart.

The copy for the login component and the org switcher should be updated to reflect whatever terminology the prospect uses to refer to Organizations

## TODO:

- [ ] Currently the Org Switcher shows a "Create team" button that isn't hooked up to anything. Hook this up to a BE API call that calls `CreateOrganization` and `CreateMember` and _then_ completes the headless SessionExchange with the new `organization_id`
- [ ] Handle step-up SSO when switching from an Organization that doesn't require SSO to one that does (this is the easiest one to demonsrate, since no UI required)

## Set up

Follow the steps below to get this application fully functional and running using your own Stytch credentials.

### In the Stytch Dashboard

1. Create a [Stytch](https://stytch.com/) account. Once your account is set up a Project called "My first project" will be automatically created for you.

2. Within your new Project, navigate to [SDK configuration](https://stytch.com/dashboard/sdk-configuration), and click **Enable SDK**.

3. Navigate to [API Keys](https://stytch.com/dashboard/api-keys). You will need the `project_id`, `secret`, and `public_token` values found on this page later on.

### Database Setup (Neon + Branch-based Development)

This project uses a branch-based development workflow with Neon PostgreSQL. Each developer gets their own database branch for isolated development.

#### Prerequisites

1. **Install Neon CLI**: Follow the [Neon CLI installation guide](https://neon.com/docs/reference/cli-install)
2. **Authenticate**: Run `neon auth` to log in to your Neon account

#### Quick Setup (Automated)

```bash
# Clone and install dependencies
git clone https://github.com/stytchauth/stytch-b2b-nextjs-quickstart-example.git
cd stytch-b2b-nextjs-quickstart-example
npm i

# Create your personal development branch and get connection details
npm run setup-dev
```

The setup script will:
- Create a unique development branch for you
- Write database configuration to your .env.local file
- Set up database tables

#### Manual Setup (Alternative)

If you prefer to set up manually:

```bash
# Create your .env.local file
touch .env.local

# Create your own development branch
neon branches create --project-id late-silence-21816472 --name dev-yourname --parent main

# Get connection string for your branch
neon connection-string --project-id late-silence-21816472 --branch dev-yourname --database-name neondb --pooled

# Set up database tables
DATABASE_URL="your-connection-string" npm run migrate
```

### Environment Configuration

Open `.env.local` in your editor and set the Stytch credentials from [API Keys](https://stytch.com/dashboard/api-keys), plus the database URLs from your branch setup:

```env
# Stytch Configuration
STYTCH_PROJECT_ENV=test
STYTCH_PROJECT_ID=project-test-00000000-0000-1234-abcd-abcdef1234
STYTCH_SECRET=secret-test-12345678901234567890abcdabcd
NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN=public-token-test-abcd123-0000-0000-abcd-1234567abc

# Database Configuration
DATABASE_URL=postgresql://your-branch-connection-string
DATABASE_URL_UNPOOLED=postgresql://your-unpooled-connection-string
```

## Running locally

After completing all the set up steps above the application can be run with the command:

```bash
npm run dev
```

The application will be available at [`http://localhost:3000`](http://localhost:3000).

# Flows to explore

- [ ] Authenticate and create a new Organization
- [ ] Invite an alias of your email to the Organization in the "Members" tab
- [ ] Enable Just-in-Time (JIT) Provisioning for your work email domain in the "Settings" tab, and set an Automatic Role Assignment to have all users from that domain automatically be assigned the Admin Role
- [ ] In the [Roles & Permissions](https://stytch.com/dashboard/rbac) tab of the Stytch Dashboard, create a new `limited_admin` Role with the `update.info.name` and `update.info.slug` permissions for the `stytch.organization` Resource and log in as a Member with that Role. See how the Settings UI adjusts to account for their more limited permissions
- [ ] Set up Enterprise SSO in the "SSO" tab (if you don't have admin access to a workforce IdP, you can create an [Okta Workforce Identity Cloud Developer Account](https://developer.okta.com/signup/) to test)
- [ ] Configure SCIM provisioning in the "SCIM" tab and provision users individually or by groups. Create an automatic role assignment for a specific IdP group in the "Settings" tab

# Next Steps

This example app showcases a small portion of what you can accomplish with Stytch. Next, explore adding additional login methods, such as [OAuth](https://stytch.com/docs/b2b/guides/oauth/initial-setup) or [SSO](https://stytch.com/docs/b2b/guides/sso/initial-setup).

# :question: Need support?

Come join our [Slack community](https://stytch.com/docs/resources/support/overview) to speak directly with a Stytch auth expert!
