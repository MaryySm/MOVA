# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make.

## Development Servers

- Phone app: `npm.cmd run dev:app` on port 8443
- MOVA Kids simulator: `npm.cmd run dev:wearable` on port 8444
- Both servers support hot reload.

## Project Structure

This is the canonical project structure. Keep presentation, application logic, and data structures in their respective folders.

- `src/main.tsx` - React entrypoint; selects the phone or wearable view using the Vite mode
- `src/App.tsx` - Compatibility exports for the phone app and MOVA Kids view
- `src/views/` - Screen components, shared UI, and visual design tokens
- `src/controllers/` - React state hooks, navigation, validation, and local persistence; no JSX or styling
- `src/models/` - Shared TypeScript types and default data structures
- `src/views/PhoneApp.tsx` - Phone navigation and screen composition
- `src/views/screens/` - One file per phone screen
- `src/views/wearable/` - Standalone MOVA Kids simulator screens
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
