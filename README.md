## Stytch B2B MCP Demo

### Overview

This Next.js App Router project demonstrates how to combine Stytch's B2B prebuilt components with custom experiences orchestrated through the Model Context Protocol (MCP).

Key pieces of the demo include:

- Stytch B2B Discovery login rendered with `@stytch/nextjs`
- The Admin Portal UI components – members, organization settings, SSO, and SCIM
- A headless organization switcher that calls the Stytch session exchange API
- A collaborative notes workspace backed by Neon/Postgres, exposed via an MCP server

### Architecture Snapshot

- **Front end**: Next.js App Router with client-side Stytch hooks and server actions.
- **Auth**: Stytch Discovery, plus session exchange for switching organizations and MCP token introspection.
- **Notes feature**: CRUD API routes backed by Postgres (Neon). Notes are scoped to the active organization and stored via `lib/NotesService`.
- **MCP integration**: `src/app/mcp/route.ts` hosts a Model Context Protocol server that exposes notes as MCP resources and tools so AI agents can read and write within the authenticated context.
- **UI**: Tailwind-based dashboard with `AppSidebar`, `NotesEditor`, and Admin Portal embeds.

### Prerequisites

- Node.js 18+
- Neon Postgres account (for persistence)
- Stytch B2B project with MCP enabled

### Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file and set the required environment variables. Note you can omit the DB for testing, the notes functionality won't work but you can test the auth features.

   ```env
   STYTCH_PROJECT_ID=project-live-or-test-id
   STYTCH_SECRET=b2b-secret
   NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN=public-token
   STYTCH_DOMAIN=https://test.stytch.com
   DATABASE_URL=postgres://...
   DATABASE_URL_UNPOOLED=postgres://...
   ```

   The `scripts/setup-dev-branch.js` helper expects Neon CLI authentication and will append connection strings to `.env.local` when run.

3. Initialize your database schema (creates the `notes` table):

   ```bash
   npm run migrate
   ```

   If you plan to demo without persistence, you can skip this step; the app detects a missing `DATABASE_URL` and disables note creation while keeping the rest of the UI functional.

4. Start the development server:

   ```bash
   npm run dev
   ```

   The app runs at http://localhost:3000.

### Demo Flow Highlights

- Log in with email magic links, OAuth, or SSO. Discovery returns all memberships tied to the email.
- Use the left rail to navigate dashboard content, members, org settings, SSO, and SCIM screens powered by the Admin Portal SDK.
- The organization switcher shows all discovered orgs and can create a new org via the modal. Creation hits the `/api/organizations/create` route, then exchanges the session to the new org.
- Notes in the sidebar and editor are organization-scoped. Switching orgs clears caches and reloads relevant notes when a database is configured; without a database the feature gracefully degrades to read-only messaging.
- The MCP endpoint (`/mcp`) exposes each note as an MCP resource and provides tools for create/update/delete so AI assistants can collaborate on shared notes (requires a database connection).

### MCP Usage

To interact with the MCP server you need an OAuth access token minted for the member. The `/mcp` route uses `withMcpAuth` to introspect the token via Stytch and map the subject + organization into the Notes service. Tools available include `createNote`, `updateNote`, `searchNotes`, and `deleteNote`.

### Scripts

- `npm run migrate` – Run database migration script (idempotent table creation for notes).
- `npm run setup-dev` – Optional Neon helper that creates a personal Postgres branch, writes connection strings to `.env.local`, and runs the migration.

### Production Considerations

- Replace the sample environment values with secrets from your Stytch project and managed database.
- Restrict Admin Portal permissions by assigning custom roles in your Stytch dashboard.

### Support

Need help? Reach us via the [Stytch Slack community](https://stytch.com/docs/resources/support/overview) or your Stytch solutions engineer.
