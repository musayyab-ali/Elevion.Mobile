/**
 * Expo configuration. app.json holds the static settings; this file adds the one thing that depends on the environment:
 * plain-http traffic is only allowed while the API address is http://. As soon as EXPO_PUBLIC_API_URL starts with https://
 * the Android "cleartext traffic" flag and the iOS "arbitrary loads" exception are switched off by themselves.
 */
const base = require("./app.json").expo;

module.exports = () => {
  const apiUrl = (process.env.EXPO_PUBLIC_API_URL || "").trim();
  const allowInsecure = !apiUrl.startsWith("https://");

  return {
  ...base,
  ios: {
    ...base.ios,
    infoPlist: {
      ...(base.ios && base.ios.infoPlist),
      NSAppTransportSecurity: allowInsecure ? { NSAllowsArbitraryLoads: true } : undefined,
    },
  },
  android: {
    ...base.android,
    usesCleartextTraffic: allowInsecure,
  },
  plugins: (base.plugins || []).map((plugin) =>
    Array.isArray(plugin) && plugin[0] === "expo-build-properties"
      ? ["expo-build-properties", { android: { usesCleartextTraffic: allowInsecure } }]
      : plugin,
  ),
  };
};
