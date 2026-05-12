# @quonfig/react-native

React Native bindings for [Quonfig](https://quonfig.com).

This package is a thin polyfill wrapper around
[`@quonfig/react`](https://github.com/quonfig/sdk-react). It installs the two web APIs the
underlying JavaScript SDK assumes but React Native's JS runtime is missing (`crypto.getRandomValues`
and `btoa` / `atob`), then re-exports the entire `@quonfig/react` public API. If you need a feature
that the React SDK does not yet expose to React Native, open an issue.

## Install

```bash
npm install @quonfig/react-native @quonfig/react base-64 react-native-get-random-values
# or
yarn add @quonfig/react-native @quonfig/react base-64 react-native-get-random-values
```

TypeScript types are included.

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

## License

ISC
