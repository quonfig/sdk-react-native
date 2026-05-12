# Changelog

## 0.0.1

- Initial release. Thin polyfill wrapper around `@quonfig/react` for React Native. Installs
  `react-native-get-random-values` (needed by the `uuid` dependency inside `@quonfig/javascript`)
  and the `base-64` `btoa` / `atob` shims (needed by the SDK's base64 helper which assumes
  `window.btoa` when `typeof window !== "undefined"`, including under React Native).
