# Changelog

## Unreleased

Docs only; no code change, no release required (semver: none).

- README: new "Import order" section. Import `@quonfig/react-native` once at the app entry
  (`index.js`) before anything else, and import hooks from `@quonfig/react-native`, never from
  `@quonfig/react`. Otherwise `@quonfig/javascript` can load before the `crypto.getRandomValues`
  polyfill and crash at startup.
- README: the install lines now include the `@quonfig/javascript` peer, which Yarn does not
  auto-install.
- README: points to the `pollInterval` provider prop; without it, flags are fetched only on mount
  and context change.
- Added `test/readme.test.cjs` to keep that guidance in the README.

## 1.2.0 - 2026-07-08

- **Caveat / correction to the 1.1.0 note:** the last-known-good cache (§5h) inherited from
  `@quonfig/javascript` is **inert under React Native**. It is backed by `localStorage`, which
  Hermes does not provide, so `@quonfig/javascript` silently no-ops the cache (every access is
  guarded) and it never persists or serves on RN. A returning app launch during a simultaneous
  primary+secondary outage falls back to defaults, not the last-known-good config. The other two
  failover pieces — the reject-older install guard (§5f) and the parallel hedged loader (§5e) — are
  pure JS and DO work on RN. Documented in the README's new "Failover behavior on React Native"
  section. An `AsyncStorage`-backed adapter is deferred (non-trivial: the cache read path is
  synchronous while `AsyncStorage` is async) — design captured in qfg-41nh.28.
- **`hedgeDelay` provider prop is available on RN** (inherited from `@quonfig/react`, no code change
  here since this package is `export * from "@quonfig/react"`). See the `@quonfig/react` prop
  reference.
- Bumped the `@quonfig/react` peer + dev dependency to `^1.2.0` (from the `>=1.0.0` range shipped in
  1.1.0). `@quonfig/react` 1.2.0 / `@quonfig/javascript` 1.2.0 are now published; the old loose
  floor could resolve to an incompatible 1.0.x, so this release pins to the current 1.2.0 as part of
  the coordinated frontend release train. Mirrors the `@quonfig/react` 1.2.0 peer bump.

## 1.1.0 - 2026-06-21

- **Inherits secondary-delivery failover from `@quonfig/react` 1.1.0 / `@quonfig/javascript` 1.1.0**
  — the reject-older install guard (§5f), parallel hedged loader (§5e), and last-known-good
  localStorage cache (§5h). This package is `export * from "@quonfig/react"` plus the base-64 /
  crypto polyfills, so the failover behavior is inherited with no code change. No API changes.
- The `@quonfig/react` peer-dependency range is deliberately kept at `>=1.0.0` (already admits
  1.1.0; tightening the floor before `@quonfig/react` 1.1.0 is published would break installs during
  the publish window). Consumers pick up 1.1.0 once published.

## 1.0.0 - 2026-06-06

- **Stable 1.0.0 release.** The Quonfig React Native SDK is now declared stable and tracks
  `@quonfig/react` >= 1.0.0. No API or behavior changes from 0.0.4 — this is a coordinated 1.0.0
  version stamp across the entire Quonfig SDK family.

## 0.0.4 - 2026-05-21

- Reworked the `@quonfig/react` `devDependency` from `portal:../sdk-react` to a published npm range
  so Dependabot's isolated, single-repo npm updater can resolve the dependency tree (qfg-zu8o,
  option A). Removed the now-obsolete "Replace local file/portal dep with npm version for CI" step
  from `test.yml` and `release.yaml`, added a `CONTRIBUTING.md` documenting `yarn link` as the
  local-dev path for testing against an unpublished `../sdk-react`.
- Bumped the `@quonfig/react` `peerDependency` floor `>=0.0.13` → `>=0.0.14` and set the
  `devDependency` to the same `>=0.0.14` range so dev and peer stay consistent.

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
