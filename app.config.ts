import "dotenv/config";
import { ExpoConfig } from "@expo/config";

export default (): ExpoConfig => ({
  name: "horas-servico",
  slug: "horas-servico",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon-clipboard-clock-1024.png",
  scheme: "horasservico",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  updates: {
    url: "https://u.expo.dev/6fc4a71d-5da4-45d5-81d1-90ee2cdffc6d",
  },

  runtimeVersion: { policy: "appVersion" },
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: { supportsTablet: true, bundleIdentifier: "com.henrique200.horasservico"},
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-background-1024.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    package: "com.henrique200.horasservico",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: ["expo-router"],
  experiments: { typedRoutes: true },

  extra: {
    eas: {
      projectId: "6fc4a71d-5da4-45d5-81d1-90ee2cdffc6d",
    },

    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  },
});
