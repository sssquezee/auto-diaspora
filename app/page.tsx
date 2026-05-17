export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Top strip — dark band as in reference */}
      <div className="bg-bg-dark text-ink-subtle font-mono text-[11px] uppercase tracking-[0.15em] py-2 px-6 flex justify-between">
        <span>Auto Diaspora — стартова версія</span>
        <span>UK · RU · EN</span>
      </div>

      {/* Hero / centered logo */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
        {/* Diagonal stripes hero detail (subtle) */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent 0 24px, var(--ink) 24px 25px)",
          }}
        />

        {/* Cobalt accent circle (top-right) */}
        <div
          aria-hidden
          className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full opacity-[0.18] pointer-events-none"
          style={{ background: "var(--accent)" }}
        />

        <div className="relative z-10 flex flex-col items-center gap-10 text-center">
          {/* Logo — AUTO[DIASPORA] */}
          <h1 className="font-sans font-black uppercase leading-none text-5xl sm:text-7xl md:text-8xl tracking-[-0.05em]">
            <span>AUTO</span>
            <span className="bg-accent text-white px-2 sm:px-3 ml-1 inline-block">
              DIASPORA
            </span>
          </h1>

          {/* Tagline */}
          <p className="font-sans font-medium max-w-xl text-base sm:text-lg text-ink-muted">
            Маркетплейс перевірених авто з Європи для української та
            російськомовної діаспори.
          </p>

          {/* Day indicator block */}
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="bg-bg-dark text-white px-3 py-1.5">
              Day 1 / 7
            </span>
            <span className="text-ink-muted">Foundation · Setup</span>
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <footer className="border-t-2 border-ink py-4 px-6 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-muted flex justify-between">
        <span>© 2026 Auto Diaspora</span>
        <span>NL · KVK pending</span>
      </footer>
    </main>
  );
}
