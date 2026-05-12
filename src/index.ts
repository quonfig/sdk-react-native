import "react-native-get-random-values";
import { decode, encode } from "base-64";

if (typeof global.btoa === "undefined") {
  global.btoa = encode;
}
if (typeof global.atob === "undefined") {
  global.atob = decode;
}

export * from "@quonfig/react";
