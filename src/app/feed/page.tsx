"use client";

import Link from "next/link";
import { useState } from "react";

import ReviewCard from "@/components/ReviewCard";
import StatusSummary from "@/components/StatusSummary";
import { initialVideos } from "@/data/mockVideos";
import type { MockVideo, ReviewStatus } from "@/types/video";

type FilterStatus = "All" | ReviewStatus;

const statuses: ReviewStatus[] = ["Pending", "Approved", "Rejected"];
const filterStatuses: FilterStatus[] = ["All", ...statuses];

const statusStyles: Record<ReviewStatus, string> = {
  Pending: "bg-amber-400/15 text-amber-200",
  Approved: "bg-green-400/15 text-green-200",
  Rejected: "bg-red-400/15 text-red-200",
};

export default function FeedPage() {
  const [videos, setVideos] = useState<MockVideo[]>(initialVideos);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("All");
  const statusCounts = videos.reduce<Record<ReviewStatus, number>>(
    (counts, video) => ({
      ...counts,
      [video.status]: counts[video.status] + 1,
    }),
    {
      Pending: 0,
      Approved: 0,
      Rejected: 0,
    },
  );
  const filteredVideos =
    activeFilter === "All"
      ? videos
      : videos.filter((video) => video.status === activeFilter);

  function updateVideo(id: number, updates: Partial<MockVideo>) {
    setVideos((currentVideos) =>
      currentVideos.map((video) =>
        video.id === id ? { ...video, ...updates } : video,
      ),
    );
  }

  function saveNote(id: number, commentText: string) {
    updateVideo(id, {
      savedNote: commentText,
      isCommentOpen: false,
    });
  }

  return (
    <main className="relative min-h-screen bg-neutral-950 px-5 py-24 text-white">
      <header className="absolute left-0 top-0 flex w-full items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-sm font-medium text-neutral-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950"
        >
          Back
        </Link>
        <span className="text-sm font-semibold text-white">MediaFlow</span>
      </header>

      <section className="mx-auto flex w-full max-w-sm flex-col gap-6">
        <StatusSummary statusCounts={statusCounts} statuses={statuses} />

        <div className="grid grid-cols-4 gap-2 rounded-lg border border-white/10 bg-neutral-900 p-2">
          {filterStatuses.map((filter) => {
            const isSelected = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-md px-2 py-2 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900 ${
                  isSelected
                    ? "bg-white text-neutral-950"
                    : "bg-neutral-950 text-neutral-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {filteredVideos.map((video) => (
          <ReviewCard
            key={video.id}
            video={video}
            statusStyles={statusStyles}
            onUpdateVideo={updateVideo}
            onSaveNote={saveNote}
          />
        ))}
      </section>
    </main>
  );
}
