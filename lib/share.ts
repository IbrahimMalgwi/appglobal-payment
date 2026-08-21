// Shared file-sharing helper used by both the PDF and image receipt "Share" actions.
// Desktop browsers mostly lack Web Share API file support, so the download fallback is the
// common path there — that's expected, not a bug.

export async function shareFile(file: File, title: string): Promise<"shared" | "downloaded"> {
  const nav = navigator as Navigator & {
    share?: (data: ShareData) => Promise<void>;
    canShare?: (data: ShareData) => boolean;
  };

  if (nav.share && nav.canShare?.({ files: [file] })) {
    await nav.share({ files: [file], title });
    return "shared";
  }

  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}
