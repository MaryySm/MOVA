# MOVA frontend structure

The frontend is split into three layers:

- `models/` defines shared types and initial data for profiles, planning, navigation, and MOVA Kids.
- `controllers/` contains React state hooks and application logic. Profile storage lives in `profileController.ts`.
- `views/` contains the visual screens and reusable interface components. Keep JSX and styling here.
- Each screen's `*.styles.css` file contains its visual rules; JSX supplies changing values through `styleVars.ts` CSS variables.
- `index.css` contains only global browser styles, fonts, and Tailwind CSS setup.

`views/PhoneApp.tsx` composes the phone screens. The Vite `app` mode mounts it on port 8443; the `wearable` mode mounts `views/wearable/WearableOnly.tsx` on port 8444.
