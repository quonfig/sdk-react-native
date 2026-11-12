// Guards the README guidance that this wrapper's correctness depends on
// (qfg-goi1.2.10). The polyfills in src/index.ts only take effect if this
// package is evaluated before @quonfig/react / @quonfig/javascript, Yarn does
// not auto-install the @quonfig/javascript peer, and polling is opt-in.

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const readme = fs.readFileSync(path.join(__dirname, "..", "README.md"), "utf8");

test("every install line includes the @quonfig/javascript peer", () => {
  const installLines = readme
    .split("\n")
    .filter((line) => /^(npm install|yarn add) @quonfig\/react-native\b/.test(line));
  assert.equal(installLines.length, 2, "expected one npm and one yarn install line");
  for (const line of installLines) {
    assert.match(
      line,
      /\s@quonfig\/javascript(@\S+)?(\s|$)/,
      `missing @quonfig/javascript: ${line}`
    );
  }
});

// The wrapper peers on @quonfig/react ^1.6.0. An unpinned install resolves
// @quonfig/react 2.x, outside that range, so the README pins both peers to ^1.
test("install lines pin @quonfig/react and @quonfig/javascript to ^1", () => {
  const installLines = readme
    .split("\n")
    .filter((line) => /^(npm install|yarn add) @quonfig\/react-native\b/.test(line));
  for (const line of installLines) {
    assert.match(line, /\s@quonfig\/react@\^1(\s|$)/, `@quonfig/react not pinned to ^1: ${line}`);
    assert.match(
      line,
      /\s@quonfig\/javascript@\^1(\s|$)/,
      `@quonfig/javascript not pinned to ^1: ${line}`
    );
  }
});

const has = (needle, what) => assert.ok(readme.includes(needle), `README ${what}: ${needle}`);

test("documents the import-order rule", () => {
  has("## Import order", "is missing the section");
  has('import "@quonfig/react-native";', "does not show the entry-file import");
  has("never from `@quonfig/react`", "does not forbid importing from @quonfig/react");
});

test("points to pollInterval", () => {
  has("`pollInterval`", "never mentions");
  has("https://docs.quonfig.com/docs/sdks/react-native#", "does not link the docs page");
});
