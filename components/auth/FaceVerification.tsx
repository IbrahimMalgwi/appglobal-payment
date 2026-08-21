"use client";

import { useEffect, useRef, useState } from "react";
import { CameraOff, CheckCircle2, Loader2 } from "lucide-react";
import { clsx } from "clsx";

type Phase = "requesting" | "scanning" | "capturing" | "verifying" | "success" | "unavailable";

const SCAN_DURATION_MS = 2400;
const CAPTURE_FLASH_MS = 350;
const VERIFY_DURATION_MS = 900;
const SUCCESS_HOLD_MS = 1100;

/**
 * Mock face-verification step. The camera preview and the captured frame are both real (a
 * genuine getUserMedia stream, snapshotted to a canvas), but no analysis of that frame happens
 * — "recognition" is a timed mock success. Falls back to onFallback if the camera can't be
 * accessed.
 */
export function FaceVerification({
  onSuccess,
  onFallback,
}: {
  onSuccess: () => void;
  onFallback: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("requesting");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  /** Snapshots the current video frame to the off-screen canvas, mirrored to match the preview. */
  function capturePhoto(): string | null {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return null;

    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    return canvas.toDataURL("image/png");
  }

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      ?.getUserMedia({ video: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // `autoPlay` doesn't reliably kick in when srcObject is assigned imperatively —
          // play() explicitly so the video actually has frames (and real dimensions) by the
          // time we go to capture one.
          videoRef.current.play().catch(() => {});
        }
        setPhase("scanning");
      })
      .catch(() => {
        if (!cancelled) setPhase("unavailable");
      });

    // getUserMedia support can only be checked once mounted (it depends on `navigator`).
    if (!navigator.mediaDevices) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("unavailable");
    }

    return () => {
      cancelled = true;
      stopStream();
    };
  }, []);

  useEffect(() => {
    if (phase === "scanning") {
      let retry: ReturnType<typeof setTimeout>;
      // Video metadata can occasionally still be loading right at the scan deadline — retry
      // briefly rather than "capturing" a blank frame.
      function attemptCapture(attemptsLeft: number) {
        const photo = capturePhoto();
        if (photo || attemptsLeft <= 0) {
          setCapturedPhoto(photo);
          stopStream();
          setPhase("capturing");
        } else {
          retry = setTimeout(() => attemptCapture(attemptsLeft - 1), 150);
        }
      }
      const t = setTimeout(() => attemptCapture(10), SCAN_DURATION_MS);
      return () => {
        clearTimeout(t);
        clearTimeout(retry);
      };
    }
    if (phase === "capturing") {
      const t = setTimeout(() => setPhase("verifying"), CAPTURE_FLASH_MS);
      return () => clearTimeout(t);
    }
    if (phase === "verifying") {
      const t = setTimeout(() => setPhase("success"), VERIFY_DURATION_MS);
      return () => clearTimeout(t);
    }
    if (phase === "success") {
      const t = setTimeout(onSuccess, SUCCESS_HOLD_MS);
      return () => clearTimeout(t);
    }
  }, [phase, onSuccess]);

  return (
    <div className="flex flex-col items-center text-center">
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative mx-auto flex h-48 w-48 max-w-full items-center justify-center sm:h-56 sm:w-56">
        {/* Always mounted (hidden outside "scanning") so the ref is attached before the
            getUserMedia promise resolves — assigning srcObject to a not-yet-mounted video
            silently drops the stream. */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={clsx(
            "h-full w-full rounded-full object-cover [transform:scaleX(-1)]",
            phase !== "scanning" && "hidden"
          )}
        />
        {phase === "scanning" && (
          <div className="pointer-events-none absolute inset-0 animate-pulse rounded-full border-4 border-brand-400" />
        )}

        {(phase === "capturing" || phase === "verifying" || phase === "success") && capturedPhoto && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- a locally captured data: URL, not an optimizable remote asset */}
            <img
              src={capturedPhoto}
              alt="Captured face"
              className={clsx(
                "h-full w-full rounded-full object-cover",
                phase !== "capturing" && "brightness-75"
              )}
            />
            <div
              className={clsx(
                "pointer-events-none absolute inset-0 rounded-full border-4",
                phase === "verifying" ? "border-brand-500" : "border-success"
              )}
            />
            {phase === "capturing" && (
              <div className="pointer-events-none absolute inset-0 animate-flash rounded-full bg-white" />
            )}
            {phase === "verifying" && (
              <div className="absolute inset-0 grid place-items-center rounded-full bg-navy-950/30">
                <Loader2 size={32} className="animate-spin text-white" />
              </div>
            )}
            {phase === "success" && (
              <div className="absolute inset-0 grid place-items-center rounded-full">
                <CheckCircle2 size={48} className="text-success drop-shadow" />
              </div>
            )}
          </>
        )}

        {phase === "requesting" && (
          <div className="grid h-full w-full place-items-center rounded-full border-4 border-dashed border-navy-700 bg-navy-900">
            <Loader2 size={28} className="animate-spin text-navy-200" />
          </div>
        )}

        {phase === "unavailable" && (
          <div className="grid h-full w-full place-items-center rounded-full border-4 border-navy-700 bg-navy-900">
            <CameraOff size={28} className="text-navy-300" />
          </div>
        )}
      </div>

      <div className="mt-6 min-h-[3rem]">
        {phase === "requesting" && <p className="text-sm text-navy-300">Requesting camera access...</p>}
        {phase === "scanning" && (
          <>
            <p className="text-sm font-semibold text-white">Position your face within the frame</p>
            <p className="mt-1 text-xs text-navy-300">Hold still — this only takes a moment.</p>
          </>
        )}
        {phase === "capturing" && <p className="text-sm font-semibold text-white">Got it — hold on...</p>}
        {phase === "verifying" && <p className="text-sm font-semibold text-white">Verifying...</p>}
        {phase === "success" && <p className="text-sm font-semibold text-success">Face verified</p>}
        {phase === "unavailable" && (
          <>
            <p className="text-sm font-semibold text-white">We couldn&apos;t access your camera</p>
            <p className="mt-1 text-xs text-navy-300">
              Check your camera permissions, or verify your identity another way.
            </p>
          </>
        )}
      </div>

      {phase === "unavailable" && (
        <button
          type="button"
          onClick={onFallback}
          className="mt-4 text-sm font-semibold text-brand-400 hover:text-brand-300"
        >
          Verify another way
        </button>
      )}
    </div>
  );
}
