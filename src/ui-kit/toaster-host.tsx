import type { CSSProperties } from "react";
import { Toaster } from "sonner";

const toasterStyle: CSSProperties & Record<"--width", string> = {
  "--width": "min(520px, calc(100vw - 32px))",
};

type Props = { position?: "top-center" | "bottom-center" };

export const AppToaster = ({ position = "top-center" }: Props) => (
  <Toaster
    position={position}
    style={toasterStyle}
    toastOptions={{ unstyled: true, style: { width: "100%" } }}
  />
);
