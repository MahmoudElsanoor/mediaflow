"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!previewUrl) {
      return;
    }

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const fileSizeInMb = selectedFile
    ? (selectedFile.size / 1024 / 1024).toFixed(2)
    : null;

  function handleFileChange(file: File | null) {
    setSelectedFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-24 text-white">
      <header className="fixed left-0 top-0 z-10 flex w-full items-center justify-between bg-neutral-950/95 px-6 py-5">
        <Link
          href="/feed"
          className="text-sm font-medium text-neutral-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950"
        >
          Back
        </Link>
        <span className="text-sm font-semibold text-white">MediaFlow</span>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-sm flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-semibold tracking-normal">
          Upload Video
        </h1>
        <p className="mt-3 text-sm text-neutral-300">
          Add new review videos for FNG Marketing
        </p>

        <div className="mt-8 w-full rounded-lg border border-dashed border-white/20 bg-neutral-900 p-6">
          <label
            htmlFor="video-upload"
            className="block w-full cursor-pointer rounded-md bg-white px-4 py-3 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200 focus-within:outline-none focus-within:ring-2 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-neutral-900"
          >
            Select Video
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={(event) =>
                handleFileChange(event.target.files?.[0] ?? null)
              }
            />
          </label>

          {selectedFile ? (
            <div className="mt-6 space-y-4 text-left">
              <div className="rounded-md border border-white/10 bg-neutral-950 p-3">
                <p className="text-sm font-medium text-white">
                  {selectedFile.name}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  {fileSizeInMb} MB
                </p>
              </div>

              {previewUrl ? (
                <video
                  className="aspect-[9/16] w-full rounded-md bg-neutral-800 object-cover"
                  src={previewUrl}
                  controls
                  playsInline
                  preload="metadata"
                >
                  Video preview unavailable.
                </video>
              ) : null}
            </div>
          ) : (
            <p className="mt-5 text-sm text-neutral-300">
              Choose a local video to preview it here.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
