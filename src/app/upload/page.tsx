import Link from "next/link";

export default function UploadPage() {
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
          <p className="text-sm text-neutral-300">Upload flow coming next</p>
          <button
            type="button"
            disabled
            className="mt-5 w-full rounded-md bg-white/20 px-4 py-3 text-sm font-medium text-neutral-400"
          >
            Select Video
          </button>
        </div>
      </section>
    </main>
  );
}
