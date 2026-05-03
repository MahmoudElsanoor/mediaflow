"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [publicUrl, setPublicUrl] = useState("");

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
  const hasVideo = Boolean(selectedFile);
  const hasTitle = videoTitle.trim().length > 0;
  const canSave = hasVideo && hasTitle && !isUploading;
  const validationMessage = !hasVideo
    ? "Please select a video file"
    : !hasTitle
      ? "Please enter a video title"
      : "";

  function handleFileChange(file: File | null) {
    setSelectedFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
    setUploadError("");
    setSuccessMessage("");
    setPublicUrl("");
  }

  async function handleUpload() {
    if (!selectedFile || !hasTitle) {
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setSuccessMessage("");
    setPublicUrl("");

    const filePath = `videos/${Date.now()}-${selectedFile.name}`;
    const { error } = await supabase.storage
      .from("videos")
      .upload(filePath, selectedFile);

    if (error) {
      setUploadError(error.message);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from("videos").getPublicUrl(filePath);
    const { error: insertError } = await supabase.from("videos").insert({
      title: videoTitle.trim(),
      playback_url: data.publicUrl,
      status: "Pending",
      note: "",
    });

    if (insertError) {
      setUploadError(insertError.message);
      setPublicUrl(data.publicUrl);
      setIsUploading(false);
      return;
    }

    setPublicUrl(data.publicUrl);
    setSuccessMessage("Video saved to review feed.");
    setIsUploading(false);
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
              <label htmlFor="video-title" className="block">
                <span className="text-sm font-medium text-neutral-200">
                  Video title
                </span>
                <input
                  id="video-title"
                  type="text"
                  value={videoTitle}
                  onChange={(event) => {
                    setVideoTitle(event.target.value);
                    setUploadError("");
                    setSuccessMessage("");
                    setPublicUrl("");
                  }}
                  placeholder="Enter video title"
                  className="mt-2 w-full rounded-md border border-white/15 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-white"
                />
              </label>

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

          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!canSave}
              className={`w-full rounded-md px-4 py-3 text-sm font-medium transition ${
                canSave
                  ? "bg-white text-neutral-950 hover:bg-neutral-200"
                  : "bg-white/20 text-neutral-400"
              }`}
            >
              {isUploading ? "Uploading..." : "Save to Review Feed"}
            </button>
            {validationMessage ? (
              <p className="text-center text-xs text-neutral-400">
                {validationMessage}
              </p>
            ) : null}
            {uploadError ? (
              <p className="text-center text-xs text-red-300">{uploadError}</p>
            ) : null}
            {successMessage ? (
              <p className="text-center text-xs text-green-300">
                {successMessage}
              </p>
            ) : null}
            {publicUrl ? (
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="block break-all text-center text-xs text-neutral-300 underline decoration-white/30 underline-offset-4"
              >
                {publicUrl}
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
