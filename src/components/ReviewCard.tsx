"use client";

import { useEffect, useRef, useState } from "react";

import type { MockVideo, ReviewStatus } from "@/types/video";

type ReviewCardProps = {
  video: MockVideo;
  statusStyles: Record<ReviewStatus, string>;
  isMuted: boolean;
  onToggleMuted: () => void;
  onUpdateVideo: (id: string, updates: Partial<MockVideo>) => void;
  onSaveNote: (id: string, commentText: string) => void;
};

export default function ReviewCard({
  video,
  statusStyles,
  isMuted,
  onToggleMuted,
  onUpdateVideo,
  onSaveNote,
}: ReviewCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wasInViewRef = useRef(false);
  const [isInView, setIsInView] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const cardElement = cardRef.current;

    if (!cardElement) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextIsInView = entry.intersectionRatio >= 0.7;
        const videoElement = videoRef.current;

        if (nextIsInView && !wasInViewRef.current) {
          if (videoElement) {
            videoElement.currentTime = 0;
          }

          setProgress(0);
          setIsManuallyPaused(false);
        }

        if (!nextIsInView && wasInViewRef.current) {
          videoElement?.pause();
        }

        wasInViewRef.current = nextIsInView;
        setIsInView(nextIsInView);
      },
      { threshold: 0.7 },
    );

    observer.observe(cardElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    if (!isInView || isManuallyPaused) {
      videoElement.pause();
      return;
    }

    videoElement.play().catch(() => {
      videoElement.pause();
    });
  }, [isInView, isManuallyPaused]);

  function updateProgress() {
    const videoElement = videoRef.current;

    if (!videoElement || !videoElement.duration) {
      setProgress(0);
      return;
    }

    setProgress((videoElement.currentTime / videoElement.duration) * 100);
  }

  function togglePlayback() {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    if (isManuallyPaused) {
      setIsManuallyPaused(false);
      return;
    }

    setIsManuallyPaused(true);
    videoElement.pause();
  }

  function skipBy(seconds: number) {
    const videoElement = videoRef.current;

    if (!videoElement || !videoElement.duration) {
      return;
    }

    videoElement.currentTime = Math.min(
      Math.max(videoElement.currentTime + seconds, 0),
      videoElement.duration,
    );
    updateProgress();
  }

  return (
    <article
      ref={cardRef}
      data-testid="review-card"
      className="relative h-[calc(100svh-7rem)] min-h-[440px] max-h-[760px] w-full snap-start overflow-hidden rounded-lg border border-white/10 bg-neutral-900 shadow-2xl shadow-black/40"
    >
      <video
        ref={videoRef}
        className="h-full w-full bg-neutral-800 object-cover"
        src={video.videoUrl}
        muted={isMuted}
        loop
        onDurationChange={updateProgress}
        onLoadedMetadata={updateProgress}
        onTimeUpdate={updateProgress}
        playsInline
        preload="metadata"
      >
        Video preview unavailable.
      </video>

      <button
        type="button"
        aria-label={isManuallyPaused ? "Play video" : "Pause video"}
        data-testid="playback-toggle"
        onClick={togglePlayback}
        className="absolute inset-0 z-0 cursor-pointer bg-transparent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/80"
      />

      <button
        type="button"
        aria-label={isMuted ? "Turn sound on" : "Mute video"}
        data-testid="sound-toggle"
        onClick={onToggleMuted}
        className="absolute right-3 top-3 z-10 rounded-md bg-black/70 px-3 py-1.5 text-base font-medium leading-none text-white transition hover:bg-black/85 focus:outline-none focus:ring-2 focus:ring-white"
      >
        {isMuted ? "🔇" : "🔊"}
      </button>

      {isManuallyPaused ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="rounded-md bg-black/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
              Paused
            </span>
            <div className="pointer-events-auto flex gap-2">
              <button
                type="button"
                onClick={() => skipBy(-5)}
                className="rounded-md bg-black/70 px-3 py-2 text-xs font-medium text-white transition hover:bg-black/85 focus:outline-none focus:ring-2 focus:ring-white"
              >
                -5s
              </button>
              <button
                type="button"
                onClick={() => skipBy(5)}
                className="rounded-md bg-black/70 px-3 py-2 text-xs font-medium text-white transition hover:bg-black/85 focus:outline-none focus:ring-2 focus:ring-white"
              >
                +5s
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-10 space-y-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 pt-24">
        <div className="flex items-end justify-between gap-3">
          <h1 className="text-base font-semibold tracking-normal text-white">
            {video.title}
          </h1>
          <span
            className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${statusStyles[video.status]}`}
          >
            {video.status}
          </span>
        </div>

        {video.savedNote ? (
          <div className="rounded-md border border-white/10 bg-black/50 p-2">
            <p className="text-xs font-medium uppercase text-neutral-400">
              Saved note
            </p>
            <p className="mt-1 max-h-10 overflow-hidden text-sm text-neutral-100">
              {video.savedNote}
            </p>
          </div>
        ) : null}

        {video.isCommentOpen ? (
          <div className="space-y-2 rounded-md border border-white/10 bg-black/55 p-2">
            <textarea
              value={video.commentText}
              onChange={(event) =>
                onUpdateVideo(video.id, {
                  commentText: event.target.value,
                })
              }
              placeholder="Add review note..."
              className="min-h-16 w-full resize-none rounded-md border border-white/15 bg-neutral-950/90 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-white"
            />
            <button
              type="button"
              onClick={() => onSaveNote(video.id, video.commentText)}
              className="w-full rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Save Note
            </button>
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onUpdateVideo(video.id, { status: "Approved" })}
            className="rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => onUpdateVideo(video.id, { status: "Rejected" })}
            className="rounded-md border border-white/20 bg-black/35 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() =>
              onUpdateVideo(video.id, {
                isCommentOpen: !video.isCommentOpen,
              })
            }
            className="rounded-md border border-white/20 bg-black/35 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
          >
            Comment
          </button>
        </div>
      </div>

      <div
        data-testid="progress-track"
        className="absolute inset-x-0 bottom-0 z-20 h-1 bg-white/15"
      >
        <div
          data-testid="progress-fill"
          className="h-full bg-white transition-[width] duration-150 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </article>
  );
}
