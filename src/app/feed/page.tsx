import Link from "next/link";

export default function FeedPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <header className="absolute left-0 top-0 flex w-full items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-sm font-medium text-neutral-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950"
        >
          Back
        </Link>
        <span className="text-sm font-semibold text-white">MediaFlow</span>
      </header>

      <section className="flex w-full max-w-sm flex-col items-center text-center">
        <h1 className="text-3xl font-semibold tracking-normal">
          Feed Coming Next
        </h1>
        <p className="mt-3 text-sm text-neutral-300">
          MediaFlow Review Feed
        </p>
      </section>
    </main>
  );
}
