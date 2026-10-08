import { getPlatform } from "@live/adapters";

/** Whether the platform shows its post-call state. */
export const isMeetingEndedPage = (): boolean => getPlatform().isMeetingEnded();
