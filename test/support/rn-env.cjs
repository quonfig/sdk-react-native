// React Native emulation for the real-stack tests (qfg-6vno.18).
//
// Unlike polyfill.test.cjs, nothing from the Quonfig stack is stubbed here:
// the built @quonfig/react-native loads the real @quonfig/react, the real
// @quonfig/javascript and the real react-native-get-random-values. Only the
// pieces of the RN runtime that plain Node lacks are faked:
//   - `react-native` itself (NativeModules for the random-values native module)
//   - `window = globalThis`, no `localStorage` (RN has neither DOM nor storage)
//   - `fetch`, routed per URL so a test can play the delivery and telemetry
//     servers.

const Module = require("node:module");

const REACT_NATIVE_STUB = {
  NativeModules: {
    RNGetRandomValues: {
      getRandomBase64(byteLength) {
        return require("node:crypto").randomBytes(byteLength).toString("base64");
      },
    },
  },
};

let installed = false;

function installReactNativeStub() {
  if (installed) return;
  installed = true;
  const origResolve = Module._resolveFilename;
  const origLoad = Module._load;
  Module._resolveFilename = function (request, ...rest) {
    if (request === "react-native") return "STUB:react-native";
    return origResolve.call(this, request, ...rest);
  };
  Module._load = function (request, ...rest) {
    if (request === "react-native" || request === "STUB:react-native") return REACT_NATIVE_STUB;
    return origLoad.call(this, request, ...rest);
  };
}

function installRnGlobals() {
  installReactNativeStub();
  globalThis.window = globalThis;
  // Node 22+ may expose a Web Storage `localStorage`; RN has none.
  Object.defineProperty(globalThis, "localStorage", {
    value: undefined,
    configurable: true,
    writable: true,
  });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
}

// Decode the context segment of an eval-with-context URL back to its JSON text.
function contextFromUrl(url) {
  const m = /\/eval-with-context\/([^?]+)/.exec(url);
  if (!m) return "";
  return Buffer.from(decodeURIComponent(m[1]), "base64").toString("utf8");
}

function evalResponse(values) {
  const evaluations = {};
  for (const [key, value] of Object.entries(values)) {
    evaluations[key] = { value: { type: typeof value === "boolean" ? "bool" : "string", value } };
  }
  return new Response(JSON.stringify({ evaluations }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

// Installs a fetch mock. `onEval(url, ctxJson)` returns a Response (or throws /
// rejects to simulate delivery being down). Telemetry POSTs are recorded.
function installFetch(onEval) {
  const calls = { eval: [], telemetry: [] };
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.includes("/api/v1/telemetry")) {
      calls.telemetry.push({ url, body: JSON.parse(String(init.body)) });
      return new Response("{}", { status: 200 });
    }
    if (url.includes("/eval-with-context/")) {
      calls.eval.push(url);
      return onEval(url, contextFromUrl(url));
    }
    throw new Error(`unexpected fetch in test: ${url}`);
  };
  return calls;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Polls `predicate` inside act() so React flushes state between checks.
async function waitFor(act, predicate, { timeout = 3000, label = "condition" } = {}) {
  const deadline = Date.now() + timeout;
  for (;;) {
    let ok = false;
    await act(async () => {
      await sleep(10);
    });
    try {
      ok = predicate();
    } catch {
      ok = false;
    }
    if (ok) return;
    if (Date.now() > deadline) throw new Error(`timed out waiting for ${label}`);
  }
}

module.exports = { installRnGlobals, installFetch, evalResponse, contextFromUrl, sleep, waitFor };
