# Bidder Frontend

- React, TypeScript, and Vite frontend for managing seller profiles, campaigns, policies, schedules, and logs.

## Stack

- `React`: UI composition.
- `React Router`: route handling and auth-gated pages.
- `React Bootstrap` and `Bootstrap`: shared UI primitives and layout styling.
- `TypeScript`: static typing across the app.
- `Vite`: development server and production build tooling.

## Scripts

- `npm install`: install dependencies.
- `npm run dev`: start the local development server.
- `npm run build`: run the TypeScript build and create a production bundle.
- `npm run preview`: preview the production build locally.
- `npm run lint`: run ESLint over the source files.

## Source Libraries

- `src/api`
  - API clients, request helpers, auth integration, request contracts, DTO types, and mapping utilities.
- `src/components`
  - Root components
    - Shared UI building blocks such as `Modal`, `PageToolbar`, `CenteredContainer`, and `ProductsList`.
  - `Home`
    - Home-page-specific controls.
  - `Lists`
    - Campaign, policy, and log list views, plus related modals and row helpers.
  - `Policies`
    - Policy creation/editing modals, policy display elements, and shared policy-editor logic.
  - `Rules`
    - Nested and script rule editors, editor state, and rule-tree utilities.
  - `Schedules`
    - Schedule table and schedule-creation form components.
  - `auth`
    - Authentication form components, redirects, and logout helpers.
  - `buttons`
    - Reusable action buttons such as create, edit, delete, and navigation controls.
  - `icons`
    - Shared icon components and SVG path definitions.
- `src/pages`
  - Route-level pages such as home, policies, schedules, login, register, help, and not-found.
- `src/transpilation`
  - Shared rule-editor types and transpilation-related helpers.
- `src/App.tsx`
  - Top-level route configuration.
- `src/main.tsx`
  - Application entry point.
- `src/theme.css`
  - Global theme and shared styling overrides.

## Routes

- `/`: authenticated home page.
- `/policies`: authenticated policy management page.
- `/schedules`: authenticated schedule management page.
- `/help`: authenticated help page.
- `/login`: login page.
- `/register`: registration page.
