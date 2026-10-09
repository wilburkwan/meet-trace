import { appendChunk, openRecordingDb } from "@/core/recording-db";
import { startMediaCapture, type Capture } from "./captures";
import { connectMic, describeMic, disconnectMic } from "./mic-input";

// Chrome's tab-capture constraints are not part of the standard typings.
type TabAudioConstraints = {
  audio: { mandatory: { chromeMediaSource: "tab"; chromeMediaSourceId: string } };
};
const getTabStream = (streamId: string): Promise<MediaStream> => {
  const constraints: TabAudioConstraints = {
    audio: { mandatory: { chromeMediaSource: "tab", chromeMediaSourceId: streamId } },
  };
  return navigator.mediaDevices.getUserMedia(constraints as MediaStreamConstraints);
};

type Stats = { chunks: number; bytes: number; errors: string[] };

type Session = {
  tabStream: MediaStream;
  context: AudioContext;
  /** Where the tab and the mic meet. Null when the AudioContext couldn't run. */
  bus: GainNode | null;
  capture: Capture;
  db: IDBDatabase;
  stats: Stats;
  /** Resolves once every slice so far is stored. */
  flushed: () => Promise<unknown>;
};

let session: Session | null = null;

const errorText = (error: unknown): string => (error instanceof Error ? error.message : String(error));

/**
 * Routes the tab into a bus the mic can join at any time. Pages nobody clicked
 * may keep the AudioContext suspended (autoplay rules); then there is no bus.
 */
const buildBus = async (context: AudioContext, tabStream: MediaStream): Promise<GainNode | null> => {
  await context.resume().catch(() => {});
  const tabSource = context.createMediaStreamSource(tabStream);
  tabSource.connect(context.destination); // capturing mutes the tab: keep it audible
  if (context.state !== "running") return null;
  const bus = context.createGain();
  tabSource.connect(bus);
  return bus;
};

/** Stores slices in order; one failed write doesn't block the ones after it. */
const createSliceStore = (db: IDBDatabase, stats: Stats) => {
  let writes: Promise<unknown> = Promise.resolve();
  const store = (slice: Blob) => {
    stats.chunks += 1;
    stats.bytes += slice.size;
    writes = writes.then(() => appendChunk(db, slice)).catch((error: unknown) => {
      stats.errors.push(`write: ${errorText(error)}`);
    });
  };
  return { store, flushed: () => writes };
};

/** Switches the user's mic in or out of the recording. Returns whether it is now on. */
export const setMic = async (enabled: boolean): Promise<boolean> => {
  if (!session?.bus) return false;
  if (!enabled) {
    disconnectMic();
    return false;
  }
  return connectMic(session.context, session.bus);
};

/**
 * Starts recording the tab (and the mic). If the AudioContext can't run, the
 * tab is recorded on its own (no mic) so the recording is never silent.
 */
export const startRecording = async (
  streamId: string,
  withMic: boolean,
  dbName: string,
  onCaptureEnded: () => void
): Promise<{ micOn: boolean }> => {
  if (session) throw new Error("Already recording");
  const db = await openRecordingDb(dbName);
  const tabStream = await getTabStream(streamId);
  const context = new AudioContext();
  const bus = await buildBus(context, tabStream);

  const stats: Stats = { chunks: 0, bytes: 0, errors: [] };
  const { store, flushed } = createSliceStore(db, stats);
  const mix = bus ? context.createMediaStreamDestination() : null;
  if (bus && mix) bus.connect(mix);
  const capture = startMediaCapture(mix?.stream ?? tabStream, store, (message) => stats.errors.push(`recorder: ${message}`));

  session = { tabStream, context, bus, capture, db, stats, flushed };
  tabStream.getAudioTracks()[0]?.addEventListener("ended", onCaptureEnded);
  return { micOn: withMic ? await setMic(true) : false };
};

/** What happened, shown on the save page if nothing was recorded. */
const describe = ({ capture, context, tabStream, stats }: Session): string => {
  const tab = tabStream.getAudioTracks().map((track) => `tab:${track.readyState}${track.muted ? "/muted" : ""}`);
  return [`format=${capture.format}`, `context=${context.state}`, ...tab, describeMic(), `chunks=${stats.chunks}`, `bytes=${stats.bytes}`, ...stats.errors].join(" · ");
};

/** Stops recording once every slice has been written. */
export const stopRecording = async (): Promise<string> => {
  const current = session;
  if (!current) return "no active recording";
  session = null;
  await current.capture.stop();
  await current.flushed();
  const details = describe(current);
  disconnectMic();
  current.tabStream.getTracks().forEach((track) => track.stop());
  await current.context.close();
  current.db.close();
  return details;
};
