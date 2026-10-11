This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- File names use **kebab-case** (e.g. `ColorPicker.tsx` → `color-picker.tsx`, `useSettings.ts` → `use-settings.ts`). Exported identifiers keep their normal casing (`ColorPicker`, `useSettings`).
- Components are arrow functions typed with `React.FC<Props>` (`import type React from 'react'`): `export const Toggle: React.FC<Props> = (props) => { ... }`. No `function` declarations for components.
- A props type used only inside its own component file is named just `Props` (not `ToggleProps`). Only export a longer name when other files need it.
- A component that wraps a React Native primitive extends that primitive's props (`interface Props extends SwitchProps`) and spreads the rest onto it, so callers keep the full native API. Re-declare props as required in `Props` only where the wrapper needs them.
- Styling uses **react-native-unistyles** (v3): `import { StyleSheet } from 'react-native-unistyles'` and `StyleSheet.create((theme) => ({ ... }))` instead of React Native's `StyleSheet`. Colors, type, radii and spacing come from the theme, not hard-coded values. Read the docs before writing setup or theme code: https://www.unistyl.es/v3/start/introduction
- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- This project runs on a **development build** (`expo-dev-client`), not Expo Go. After adding or updating a library with native code, changing `app.json`, or upgrading the SDK, rebuild: `npx expo run:ios|android` locally, or `eas build --profile development` (`development-simulator` for iOS Simulator). Native libraries outside Expo Go are fine to use.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
