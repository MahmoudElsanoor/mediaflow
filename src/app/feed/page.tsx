"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ReviewCard from "@/components/ReviewCard";
import StatusSummary from "@/components/StatusSummary";
import { supabase } from "@/lib/supabase";
import type { MockVideo, ReviewStatus } from "@/types/video";

type FilterStatus = "All" | ReviewStatus;

const statuses: ReviewStatus[] = ["Pending", "Approved", "Rejected"];
const filterStatuses: FilterStatus[] = ["All", ...statuses];

const statusStyles: Record<ReviewStatus, string> = {
  Pending: "bg-amber-400/15 text-amber-200",
  Approved: "bg-green-400/15 text-green-200",
  Rejected: "bg-red-400/15 text-red-200",
};

type VideoRow = {
  id: string;
  title: string;
  playback_url: string;
  status: string | null;
  note: string | null;
};

function toReviewStatus(status: string | null): ReviewStatus {
  return statuses.includes(status as ReviewStatus)
    ? (status as ReviewStatus)
    : "Pending";
}

export default function FeedPage() {
  const [videos, setVideos] = useState<MockVideo[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
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

  useEffect(() => {
    let isMounted = true;

    async function loadVideos() {
      const { data, error } = await supabase
        .from("videos")
        .select("id,title,playback_url,status,note")
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (error) {
        setFetchError(error.message);
        setIsLoading(false);
        return;
      }

      const nextVideos: MockVideo[] = (data as VideoRow[]).map((row) => ({
        id: row.id,
        title: row.title,
        videoUrl: row.playback_url,
        status: toReviewStatus(row.status),
        savedNote: row.note ?? "",
        commentText: "",
        isCommentOpen: false,
      }));

      setVideos(nextVideos);
      setFetchError("");
      setIsLoading(false);
    }

    loadVideos();

    return () => {
      isMounted = false;
    };
  }, []);

  function updateVideo(id: string, updates: Partial<MockVideo>) {
    setVideos((currentVideos) =>
      currentVideos.map((video) =>
        video.id === id ? { ...video, ...updates } : video,
      ),
    );
  }

  function saveNote(id: string, commentText: string) {
    updateVideo(id, {
      savedNote: commentText,
      isCommentOpen: false,
    });
  }

  return (
    <main className="h-svh overflow-y-auto snap-y snap-mandatory scroll-pt-20 bg-neutral-950 px-4 pb-4 pt-20 text-white">
      <header className="fixed left-0 top-0 z-10 flex w-full items-center justify-between bg-neutral-950/95 px-6 py-5">
        <Link
          href="/"
          className="text-sm font-medium text-neutral-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950"
        >
          Back
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-white">MediaFlow</span>
          <Link
            href="/upload"
            className="text-sm font-medium text-neutral-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950"
          >
            Upload
          </Link>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-sm flex-col gap-3">
        <StatusSummary statusCounts={statusCounts} statuses={statuses} />

        <div className="grid grid-cols-4 gap-1.5 rounded-lg border border-white/10 bg-neutral-900 p-1.5">
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

        {isLoading ? (
          <p className="rounded-lg border border-white/10 bg-neutral-900 p-4 text-center text-sm text-neutral-300">
            Loading review feed...
          </p>
        ) : null}

        {fetchError ? (
          <p className="rounded-lg border border-red-400/20 bg-red-950/40 p-4 text-center text-sm text-red-200">
            {fetchError}
          </p>
        ) : null}

        {!isLoading && !fetchError && videos.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-neutral-900 p-4 text-center text-sm text-neutral-300">
            No review videos yet.
          </p>
        ) : null}

        {!isLoading &&
          !fetchError &&
          filteredVideos.map((video) => (
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
