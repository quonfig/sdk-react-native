# @quonfig/react-native

React Native bindings for [Quonfig](https://quonfig.com).

This package is a thin polyfill wrapper around
[`@quonfig/react`](https://github.com/quonfig/sdk-react). It installs the two web APIs the
underlying JavaScript SDK assumes but React Native's JS runtime is missing (`crypto.getRandomValues`
and `btoa` / `atob`), then re-exports the entire `@quonfig/react` public API. If you need a feature
that the React SDK does not yet expose to React Native, open an issue.

## Install

```bash
npm install @quonfig/react-native @quonfig/react @quonfig/javascript base-64 react-native-get-random-values
# or
yarn add @quonfig/react-native @quonfig/react @quonfig/javascript base-64 react-native-get-random-values
```

`@quonfig/react` and `@quonfig/javascript` are peer dependencies. npm 7+ installs peers for you, but
Yarn does not, so list them explicitly. TypeScript types are included.

## Import order

The polyfills only help if they are installed before `@quonfig/javascript` loads, because that
package creates its client (and calls `crypto.getRandomValues()`) as soon as it is imported. So:

1. Import `@quonfig/react-native` once at your app entry (`index.js`), before anything else:

   ```js
   // index.js
   import "@quonfig/react-native";
   import { AppRegistry } from "react-native";
   import App from "./App";

   AppRegistry.registerComponent("MyApp", () => App);
   ```

2. Import hooks and components from `@quonfig/react-native`, never from `@quonfig/react`. This
   applies to the `@quonfig/react` examples linked below too.

If `@quonfig/react` or `@quonfig/javascript` is evaluated first, the app can crash at startup with
`crypto.getRandomValues() not supported`.

## Usage

Identical to [`@quonfig/react`](https://github.com/quonfig/sdk-react#usage) — wrap your component
tree in `QuonfigProvider` and read flags with `useQuonfig`:

```tsx
import { QuonfigProvider, useQuonfig } from "@quonfig/react-native";

const App = () => (
  <QuonfigProvider
    sdkKey="YOUR_SDK_KEY"
    contextAttributes={{ user: { email: "jeffrey@example.com" } }}
    onError={(err) => console.error(err)}
  >
    <Logo />
  </QuonfigProvider>
);

const Logo = () => {
  const { isEnabled } = useQuonfig();
  return isEnabled("new-logo") ? <NewLogo /> : <OldLogo />;
};
```

See the [`@quonfig/react` README](https://github.com/quonfig/sdk-react#readme) for the full API
(`useQuonfig`, `useFlag`, `QuonfigTestProvider`, etc.) and provider prop reference.

Without polling, flags are fetched only when the provider mounts or its `contextAttributes` change.
To pick up flag changes while the app stays open, pass a `pollInterval` (in milliseconds) to
`QuonfigProvider`; see
[Initialize the Client](https://docs.quonfig.com/docs/sdks/react-native#initialize-the-client).

## How the polyfills work

The entry point is ten lines:

```ts
import "react-native-get-random-values";
import { decode, encode } from "base-64";

if (typeof global.btoa === "undefined") {
  global.btoa = encode;
}
if (typeof global.atob === "undefined") {
  global.atob = decode;
}

export * from "@quonfig/react";
```

- **`react-native-get-random-values`** polyfills `crypto.getRandomValues()`, which the `uuid`
  package (used by `@quonfig/javascript` to generate the per-instance hash) requires.
- **`base-64`** provides `btoa` / `atob`. `@quonfig/javascript`'s base64 helper assumes `btoa` is
  available whenever `typeof window !== "undefined"`, which is true under React Native — but RN's JS
  runtime does not ship `btoa` natively.

## Failover behavior on React Native

`@quonfig/react-native` inherits the secondary-delivery failover from `@quonfig/react` /
`@quonfig/javascript`, but one piece does not carry over to React Native:

- **Works on RN:** the reject-older install guard (spec §5f), the parallel hedged loader (spec §5e,
  tunable via the `hedgeDelay` provider prop), and automatic primary → secondary failover. These are
  pure JS with no browser-storage dependency.
- **Inert on RN — the last-known-good (LKG) cache (spec §5h).** The LKG cache the browser SDK uses
  to survive a total outage across page loads is backed by `localStorage`, which React Native's
  Hermes engine does not provide. `@quonfig/javascript` guards every access and silently no-ops when
  `localStorage` is absent, so nothing breaks — but on RN the cache never persists and never serves.
  A returning app launch during a simultaneous primary+secondary outage falls back to defaults
  rather than the last-known-good config. (An `AsyncStorage`-backed adapter is a possible future
  enhancement; it is non-trivial because the cache read path is synchronous while `AsyncStorage` is
  async — tracked in qfg-41nh.28.)

## License

ISC
