import { useState, type ChangeEvent } from "react";
import { getMeetingNotes, updateMeetingNotes } from "@live/session-recorder";

/** Keeps the notes textarea in sync with the current meeting session, which autosaves it. */
export const useNotesPanel = () => {
  const [notes, setNotes] = useState(getMeetingNotes);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.currentTarget;
    setNotes(value);
    updateMeetingNotes(value);
  };

  return { notes, handleChange };
};
