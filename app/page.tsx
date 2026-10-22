
import Image from "next/image";
import Link from "next/link";

export default function Home() {
    return (
        <main className="min-h-screen bg-black text-white">
            {/* Navigation */}
            <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-8 lg:px-10">
                <Link
                    href="/"
                    className="flex items-center"
                >
                    <Image
                        src="/picknovate-logo.png"
                        alt="Picknnovate"
                        width={64}
                        height={64}
                        priority
                        className="h-12 w-12 rounded-xl object-contain sm:h-14 sm:w-14"
                    />
                </Link>

                <div className="flex items-center gap-3 sm:gap-5">
                    <Link
                        href="/login"
                        className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:text-white sm:px-5"
                    >
                        Login
                    </Link>

                    <Link
                        href="/signup"
                        className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 sm:px-5"
                    >
                        Start Free Trial
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="pointer-events-none absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-white/[0.04] blur-3xl" />

                <div className="relative mx-auto flex min-h-[calc(100vh-100px)] w-full max-w-7xl flex-col items-center justify-center px-6 py-20 text-center sm:px-8 lg:px-10">
                    <div className="mb-8 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium tracking-wide text-zinc-300">
                        3-Day Free Trial
                    </div>

                    <h1 className="max-w-5xl text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
    A New Perspective
    <br />
    <span className="text-zinc-400">
        on Photo Selection.
    </span>
</h1>

<p className="mt-8 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
    Simplify your studio workflow with a smarter,
    more seamless way to curate and deliver
    photographic collections.
</p>

                    <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
                        <Link
                            href="/signup"
                            className="w-full rounded-2xl bg-white px-8 py-4 text-center font-semibold text-black transition hover:bg-zinc-200 sm:w-auto"
                        >
                            Start Free Trial
                        </Link>

                        <Link
                            href="/login"
                            className="w-full rounded-2xl border border-zinc-700 px-8 py-4 text-center font-semibold text-white transition hover:border-zinc-500 hover:bg-white/[0.04] sm:w-auto"
                        >
                            Login
                        </Link>
                    </div>

                    <p className="mt-5 text-xs text-zinc-600">
                        No commitment · 3 days free
                    </p>
                </div>
            </section>

            {/* Features */}
            <section className="border-t border-white/10 bg-zinc-950">
                <div className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-8 lg:px-10">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
                            Built for photographers
                        </p>

                        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                            Everything you need for
                            <br />
                            <span className="text-zinc-500">
                                photo selection.
                            </span>
                        </h2>
                    </div>

                    <div className="mt-14 grid gap-5 md:grid-cols-3">
                        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-bold text-black">
                                01
                            </div>

                            <h3 className="text-xl font-semibold">
                                Create Events
                            </h3>

                            <p className="mt-3 leading-7 text-zinc-500">
                                Organize your photography projects
                                and keep every event in one place.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-bold text-black">
                                02
                            </div>

                            <h3 className="text-xl font-semibold">
                                Share Galleries
                            </h3>

                            <p className="mt-3 leading-7 text-zinc-500">
                                Give your clients a simple gallery
                                where they can view and select their
                                favorite photos.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-bold text-black">
                                03
                            </div>

                            <h3 className="text-xl font-semibold">
                                Get Selections
                            </h3>

                            <p className="mt-3 leading-7 text-zinc-500">
                                Receive organized client selections
                                and spend less time managing photo
                                choices.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="border-t border-white/10">
                <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-24 text-center sm:px-8">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                        Ready to simplify
                        <br />
                        your photo selection?
                    </h2>

                    <p className="mt-5 max-w-xl text-zinc-500">
                        Start your free 3-day trial and experience
                        Picknnovate with your own photography workflow.
                    </p>

                    <Link
                        href="/signup"
                        className="mt-8 rounded-2xl bg-white px-8 py-4 font-semibold text-black transition hover:bg-zinc-200"
                    >
                        Start Free Trial
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10">
                <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-zinc-600 sm:flex-row sm:px-8 lg:px-10">
                    <p>
                        © {new Date().getFullYear()} Picknnovate
                    </p>

                    <p>
                        Photo selection, simplified.
                    </p>
                </div>
            </footer>
        </main>
    );
}
