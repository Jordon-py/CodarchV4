import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Archive,
  Sparkles,
  ShieldCheck,
  Search,
  Clock,
  Link as LinkIcon,
  Check,
  ArrowRight,
} from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function GlowBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute top-40 -left-24 h-[520px] w-[520px] rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-[-220px] right-[-180px] h-[640px] w-[640px] rounded-full bg-white/10 blur-3xl" />

      <div
        className={cn(
          "absolute inset-0 opacity-[0.18]",
          "bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)]",
          "bg-[size:42px_42px]"
        )}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_70%,rgba(0,0,0,0.9)_100%)]" />
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
      {children}
    </span>
  );
}

function PrimaryButton({ children, onClick, className, type = "button", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5",
        "bg-white text-black shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_20px_60px_-30px_rgba(255,255,255,0.35)]",
        "transition hover:translate-y-[-1px] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_25px_70px_-35px_rgba(255,255,255,0.45)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-0",
        className
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

function GhostButton({
  children,
  onClick,
  className,
  ariaLabel,
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5",
        "border border-white/10 bg-white/5 text-white/90 backdrop-blur",
        "transition hover:bg-white/10 active:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-0",
        className
      )}
    >
      {children}
    </button>
  );
}

function Card({ children, className }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}

export default function Page() {
  const motionRuntimeReady = Boolean(motion);
  const [isAuthed, setIsAuthed] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("Starter");
  const [snippets, setSnippets] = useState([]);
  const [isVaultLoading, setIsVaultLoading] = useState(false);
  const [vaultError, setVaultError] = useState("");
  const [entryError, setEntryError] = useState("");
  const [entryStatus, setEntryStatus] = useState("");
  const [isSubmittingEntry, setIsSubmittingEntry] = useState(false);
  const [entryForm, setEntryForm] = useState({
    title: "",
    language: "JavaScript",
    code: "",
    version: 1,
    author: "",
  });
  const prefersReducedMotion = useReducedMotion();

  const reveal = useMemo(() => {
    return {
      hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 14 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
      },
    };
  }, [prefersReducedMotion]);

  const scrollToSection = useCallback(
    (id) => {
      const element = document.getElementById(id);
      if (!element) return;
      element.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    },
    [prefersReducedMotion]
  );

  const loadSnippets = useCallback(async () => {
    setIsVaultLoading(true);
    setVaultError("");
    try {
      const res = await fetch("/api/snippets?limit=12");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.error || "Failed to load archive.");
      }
      const data = await res.json();
      setSnippets(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      setVaultError(error.message || "Failed to load archive.");
    } finally {
      setIsVaultLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthed) {
      loadSnippets();
    }
  }, [isAuthed, loadSnippets]);

  const openNewEntry = useCallback(() => {
    setIsAuthed(true);
    setEntryStatus("");
    setEntryError("");
    scrollToSection("new-entry");
  }, [scrollToSection]);

  const openVault = useCallback(async () => {
    setIsAuthed(true);
    await loadSnippets();
    scrollToSection("vault");
  }, [loadSnippets, scrollToSection]);

  const handleEntryChange = (field, value) => {
    setEntryForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateEntry = async (event) => {
    event.preventDefault();
    setIsAuthed(true);
    setEntryError("");
    setEntryStatus("");
    setIsSubmittingEntry(true);

    const payload = {
      title: entryForm.title.trim(),
      language: entryForm.language,
      code: entryForm.code.trim(),
      version: Number(entryForm.version),
    };
    if (entryForm.author.trim()) {
      payload.author = entryForm.author.trim();
    }

    try {
      const res = await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.error || "Failed to create snippet.");
      }

      setEntryStatus("Snippet saved. Your vault is updated.");
      setEntryForm({
        title: "",
        language: entryForm.language,
        code: "",
        version: Number(entryForm.version) || 1,
        author: "",
      });
      await loadSnippets();
      scrollToSection("vault");
    } catch (error) {
      setEntryError(error.message || "Failed to create snippet.");
    } finally {
      setIsSubmittingEntry(false);
    }
  };

  const handleChoosePlan = (planName) => {
    setSelectedPlan(planName);
    openNewEntry();
  };

  const clearEntryForm = () => {
    setEntryForm({
      title: "",
      language: "JavaScript",
      code: "",
      version: 1,
      author: "",
    });
    setEntryError("");
    setEntryStatus("");
  };

  const heroRows =
    snippets.length > 0
      ? snippets.slice(0, 3).map((snippet) => ({
          key: snippet._id,
          k: snippet.language || "Snippet",
          v: snippet.title || "Untitled snippet",
        }))
      : [
          { key: "seed-1", k: "Snippet", v: "useDebounce hook + tests" },
          { key: "seed-2", k: "Decision", v: "Auth routes -> middleware guard" },
          { key: "seed-3", k: "Link", v: "Design tokens & spacing scale" },
        ];

  const features = [
    {
      icon: <Search className="h-5 w-5" />,
      title: "Instant recall",
      desc: "Search every snippet, decision, and link in seconds no more repo archaeology.",
    },
    {
      icon: <LinkIcon className="h-5 w-5" />,
      title: "Context preserved",
      desc: "Attach notes, sources, and rationale so future-you understands instantly.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Private by design",
      desc: "Your archive stays yours structure and permissions you can trust.",
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Faster shipping",
      desc: "Turn knowledge into momentum with a clean workflow that reduces thrash.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white" data-motion={motionRuntimeReady ? "on" : "off"}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>

      <div className="relative">
        <GlowBackdrop />

        <header className="relative z-10">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
                <Archive className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-wide">CodeArchive</div>
                <div className="text-xs text-white/60">A premium knowledge vault</div>
              </div>
            </div>

            <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
              <a className="transition hover:text-white" href="#vault">
                Vault
              </a>
              <a className="transition hover:text-white" href="#features">
                Features
              </a>
              <a className="transition hover:text-white" href="#workflow">
                Workflow
              </a>
              <a className="transition hover:text-white" href="#pricing">
                Pricing
              </a>
              <a className="transition hover:text-white" href="#faq">
                FAQ
              </a>
            </nav>

            <div className="flex items-center gap-2">
              {!isAuthed ? (
                <>
                  <GhostButton ariaLabel="Sign in" onClick={() => setIsAuthed(true)}>
                    Sign in
                  </GhostButton>
                  <PrimaryButton onClick={openNewEntry} className="hidden sm:inline-flex">
                    Get started
                  </PrimaryButton>
                </>
              ) : (
                <>
                  <Pill>
                    <Sparkles className="h-3.5 w-3.5" />
                    Signed in
                  </Pill>
                  <GhostButton ariaLabel="Sign out" onClick={() => setIsAuthed(false)}>
                    Sign out
                  </GhostButton>
                </>
              )}
            </div>
          </div>
        </header>

        <main id="main" className="relative z-10">
          <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10 md:pt-16">
            <div className="grid gap-10 md:grid-cols-12 md:items-center">
              <motion.div className="md:col-span-7" initial="hidden" animate="show" variants={reveal}>
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <Pill>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Premium-grade organization
                  </Pill>
                  <Pill>
                    <Clock className="h-3.5 w-3.5" />
                    Built for shipping speed
                  </Pill>
                </div>

                <motion.h1
                  className="text-balance text-4xl font-semibold tracking-tight md:text-6xl"
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
                >
                  <span className="block text-white/90">Your code memory,</span>

                  <motion.span
                    className={cn(
                      "mt-2 inline-block bg-[linear-gradient(90deg,rgba(255,255,255,0.85),rgba(255,255,255,0.35),rgba(255,255,255,0.85))] bg-[length:220%_100%] bg-clip-text text-transparent",
                      "drop-shadow-[0_0_25px_rgba(255,255,255,0.12)]"
                    )}
                    animate={
                      prefersReducedMotion
                        ? undefined
                        : { backgroundPosition: ["0% 0%", "200% 0%"] }
                    }
                    transition={
                      prefersReducedMotion
                        ? undefined
                        : { duration: 2.8, ease: "linear", repeat: Infinity }
                    }
                  >
                    CodeArchive
                  </motion.span>
                </motion.h1>

                <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/70 md:text-lg">
                  A premium landing experience with a clean auth toggle, subtle motion, and a dark,
                  glassy UI ready to wire into real authentication when you are.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <PrimaryButton onClick={openNewEntry}>Start archiving</PrimaryButton>
                  <GhostButton onClick={() => scrollToSection("features")}>
                    View features
                  </GhostButton>
                </div>

                <div className="mt-8 flex flex-wrap gap-3 text-xs text-white/60">
                  <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <Check className="h-4 w-4" /> Accessible focus states
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <Check className="h-4 w-4" /> No external images
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <Check className="h-4 w-4" /> Motion w/ reduced-motion support
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="md:col-span-5"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={reveal}
              >
                <Card className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_55%)] opacity-[0.10]" />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-white/90">Today&apos;s archive</div>
                      <Pill>
                        <Sparkles className="h-3.5 w-3.5" />
                        Premium
                      </Pill>
                    </div>

                    <div className="mt-4 space-y-3">
                      {heroRows.map((row) => (
                        <div
                          key={row.key}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3"
                        >
                          <div className="text-xs text-white/60">{row.k}</div>
                          <div className="text-sm text-white/85">{row.v}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex gap-2">
                      <GhostButton className="flex-1" onClick={openVault} disabled={isVaultLoading}>
                        Open vault
                      </GhostButton>
                      <PrimaryButton className="flex-1" onClick={openNewEntry}>
                        New entry
                      </PrimaryButton>
                    </div>

                    <p className="mt-4 text-xs leading-relaxed text-white/55">
                      CTA actions are now wired to a live vault and submit form. Sign in remains a
                      UI toggle until you connect your auth provider.
                    </p>
                  </div>
                </Card>
              </motion.div>
            </div>
          </section>

          <section id="vault" className="mx-auto w-full max-w-6xl px-6 pb-16">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={reveal}
            >
              <Card>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Vault</h2>
                    <p className="mt-2 text-sm text-white/70">
                      Live data from <code>/api/snippets</code>. Reload anytime.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill>{isAuthed ? "Connected" : "Guest mode"}</Pill>
                    <GhostButton onClick={loadSnippets} disabled={isVaultLoading}>
                      {isVaultLoading ? "Refreshing..." : "Refresh"}
                    </GhostButton>
                  </div>
                </div>

                {vaultError ? (
                  <div className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {vaultError}
                  </div>
                ) : null}

                {isVaultLoading ? (
                  <p className="mt-6 text-sm text-white/70">Loading snippets...</p>
                ) : snippets.length === 0 ? (
                  <div className="mt-6 rounded-xl border border-white/10 bg-black/30 px-4 py-6">
                    <p className="text-sm text-white/70">No snippets yet. Create your first entry.</p>
                    <div className="mt-4">
                      <PrimaryButton onClick={openNewEntry}>Create first entry</PrimaryButton>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {snippets.slice(0, 8).map((snippet) => (
                      <div
                        key={snippet._id}
                        className="rounded-xl border border-white/10 bg-black/30 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-base font-semibold text-white/90">
                            {snippet.title || "Untitled snippet"}
                          </div>
                          <Pill>{snippet.language || "Unknown"}</Pill>
                        </div>
                        <div className="mt-2 text-xs text-white/55">
                          Version {snippet.version ?? 1}
                        </div>
                        <pre className="mt-3 max-h-40 overflow-auto rounded-lg border border-white/10 bg-black/50 p-3 text-xs text-white/75">
                          {snippet.code || "// No code"}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </section>

          <section id="new-entry" className="mx-auto w-full max-w-6xl px-6 pb-16">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={reveal}
            >
              <Card>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">New Entry</h2>
                    <p className="mt-2 text-sm text-white/70">
                      Selected plan: <span className="text-white">{selectedPlan}</span>
                    </p>
                  </div>
                  <GhostButton onClick={() => scrollToSection("pricing")}>Back to pricing</GhostButton>
                </div>

                <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleCreateEntry}>
                  <label className="grid gap-2 text-sm">
                    <span className="text-white/75">Title</span>
                    <input
                      className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/20"
                      value={entryForm.title}
                      onChange={(event) => handleEntryChange("title", event.target.value)}
                      placeholder="Auth middleware guard"
                      minLength={4}
                      maxLength={40}
                      required
                    />
                  </label>

                  <label className="grid gap-2 text-sm">
                    <span className="text-white/75">Language</span>
                    <select
                      className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/20"
                      value={entryForm.language}
                      onChange={(event) => handleEntryChange("language", event.target.value)}
                    >
                      {["JavaScript", "Python", "HTML", "CSS", "Markdown"].map(
                        (language) => (
                          <option key={language} value={language} className="bg-black text-white">
                            {language}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm">
                    <span className="text-white/75">Version</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      max="999"
                      className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/20"
                      value={entryForm.version}
                      onChange={(event) => handleEntryChange("version", event.target.value)}
                      required
                    />
                  </label>

                  <label className="grid gap-2 text-sm">
                    <span className="text-white/75">Author (optional)</span>
                    <input
                      className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/20"
                      value={entryForm.author}
                      onChange={(event) => handleEntryChange("author", event.target.value)}
                      placeholder="Your name"
                    />
                  </label>

                  <label className="grid gap-2 text-sm md:col-span-2">
                    <span className="text-white/75">Code</span>
                    <textarea
                      className="min-h-44 rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-white outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/20"
                      value={entryForm.code}
                      onChange={(event) => handleEntryChange("code", event.target.value)}
                      placeholder="// your snippet"
                      minLength={6}
                      maxLength={5000}
                      required
                    />
                  </label>

                  <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                    <PrimaryButton type="submit" disabled={isSubmittingEntry}>
                      {isSubmittingEntry ? "Saving..." : "Save snippet"}
                    </PrimaryButton>
                    <GhostButton onClick={clearEntryForm} disabled={isSubmittingEntry}>
                      Clear form
                    </GhostButton>
                    <GhostButton onClick={openVault} disabled={isSubmittingEntry || isVaultLoading}>
                      {isVaultLoading ? "Loading vault..." : "Open vault"}
                    </GhostButton>
                  </div>

                  {entryError ? (
                    <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 md:col-span-2">
                      {entryError}
                    </p>
                  ) : null}
                  {entryStatus ? (
                    <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 md:col-span-2">
                      {entryStatus}
                    </p>
                  ) : null}
                </form>
              </Card>
            </motion.div>
          </section>

          <section id="features" className="mx-auto w-full max-w-6xl px-6 py-16">
            <motion.div
              className="mb-10"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={reveal}
            >
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Built to feel calm, fast, and expensive.
              </h2>
              <p className="mt-3 max-w-2xl text-white/70">
                Glass surfaces, soft borders, and subtle motion without bloated assets.
              </p>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={reveal}
                  transition={{ delay: prefersReducedMotion ? 0 : i * 0.06 }}
                >
                  <Card>
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                        {feature.icon}
                      </div>
                      <div>
                        <div className="text-base font-semibold">{feature.title}</div>
                        <p className="mt-1 text-sm leading-relaxed text-white/70">{feature.desc}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          <section id="workflow" className="mx-auto w-full max-w-6xl px-6 pb-16">
            <motion.div
              className="grid gap-4 md:grid-cols-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={reveal}
            >
              {[
                {
                  step: "01",
                  title: "Capture",
                  desc: "Save a snippet + a one-line why. Keep it effortless.",
                },
                {
                  step: "02",
                  title: "Organize",
                  desc: "Tag by project, concept, and risk level. Retrieve instantly.",
                },
                {
                  step: "03",
                  title: "Ship",
                  desc: "Reuse patterns with confidence. Less rework, more momentum.",
                },
              ].map((item) => (
                <Card key={item.step}>
                  <div className="text-xs text-white/55">{item.step}</div>
                  <div className="mt-2 text-lg font-semibold">{item.title}</div>
                  <p className="mt-2 text-sm text-white/70">{item.desc}</p>
                </Card>
              ))}
            </motion.div>
          </section>

          <section className="mx-auto w-full max-w-6xl px-6 pb-16">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={reveal}
            >
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(255,255,255,0.7),transparent_55%)] opacity-[0.12]" />
                <div className="relative">
                  <div className="text-sm text-white/70">What teams say</div>
                  <p className="mt-3 text-xl font-semibold leading-snug md:text-2xl">
                    We stopped losing decisions in Slack threads. CodeArchive became our single
                    source of truth.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/70">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-white/70" />
                      Lead Engineer
                    </span>
                    <span className="text-white/40">•</span>
                    <span>Product Platform Team</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </section>

          <section id="pricing" className="mx-auto w-full max-w-6xl px-6 pb-16">
            <motion.div
              className="mb-8"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={reveal}
            >
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Pricing</h2>
              <p className="mt-3 max-w-2xl text-white/70">
                Simple tiers for a demo page. Swap with your real plan structure later.
              </p>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  name: "Starter",
                  price: "$0",
                  perks: ["Local-only vault", "Basic search", "1 workspace"],
                },
                {
                  name: "Pro",
                  price: "$12",
                  perks: [
                    "Cloud sync",
                    "Advanced tags",
                    "Unlimited workspaces",
                    "Shareable links",
                  ],
                  featured: true,
                },
                {
                  name: "Team",
                  price: "$29",
                  perks: ["Role permissions", "Audit trail", "SSO-ready", "Admin controls"],
                },
              ].map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={reveal}
                  transition={{ delay: prefersReducedMotion ? 0 : i * 0.06 }}
                >
                  <Card
                    className={cn(
                      plan.featured &&
                        "border-white/20 bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.10)]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold">{plan.name}</div>
                      {plan.featured ? (
                        <Pill>
                          <Sparkles className="h-3.5 w-3.5" /> Most popular
                        </Pill>
                      ) : null}
                    </div>
                    <div className="mt-4 text-3xl font-semibold">
                      {plan.price}
                      <span className="text-sm font-normal text-white/60"> / mo</span>
                    </div>

                    <ul className="mt-5 space-y-2 text-sm text-white/70">
                      {plan.perks.map((perk) => (
                        <li key={perk} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 text-white/80" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6">
                      {plan.featured ? (
                        <PrimaryButton onClick={() => handleChoosePlan(plan.name)}>
                          Choose Pro
                        </PrimaryButton>
                      ) : (
                        <GhostButton onClick={() => handleChoosePlan(plan.name)}>
                          Choose {plan.name}
                        </GhostButton>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          <section id="faq" className="mx-auto w-full max-w-6xl px-6 pb-16">
            <motion.div
              className="grid gap-4 md:grid-cols-2"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={reveal}
            >
              <Card>
                <div className="text-base font-semibold">Is auth real here?</div>
                <p className="mt-2 text-sm text-white/70">
                  No this is a UI-only toggle. Wire the Sign In/Out handlers to your provider
                  (NextAuth, Clerk, Auth0) and replace state with session data.
                </p>
              </Card>
              <Card>
                <div className="text-base font-semibold">Does it work without images?</div>
                <p className="mt-2 text-sm text-white/70">
                  Yes. The premium look comes from gradients, borders, blur, and spacing not heavy
                  assets.
                </p>
              </Card>
            </motion.div>
          </section>

          <footer className="mx-auto w-full max-w-6xl px-6 pb-10">
            <div className="flex flex-col gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-white/60">
                © {new Date().getFullYear()} CodeArchive. All rights reserved.
              </div>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <a className="transition hover:text-white" href="#vault">
                  Vault
                </a>
                <a className="transition hover:text-white" href="#features">
                  Features
                </a>
                <a className="transition hover:text-white" href="#pricing">
                  Pricing
                </a>
                <a className="transition hover:text-white" href="#faq">
                  FAQ
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
