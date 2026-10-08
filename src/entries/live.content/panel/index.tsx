import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { ContentScriptContext } from "wxt/utils/content-script-context";
import { startChatHistoryCapture } from "@live/chat-capture";
import { getPlatform } from "@live/adapters";
import { THEME_ATTRIBUTE, watchTheme } from "@/core/theme";
import OverlayApp from "./panel-root";

let overlayUi: Awaited<ReturnType<typeof createShadowRootUi<Root>>> | null = null;

export async function createOverlay(ctx: ContentScriptContext): Promise<void> {
  if (overlayUi) return;

  overlayUi = await createShadowRootUi(ctx, {
    name: "meettrace-overlay-host",
    position: "inline",
    anchor: document.body,
    append: "last",
    mode: "open",
    isolateEvents: ["keydown", "keyup", "keypress"],
    onMount(uiContainer) {
      const app = document.createElement("div");
      app.id = __MEETTRACE_APP_ID__;
      // Follow the colour theme chosen on the settings page
      watchTheme((theme) => app.setAttribute(THEME_ATTRIBUTE, theme));
      uiContainer.appendChild(app);

      const root = createRoot(app);
      root.render(
        <StrictMode>
          <OverlayApp />
        </StrictMode>
      );
      return root;
    },
    onRemove(root) {
      root?.unmount();
      overlayUi = null;
    },
  });

  overlayUi.mount();
  if (getPlatform().supportsChatHistory) startChatHistoryCapture(ctx);
}
