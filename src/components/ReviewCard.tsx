"use client";

import { useEffect, useRef, useState } from "react";

import type { MockVideo, ReviewStatus } from "@/types/video";

type ReviewCardProps = {
  video: MockVideo;
  statusStyles: Record<ReviewStatus, string>;
  onUpdateVideo: (id: number, updates: Partial<MockVideo>) => void;
  onSaveNote: (id: number, commentText: string) => void;
};

export default function ReviewCard({
  video,
  statusStyles,
  onUpdateVideo,
  onSaveNote,
}: ReviewCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const cardElement = cardRef.current;
    const videoElement = videoRef.current;

    if (!cardElement || !videoElement) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.7) {
          videoElement.play().catch(() => {
            videoElement.pause();
          });
          return;
        }

        videoElement.pause();
      },
      { threshold: 0.7 },
    );

    observer.observe(cardElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <article
      ref={cardRef}
      className="relative h-[calc(100svh-6rem)] max-h-[760px] w-full snap-start overflow-hidden rounded-lg border border-white/10 bg-neutral-900 shadow-2xl shadow-black/40"
    >
      <video
        ref={videoRef}
        className="h-full w-full bg-neutral-800 object-cover"
        src={video.videoUrl}
        muted={isMuted}
        loop
        playsInline
        preload="metadata"
      >
        Video preview unavailable.
      </video>

      <button
        type="button"
        onClick={() => setIsMuted((current) => !current)}
        className="absolute right-3 top-3 rounded-md bg-black/70 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-black/85 focus:outline-none focus:ring-2 focus:ring-white"
      >
        {isMuted ? "Muted" : "Sound On"}
      </button>

      <div className="absolute inset-x-0 bottom-0 space-y-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 pt-24">
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
    </article>
  );
}
