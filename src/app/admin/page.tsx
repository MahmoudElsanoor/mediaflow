"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type AdminVideo = {
  id: string;
  title: string;
  playback_url: string;
  status: string | null;
  created_at: string;
  sort_order: number | null;
};

type DeleteVideoResponse =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getEffectiveSortOrder(video: AdminVideo, index: number) {
  return video.sort_order ?? index + 1;
}

async function fetchAdminVideos() {
  return supabase
    .from("videos")
    .select("id,title,playback_url,status,created_at,sort_order")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
}

export default function AdminPage() {
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyVideoId, setBusyVideoId] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadVideos() {
    const { data, error } = await fetchAdminVideos();

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    setVideos((data as AdminVideo[]) ?? []);
    setIsLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialVideos() {
      const { data, error } = await fetchAdminVideos();

      if (!isMounted) {
        return;
      }

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setVideos((data as AdminVideo[]) ?? []);
      setIsLoading(false);
    }

    loadInitialVideos();

    return () => {
      isMounted = false;
    };
  }, []);

  async function moveVideo(index: number, direction: "up" | "down") {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const currentVideo = videos[index];
    const swapVideo = videos[swapIndex];

    if (!currentVideo || !swapVideo) {
      return;
    }

    setBusyVideoId(currentVideo.id);
    setMessage("");
    setErrorMessage("");

    const currentSortOrder = getEffectiveSortOrder(currentVideo, index);
    const swapSortOrder = getEffectiveSortOrder(swapVideo, swapIndex);

    const [currentResult, swapResult] = await Promise.all([
      supabase
        .from("videos")
        .update({ sort_order: swapSortOrder })
        .eq("id", currentVideo.id),
      supabase
        .from("videos")
        .update({ sort_order: currentSortOrder })
        .eq("id", swapVideo.id),
    ]);

    if (currentResult.error || swapResult.error) {
      setErrorMessage(
        currentResult.error?.message ??
          swapResult.error?.message ??
          "Could not update video order.",
      );
      setBusyVideoId("");
      return;
    }

    await loadVideos();
    setMessage("Video order updated.");
    setBusyVideoId("");
  }

  async function deleteVideo(video: AdminVideo) {
    const shouldDelete = window.confirm(
      `Delete "${video.title}" from CosmoMed Video Review?`,
    );

    if (!shouldDelete) {
      return;
    }

    setBusyVideoId(video.id);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/delete-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: video.id,
          playbackUrl: video.playback_url,
        }),
      });
      const result = (await response.json()) as DeleteVideoResponse;

      if (!response.ok) {
        setErrorMessage(
          result.success === false
            ? result.error
            : `Delete request failed with status ${response.status}.`,
        );
        return;
      }

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      setVideos((currentVideos) =>
        currentVideos.filter((currentVideo) => currentVideo.id !== video.id),
      );
      setMessage(`Deleted "${video.title}".`);
      await loadVideos();
    } catch (error) {
      const nextError =
        error instanceof Error ? error.message : "Unknown delete error.";

      console.error("Admin delete failed:", error);
      setErrorMessage(nextError);
    } finally {
      setBusyVideoId("");
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-20 text-white">
      <header className="fixed left-0 top-0 z-10 flex w-full items-center justify-between border-b border-white/10 bg-neutral-950/95 px-5 py-4 backdrop-blur">
        <Link
          href="/feed"
          className="text-sm font-medium text-neutral-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950"
        >
          Feed
        </Link>
        <span className="text-sm font-semibold text-white">
          CosmoMed Video Review Admin
        </span>
        <Link
          href="/upload"
          className="text-sm font-medium text-neutral-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950"
        >
          Upload
        </Link>
      </header>

      <section className="mx-auto w-full max-w-3xl">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold tracking-normal">
            Video Admin
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Temporary Mahmoud-only admin until auth is added.
          </p>
        </div>

        {message ? (
          <p className="mb-4 rounded-md border border-green-400/20 bg-green-950/35 p-3 text-sm text-green-200">
            {message}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="mb-4 rounded-md border border-red-400/20 bg-red-950/40 p-3 text-sm text-red-200">
            {errorMessage}
          </p>
        ) : null}

        {isLoading ? (
          <p className="rounded-lg border border-white/10 bg-neutral-900 p-4 text-center text-sm text-neutral-300">
            Loading videos...
          </p>
        ) : null}

        {!isLoading && videos.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-neutral-900 p-4 text-center text-sm text-neutral-300">
            No videos found.
          </p>
        ) : null}

        <div className="space-y-3">
          {videos.map((video, index) => {
            const isBusy = busyVideoId === video.id;

            return (
              <article
                key={video.id}
                className="overflow-hidden rounded-lg border border-white/10 bg-neutral-900"
              >
                <div className="grid gap-3 p-3 sm:grid-cols-[140px_1fr]">
                  <video
                    className="aspect-video w-full rounded-md bg-neutral-800 object-cover sm:aspect-[9/16]"
                    src={video.playback_url}
                    muted
                    playsInline
                    preload="metadata"
                  >
                    Video preview unavailable.
                  </video>

                  <div className="min-w-0 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="break-words text-base font-semibold text-white">
                          {video.title}
                        </h2>
                        <p className="mt-1 text-xs text-neutral-400">
                          Created {formatDate(video.created_at)}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-md bg-neutral-950 px-2 py-1 text-xs font-medium text-neutral-200">
                        {video.status ?? "Pending"}
                      </span>
                    </div>

                    <div className="rounded-md border border-white/10 bg-neutral-950 p-2">
                      <p className="text-xs font-medium uppercase text-neutral-500">
                        Playback URL
                      </p>
                      <a
                        href={video.playback_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block break-all text-xs text-neutral-300 underline decoration-white/30 underline-offset-4"
                      >
                        {video.playback_url}
                      </a>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        disabled={index === 0 || isBusy}
                        onClick={() => moveVideo(index, "up")}
                        className="rounded-md border border-white/15 bg-black/30 px-2 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-white"
                      >
                        Move Up
                      </button>
                      <button
                        type="button"
                        disabled={index === videos.length - 1 || isBusy}
                        onClick={() => moveVideo(index, "down")}
                        className="rounded-md border border-white/15 bg-black/30 px-2 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-white"
                      >
                        Move Down
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => deleteVideo(video)}
                        className="rounded-md bg-red-500/90 px-2 py-2 text-sm font-medium text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-red-950 disabled:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                      >
                        {isBusy ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
