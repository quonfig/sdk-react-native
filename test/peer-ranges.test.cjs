// Peer-range compatibility check (qfg-6vno.18; regression guard for qfg-obhe).
//
// Every package this one installs into an app (`dependencies`) or requires
// beside it (`peerDependencies`) may itself peer on react / react-native. If
// such a peer range does not cover the whole range WE declare, an app that
// satisfies our declared floor gets a broken install: e.g.
// react-native-get-random-values 2.0.0 peers on react-native >=0.81 while we
// declare react-native >=0.70 (qfg-obhe). Yarn only reports that as YN0002
// "doesn't provide react-native", which it also prints for every healthy
// install here (react-native is never installed in this repo), so it cannot
// gate CI. This check compares the ranges directly.

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const semver = require("semver");

const pkg = require("../package.json");

function peerRangeViolations(ourPeers, manifests) {
  const violations = [];
  for (const dep of manifests) {
    for (const [peer, theirRange] of Object.entries(dep.peerDependencies || {})) {
      const ourRange = ourPeers[peer];
      if (!ourRange) continue;
      if (!semver.subset(ourRange, theirRange)) {
        violations.push(
          `${dep.name}@${dep.version} peers on ${peer} "${theirRange}", ` +
            `which does not cover our declared ${peer} "${ourRange}"`
        );
      }
    }
  }
  return violations;
}

// Read from disk: some packages (e.g. @quonfig/react) do not export
// ./package.json, so require("<name>/package.json") would throw.
function installedManifest(name) {
  const file = path.join(__dirname, "..", "node_modules", name, "package.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

test("installed dependencies accept every version of our declared peer ranges", () => {
  const names = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}).filter((n) => n !== "react-native"),
  ];
  const manifests = names.map(installedManifest);
  assert.deepEqual(peerRangeViolations(pkg.peerDependencies, manifests), []);
});

test("flags a dependency whose peer range excludes our react-native floor (qfg-obhe shape)", () => {
  const violations = peerRangeViolations({ "react-native": ">=0.70" }, [
    {
      name: "react-native-get-random-values",
      version: "2.0.0",
      peerDependencies: { "react-native": ">=0.81" },
    },
  ]);
  assert.equal(violations.length, 1);
  assert.match(violations[0], /react-native-get-random-values@2\.0\.0/);
});
