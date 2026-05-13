// Smoke test for @quonfig/react-native polyfill behavior.
//
// This SDK is a thin polyfill wrapper around @quonfig/react. The only logic
// it owns is:
//   1. ensure `react-native-get-random-values` is loaded (for crypto)
//   2. polyfill global.btoa / global.atob from `base-64` if missing
//   3. re-export everything from @quonfig/react
//
// Both `react-native-get-random-values` and `@quonfig/react` are
// React-Native-only and don't load cleanly under plain Node, so we intercept
// Module._resolveFilename + _load to substitute test stubs.

const { test } = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");

const STUBS = {
  "react-native-get-random-values": {},
  "@quonfig/react": { __quonfigReactSentinel: true },
};

const origResolve = Module._resolveFilename;
const origLoad = Module._load;

Module._resolveFilename = function (request, parent, ...rest) {
  if (Object.prototype.hasOwnProperty.call(STUBS, request)) {
    return "STUB:" + request;
  }
  return origResolve.call(this, request, parent, ...rest);
};

Module._load = function (request, parent, ...rest) {
  if (request.startsWith("STUB:")) {
    return STUBS[request.slice("STUB:".length)];
  }
  if (Object.prototype.hasOwnProperty.call(STUBS, request)) {
    return STUBS[request];
  }
  return origLoad.call(this, request, parent, ...rest);
};

test("polyfills global.btoa and global.atob when missing", () => {
  const prevBtoa = global.btoa;
  const prevAtob = global.atob;
  delete global.btoa;
  delete global.atob;

  const builtPath = require.resolve("../dist/index.cjs");
  delete require.cache[builtPath];
  require(builtPath);

  assert.equal(typeof global.btoa, "function", "btoa should be installed");
  assert.equal(typeof global.atob, "function", "atob should be installed");

  // Round-trip a string to prove the base-64 wiring is real, not a stub.
  const encoded = global.btoa("quonfig");
  const decoded = global.atob(encoded);
  assert.equal(decoded, "quonfig");

  if (prevBtoa) global.btoa = prevBtoa;
  else delete global.btoa;
  if (prevAtob) global.atob = prevAtob;
  else delete global.atob;
});

test("re-exports from @quonfig/react", () => {
  const builtPath = require.resolve("../dist/index.cjs");
  delete require.cache[builtPath];
  const mod = require(builtPath);
  assert.equal(
    mod.__quonfigReactSentinel,
    true,
    "expected the sentinel export from the stubbed @quonfig/react to be re-exported"
  );
});
