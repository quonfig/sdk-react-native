import "react-native-get-random-values";
// base-64 is CommonJS: Node's native ESM loader can't see its named exports,
// so default-import it (bundlers like Metro handle either form) — qfg-zz1c.
import base64 from "base-64";

const { decode, encode } = base64;

if (typeof global.btoa === "undefined") {
  global.btoa = encode;
}
if (typeof global.atob === "undefined") {
  global.atob = decode;
}

export * from "@quonfig/react";
