import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <section className="flex w-full max-w-sm flex-col items-center text-center">
        <h1 className="text-4xl font-semibold tracking-normal">
          CosmoMed Video Review
        </h1>
        <p className="mt-3 text-base text-neutral-300">
          FNG Marketing Video Review
        </p>
        <Link
          href="/feed"
          className="mt-8 rounded-md bg-white px-5 py-3 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950"
        >
          Go to Feed
        </Link>
      </section>
    </main>
  );
}
