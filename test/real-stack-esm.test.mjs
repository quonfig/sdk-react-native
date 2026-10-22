// ESM build over the real stack (qfg-6vno.18).
//
// RN has neither `btoa`/`atob` (on older Hermes) nor Node's `Buffer`, so the
// only base64 encoder upstream can find is the one this package installs.
// ESM evaluates `export * from "@quonfig/react"` before this package's own
// polyfill block, so this proves the polyfill is in place by the time the
// upstream SDK first encodes a context, not merely by the time it loads.

import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createRequire, register } from "node:module";

const require = createRequire(import.meta.url);
const env = require("./support/rn-env.cjs");

// `base-64` is a UMD/CJS file whose named exports Node's CJS lexer cannot
// see, so Node's own ESM loader rejects `import { encode, decode } from
// "base-64"` (Metro and other bundlers do the interop). Serve the real
// `base-64` through a tiny ESM facade so the ESM build can load under Node.
const base64Path = require.resolve("base-64");
const facade =
  "data:text/javascript," +
  encodeURIComponent(
    `import { createRequire } from "node:module";` +
      `const b = createRequire(${JSON.stringify(base64Path)})(${JSON.stringify(base64Path)});` +
      `export const encode = b.encode; export const decode = b.decode; export default b;`
  );
register(
  "data:text/javascript," +
    encodeURIComponent(
      `export async function resolve(specifier, context, next) {` +
        `if (specifier === "base-64") return { url: ${JSON.stringify(facade)}, shortCircuit: true };` +
        `return next(specifier, context);` +
        `}`
    )
);

env.installRnGlobals();

const savedBuffer = globalThis.Buffer;
delete globalThis.btoa;
delete globalThis.atob;

const React = (await import("react")).default;
const { act, create } = (await import("react-test-renderer")).default;

// Hide Buffer while the package loads and the provider encodes its first
// context (restored in the fetch mock), so upstream has no fallback encoder.
globalThis.Buffer = undefined;
const rn = await import("../dist/index.mjs");

after(() => {
  globalThis.Buffer = savedBuffer;
  return rn.quonfig?.close?.().catch(() => {});
});

test("ESM build installs btoa/atob before upstream encodes the context", async () => {
  assert.equal(typeof globalThis.btoa, "function", "btoa polyfilled");
  assert.equal(typeof globalThis.atob, "function", "atob polyfilled");

  const urls = [];
  let bufferHiddenAtEncode = false;
  globalThis.fetch = async (input) => {
    const url = typeof input === "string" ? input : input.url;
    urls.push(url);
    // The URL (and so the context encoding) is built before fetch is called.
    // Node's own Response/JSON plumbing needs Buffer back from here on.
    bufferHiddenAtEncode = globalThis.Buffer === undefined;
    globalThis.Buffer = savedBuffer;
    return new Response(
      JSON.stringify({ evaluations: { esm: { value: { type: "string", value: "yes" } } } }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  };

  const out = {};
  const errors = [];
  function Probe() {
    const q = rn.useQuonfig();
    out.value = q.loading ? "loading" : String(q.get("esm") ?? "default");
    return null;
  }
  let root;
  await act(async () => {
    root = create(
      React.createElement(
        rn.QuonfigProvider,
        {
          sdkKey: "rn-test-key",
          contextAttributes: { user: { key: "rn-esm", name: "Zoë" } },
          logger: { warn() {}, error() {}, info() {}, debug() {} },
          onError: (e) => errors.push(e),
        },
        React.createElement(Probe)
      )
    );
  });
  await env.waitFor(act, () => out.value === "yes", { label: "esm value" });
  assert.deepEqual(errors, []);
  assert.equal(bufferHiddenAtEncode, true, "context was encoded with Buffer unavailable");
  const ctx = env.contextFromUrl(urls.find((u) => u.includes("/eval-with-context/")));
  assert.match(ctx, /rn-esm/);
  assert.match(ctx, /Zoë/, "UTF-8 context round-trips through the polyfilled btoa");
  await act(async () => root.unmount());
});
