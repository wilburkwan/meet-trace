import { defineConfig } from "wxt";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import pkg from "./package.json";

const version = (process.env.VERSION || pkg.version).replace(/^v/, "");
const contentAppId = `meettrace-app-${randomUUID()}`;

export default defineConfig({
  srcDir: "src",
  // Build to dist/ (not the hidden .output/) so "Load unpacked" is easy to find.
  outDir: "dist",
  // dist/meet-trace for builds, dist/meet-trace-dev for `pnpm dev`.
  outDirTemplate: "meet-trace{{modeSuffix}}",
  entrypointsDir: "entries",
  publicDir: "public",
  hooks: {
    // Ship the MIT license notice inside the extension, as the license requires.
    "build:publicAssets": (_wxt, assets) => {
      assets.push({ absoluteSrc: resolve("LICENSE"), relativeDest: "LICENSE.txt" });
    },
  },
  vite: () => ({
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@live": fileURLToPath(
          new URL("./src/entries/live.content", import.meta.url)
        ),
      },
    },
    define: {
      __MEETTRACE_APP_ID__: JSON.stringify(contentAppId),
    },
  }),
  manifest: {
    name: "Meet Trace",
    description: "Live captions with free on-device translation for Google Meet and Microsoft Teams, plus meeting history and YouTube transcripts.",
    version,
    // tabCapture + offscreen record meeting audio; downloads saves it to disk.
    permissions: ["storage", "unlimitedStorage", "activeTab", "clipboardWrite", "tabCapture", "offscreen", "downloads"],
    host_permissions: [
      "https://meet.google.com/*",
      "https://teams.cloud.microsoft/*",
      "https://teams.live.com/*",
      "https://teams.microsoft.com/*",
      "https://*.youtube.com/*",
      "https://youtube.com/*",
    ],
    icons: {
      16: "logo-16.png",
      32: "logo-32.png",
      48: "logo-48.png",
      128: "logo-128.png",
    },
    action: {
      default_title: "Meet Trace",
      default_icon: {
        16: "logo-16.png",
        32: "logo-32.png",
        48: "logo-48.png",
      },
    },
  },
});
