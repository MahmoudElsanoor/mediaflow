"use client";

import { useEffect, useRef } from "react";

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
      className="w-full snap-start overflow-hidden rounded-lg border border-white/10 bg-neutral-900 shadow-2xl shadow-black/40"
    >
      <div className="aspect-[9/16] bg-neutral-800">
        <video
          ref={videoRef}
          className="h-full w-full bg-neutral-800 object-cover"
          src={video.videoUrl}
          muted
          loop
          playsInline
          preload="metadata"
        >
          Video preview unavailable.
        </video>
      </div>

      <div className="space-y-5 p-5">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold tracking-normal">
            {video.title}
          </h1>
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${statusStyles[video.status]}`}
          >
            {video.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onUpdateVideo(video.id, { status: "Approved" })}
            className="rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => onUpdateVideo(video.id, { status: "Rejected" })}
            className="rounded-md border border-white/15 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900"
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
            className="rounded-md border border-white/15 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900"
          >
            Comment
          </button>
        </div>

        {video.isCommentOpen ? (
          <div className="space-y-3">
            <textarea
              value={video.commentText}
              onChange={(event) =>
                onUpdateVideo(video.id, {
                  commentText: event.target.value,
                })
              }
              placeholder="Add review note..."
              className="min-h-24 w-full resize-none rounded-md border border-white/15 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-white"
            />
            <button
              type="button"
              onClick={() => onSaveNote(video.id, video.commentText)}
              className="w-full rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900"
            >
              Save Note
            </button>
          </div>
        ) : null}

        {video.savedNote ? (
          <div className="rounded-md border border-white/10 bg-neutral-950 p-3">
            <p className="text-xs font-medium uppercase text-neutral-500">
              Saved note
            </p>
            <p className="mt-2 text-sm text-neutral-200">{video.savedNote}</p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
