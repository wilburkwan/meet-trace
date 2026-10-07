import { meetPlatform } from "./meet";
import { teamsPlatform } from "./teams";
import type { MeetingPlatform } from "./platform-contract";

export type { MeetingPlatform } from "./platform-contract";

let cached: MeetingPlatform | null = null;

/** The meeting platform of the current page (detected lazily from the host). */
export const getPlatform = (): MeetingPlatform => {
  cached ??=
    window.location.hostname === "meet.google.com" ? meetPlatform : teamsPlatform;
  return cached;
};
