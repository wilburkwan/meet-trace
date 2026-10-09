import test from "node:test";
import assert from "node:assert/strict";
import {
  toLinesWithTimestamps,
  toLinesOnly,
  toPlainText,
  toTranscriptWithTimestamps,
  stripLeadingTimestamp,
  parseTimestamp,
  type TranscriptLine,
  type VideoTranscript,
} from "../src/core/transcript/index.ts";

test("stripLeadingTimestamp removes various timestamp formats", () => {
  assert.equal(stripLeadingTimestamp("00:15 Hello world"), "Hello world");
  assert.equal(stripLeadingTimestamp("[00:15] Hello world"), "Hello world");
  assert.equal(stripLeadingTimestamp("(0:15) - Hello world"), "Hello world");
  assert.equal(stripLeadingTimestamp("【01:02:15】: Hello world"), "Hello world");
  assert.equal(stripLeadingTimestamp("120:15 Hello world"), "Hello world");
  assert.equal(stripLeadingTimestamp("0:15 0:15 Hello world"), "Hello world");
  assert.equal(stripLeadingTimestamp("[00:15] 00:15 - Hello world"), "Hello world");
  assert.equal(stripLeadingTimestamp("3 分鐘 40 秒 羊台近距離睇煙火"), "羊台近距離睇煙火");
  assert.equal(stripLeadingTimestamp("1 小時 2 分 3 秒 羊台近距離睇煙火"), "羊台近距離睇煙火");
  assert.equal(stripLeadingTimestamp("3 分鐘 羊台近距離睇煙火"), "羊台近距離睇煙火");
  assert.equal(stripLeadingTimestamp("40 秒 羊台近距離睇煙火"), "羊台近距離睇煙火");
  assert.equal(stripLeadingTimestamp("\u200E00:15 \u200FHello world"), "Hello world");
  assert.equal(stripLeadingTimestamp("00:15"), "");
  assert.equal(stripLeadingTimestamp("Pure text without timestamp"), "Pure text without timestamp");
});

test("toLinesWithTimestamps formats lines as timestamp and text", () => {
  const lines: TranscriptLine[] = [
    { start: 15, text: "Hello world" },
    { start: 75, text: "Second line" },
  ];
  const output = toLinesWithTimestamps(lines);
  assert.equal(output, "00:15 Hello world\n01:15 Second line");
});

test("toLinesWithTimestamps prevents duplicate timestamps if lines already contained them", () => {
  const lines: TranscriptLine[] = [
    { start: 15, text: "00:15 Hello world" },
    { start: 75, text: "[01:15] Second line" },
  ];
  const output = toLinesWithTimestamps(lines);
  assert.equal(output, "00:15 Hello world\n01:15 Second line");
});

test("toLinesWithTimestamps includes hours when video exceeds 1 hour", () => {
  const lines: TranscriptLine[] = [
    { start: 15, text: "Hello" },
    { start: 3665, text: "One hour later" },
  ];
  const output = toLinesWithTimestamps(lines);
  assert.equal(output, "00:00:15 Hello\n01:01:05 One hour later");
});

test("toLinesOnly formats lines as plain text with one line per segment without any timestamps", () => {
  const lines: TranscriptLine[] = [
    { start: 15, text: "Hello world" },
    { start: 75, text: "Second line" },
  ];
  const output = toLinesOnly(lines);
  assert.equal(output, "Hello world\nSecond line");
});

test("toLinesOnly strips any timestamps that were attached to the text", () => {
  const lines: TranscriptLine[] = [
    { start: 0, text: "00:00 我哋只係買咗一張單程機票" },
    { start: 9, text: "[00:09] 最終跨咗東南亞同歐洲國家" },
    { start: 220, text: "3 分鐘 40 秒 羊台近距離睇煙火" },
  ];
  const output = toLinesOnly(lines);
  assert.equal(
    output,
    "我哋只係買咗一張單程機票\n最終跨咗東南亞同歐洲國家\n羊台近距離睇煙火"
  );
});

test("toPlainText produces pure text without timestamps on the left", () => {
  const transcript: VideoTranscript = {
    title: "Video Title",
    url: "https://youtube.com/watch?v=abc",
    lines: [
      { start: 0, text: "00:00 Line 1" },
      { start: 15, text: "Line 2" },
    ],
  };
  const output = toPlainText(transcript);
  assert.equal(output, "Video Title\nhttps://youtube.com/watch?v=abc\n\nLine 1\nLine 2");
});

test("toTranscriptWithTimestamps produces timestamped lines for prompts", () => {
  const transcript: VideoTranscript = {
    title: "Video Title",
    url: "https://youtube.com/watch?v=abc",
    lines: [
      { start: 0, text: "00:00 Line 1" },
      { start: 15, text: "Line 2" },
    ],
  };
  const output = toTranscriptWithTimestamps(transcript);
  assert.equal(output, "Video Title\nhttps://youtube.com/watch?v=abc\n\n[00:00] Line 1\n[00:15] Line 2");
});

test("formatting functions handle empty line arrays", () => {
  assert.equal(toLinesWithTimestamps([]), "");
  assert.equal(toLinesOnly([]), "");
});

test("findActiveSegmentIndex returns correct segment index for video time", async () => {
  const { findActiveSegmentIndex } = await import("../src/core/transcript/index.ts");
  const lines: TranscriptLine[] = [
    { start: 0, text: "Intro" },
    { start: 10, text: "Topic 1" },
    { start: 25, text: "Topic 2" },
  ];
  assert.equal(findActiveSegmentIndex(lines, 0), 0);
  assert.equal(findActiveSegmentIndex(lines, 5), 0);
  assert.equal(findActiveSegmentIndex(lines, 10), 1);
  assert.equal(findActiveSegmentIndex(lines, 20), 1);
  assert.equal(findActiveSegmentIndex(lines, 25), 2);
  assert.equal(findActiveSegmentIndex(lines, 100), 2);
  assert.equal(findActiveSegmentIndex([], 10), -1);
});
