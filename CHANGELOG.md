# Changelog

## 0.0.3 - 2026-05-14

- CI / tooling only — no functional or public API changes. Made the release workflow's test gate
  real by adding a polyfill smoke test (`test/polyfill.test.cjs`) and switching the `test` script to
  an explicit file path for Node 20 compatibility. Bumped GitHub Actions dependencies:
  `actions/checkout` 3.6.0 → 6.0.2, `actions/cache` 4.3.0 → 5.0.5, `actions/setup-node` 4.4.0 →
  6.4.0.

## 0.0.2 - 2026-05-13

- First version published to npm. No functional changes from `0.0.1`. Version bumped solely to
  exercise the GitHub Actions release workflow + npm OIDC trusted-publishing path after the npm-side
  trusted-publisher configuration was added for `@quonfig/react-native`.

## 0.0.1 - 2026-05-12

- Internal-only initial commit; never published to npm. The release workflow attempted the publish
  but the OIDC token exchange failed (npm trusted publisher not yet configured for this brand-new
  package). Functionally identical to `0.0.2`. The package is a thin polyfill wrapper around
  `@quonfig/react` for React Native: installs `react-native-get-random-values` (needed by the `uuid`
  dependency inside `@quonfig/javascript`) and the `base-64` `btoa` / `atob` shims (needed by the
  SDK's base64 helper which assumes `window.btoa` when `typeof window !== "undefined"`, including
  under React Native).
