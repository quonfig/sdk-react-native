// Real-stack provider tests for @quonfig/react-native (qfg-6vno.18).
//
// Loads the built CJS package over the REAL @quonfig/react and
// @quonfig/javascript in an RN-shaped runtime (see support/rn-env.cjs) and
// drives QuonfigProvider through a mocked delivery server.

const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const env = require("./support/rn-env.cjs");

env.installRnGlobals();

const React = require("react");
const { act, create } = require("react-test-renderer");
const rn = require("../dist/index.cjs");

const h = React.createElement;

function Probe({ flagKey, out }) {
  const q = rn.useQuonfig();
  out.loading = q.loading;
  out.isReady = q.isReady;
  out.value = q.loading ? "loading" : String(q.get(flagKey) ?? "default");
  return null;
}

function mount(props, flagKey) {
  const out = {};
  let root;
  const element = (p) => h(rn.QuonfigProvider, p, h(Probe, { flagKey, out }));
  return {
    out,
    async render() {
      await act(async () => {
        root = create(element(props));
      });
    },
    async update(next) {
      props = { ...props, ...next };
      await act(async () => {
        root.update(element(props));
      });
    },
    async unmount() {
      await act(async () => {
        root.unmount();
      });
    },
  };
}

const quiet = { warn() {}, error() {}, info() {}, debug() {} };

after(() => {
  // The client singleton's timers must not keep the process alive.
  return rn.quonfig?.close?.().catch(() => {});
});

test("re-exports the real @quonfig/react surface", () => {
  assert.equal(typeof rn.QuonfigProvider, "function");
  assert.equal(typeof rn.useQuonfig, "function");
});

test("boots with delivery down, then recovers once delivery is back (qfg-9p4i.5)", async () => {
  let down = true;
  const calls = env.installFetch(async () => {
    if (down) throw new Error("network down");
    return env.evalResponse({ "boot-flag": "LIVE" });
  });
  const errors = [];
  const m = mount(
    {
      sdkKey: "rn-test-key",
      contextAttributes: { user: { key: "rn-offline-boot" } },
      pollInterval: 50,
      initTimeout: 50,
      logger: quiet,
      onError: (e) => errors.push(e),
    },
    "boot-flag"
  );
  await m.render();
  await env.waitFor(act, () => errors.length > 0, { label: "init failure" });
  assert.equal(m.out.value, "default", "serves defaults while delivery is down");
  assert.equal(m.out.isReady, false);
  const fetchesAtFailure = calls.eval.length;

  down = false;
  await env.waitFor(act, () => m.out.value === "LIVE", { label: "recovery to LIVE" });
  assert.ok(calls.eval.length > fetchesAtFailure, "kept fetching after the failed boot");
  assert.equal(m.out.isReady, true);
  await m.unmount();
});

test("context switch serves the new context's values", async () => {
  env.installFetch(async (_url, ctx) => {
    if (ctx.includes("rn-user-a")) return env.evalResponse({ plan: "A" });
    if (ctx.includes("rn-user-b")) return env.evalResponse({ plan: "B" });
    throw new Error(`unexpected context ${ctx}`);
  });
  const m = mount(
    {
      sdkKey: "rn-test-key",
      contextAttributes: { user: { key: "rn-user-a" } },
      logger: quiet,
      onError: () => {},
    },
    "plan"
  );
  await m.render();
  await env.waitFor(act, () => m.out.value === "A", { label: "context A" });
  await m.update({ contextAttributes: { user: { key: "rn-user-b" } } });
  await env.waitFor(act, () => m.out.value === "B", { label: "context B" });
  await m.unmount();
});

test("evaluation telemetry is flushed to the telemetry endpoint on unmount", async () => {
  const calls = env.installFetch(async () => env.evalResponse({ "tele-flag": "on" }));
  const m = mount(
    {
      sdkKey: "rn-test-key",
      contextAttributes: { user: { key: "rn-telemetry" } },
      collectEvaluationSummaries: true,
      logger: quiet,
      onError: () => {},
    },
    "tele-flag"
  );
  await m.render();
  await env.waitFor(act, () => m.out.value === "on", { label: "tele-flag loaded" });
  await m.unmount();
  await env.waitFor(act, () => calls.telemetry.length > 0, { label: "telemetry POST" });
  const sent = JSON.stringify(calls.telemetry.map((c) => c.body));
  assert.match(sent, /tele-flag/, "the evaluation summary names the evaluated key");
});
