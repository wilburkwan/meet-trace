/** Saves a file straight into Downloads; resolves with its download id once fully written. */
export const downloadAndWait = async (url: string, filename: string): Promise<number> => {
  const id = await chrome.downloads.download({ url, filename, conflictAction: "uniquify", saveAs: false });

  return new Promise((resolve, reject) => {
    const finish = (state: string | undefined, error?: string) => {
      if (state !== "complete" && state !== "interrupted") return;
      chrome.downloads.onChanged.removeListener(listener);
      if (state === "complete") resolve(id);
      else reject(new Error(error ?? "Download interrupted"));
    };
    const listener = (delta: chrome.downloads.DownloadDelta) => {
      if (delta.id === id) finish(delta.state?.current, delta.error?.current);
    };
    chrome.downloads.onChanged.addListener(listener);
    // A small file may finish before the listener is attached.
    void chrome.downloads.search({ id }).then(([item]) => finish(item?.state, item?.error));
  });
};
