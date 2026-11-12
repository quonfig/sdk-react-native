// The ./testing subpath re-exports @quonfig/react/testing (qfg-kqf8i), so React Native
// tests can import QuonfigTestProvider without reaching past this wrapper.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const pkg = require("../package.json");
const env = require("./support/rn-env.cjs");

env.installRnGlobals();

test("package.json exports a ./testing subpath", () => {
  const entry = pkg.exports["./testing"];
  assert.ok(entry, "missing exports['./testing']");
  assert.equal(entry.require, "./dist/testing.cjs");
  assert.equal(entry.import, "./dist/testing.mjs");
  assert.equal(entry.types, "./dist/testing.d.ts");
});

test("peers on @quonfig/react ^2", () => {
  assert.equal(pkg.peerDependencies["@quonfig/react"], "^2.0.0");
});

test("the CJS testing build exposes QuonfigTestProvider and installs the polyfills", () => {
  delete global.btoa;
  delete global.atob;
  const testing = require("../dist/testing.cjs");
  assert.equal(typeof testing.QuonfigTestProvider, "function");
  assert.equal(typeof global.btoa, "function");
});

test("the root entry no longer exports QuonfigTestProvider (matches @quonfig/react 2)", () => {
  const rn = require("../dist/index.cjs");
  assert.equal(rn.QuonfigTestProvider, undefined);
  assert.equal(typeof rn.QuonfigProvider, "function");
});
