"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, BookOpen, Users, Microscope, Globe, ChevronDown } from "lucide-react";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

const FACULTIES = [
  "Science", "Humanities", "Commerce",
  "Engineering", "Medicine", "Arts & Design"
];

const SAMPLE_SEARCHES = [
  "macaques", "quantum entanglement", "postcolonial theory",
  "CRISPR", "Keynesian economics", "phenomenology",
  "dark matter", "linguistic relativity"
];

function NavAuth() {
  const { isSignedIn } = useAuth();
  if (isSignedIn) {
    return <UserButton afterSignOutUrl="/" />;
  }
  return (
    <>
      <SignInButton mode="modal">
        <button className="text-sm text-white/50 hover:text-white transition-colors px-4 py-2">
          Sign in
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="text-sm bg-[#6C63FF] hover:bg-[#7c74ff] transition-colors text-white px-4 py-2 rounded-lg font-medium">
          Join V44V
        </button>
      </SignUpButton>
    </>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [particles, setParticles] = useState<{ x: number; y: number; size: number; duration: number; delay: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(i => (i + 1) % SAMPLE_SEARCHES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const generated = Array.from({ length: 24 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 4,
    }));
    setParticles(generated);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <main className="min-h-screen bg-[#080810] text-[#e8e8e8] overflow-x-hidden font-sans relative">

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#6C63FF] opacity-[0.07] blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#00d4ff] opacity-[0.05] blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#6C63FF] opacity-[0.03] blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#6C63FF 1px, transparent 1px), linear-gradient(90deg, #6C63FF 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#6C63FF]"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: 0.3 }}
            animate={{ y: [0, -30, 0], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/[0.04]"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-[#6C63FF] flex items-center justify-center">
              <span className="text-white font-bold text-xs tracking-wider">V4</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded bg-[#080810] border border-[#6C63FF]/40 flex items-center justify-center">
              <span className="text-[#6C63FF] font-bold" style={{ fontSize: "7px" }}>4V</span>
            </div>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white">V44V</span>
            <span className="text-[10px] text-[#6C63FF]/70 ml-2 font-light tracking-widest">विचार</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/40">
          <a href="#" className="hover:text-white/80 transition-colors">Explore</a>
          <a href="#" className="hover:text-white/80 transition-colors">Spaces</a>
          <a href="#" className="hover:text-white/80 transition-colors">About</a>
        </div>

        <div className="flex items-center gap-3">
          <NavAuth />
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[88vh] px-6 text-center">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#6C63FF]/30 bg-[#6C63FF]/10 text-[#a89fff] text-xs tracking-widest uppercase"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] animate-pulse" />
          Open Source · Research · Community
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="mb-6"
        >
          <h1
            className="text-6xl md:text-8xl font-bold leading-none tracking-tight mb-2"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            <span className="text-white">Where thought</span>
          </h1>
          <h1
            className="text-6xl md:text-8xl font-bold leading-none tracking-tight"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #6C63FF 0%, #a89fff 50%, #00d4ff 100%)" }}
            >
              meets its reflection
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.8 }}
          className="text-white/40 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed"
          style={{ fontFamily: "Georgia, serif" }}
        >
          A federated space for researchers and curious minds. Search 250M+ papers.
          Discuss ideas. Build knowledge — together.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="w-full max-w-2xl mb-6"
        >
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-0 rounded-2xl bg-[#6C63FF] opacity-20 blur-xl group-focus-within:opacity-40 transition-opacity duration-500" />
            <div className="relative flex items-center bg-[#0f0f1a] border border-white/10 group-focus-within:border-[#6C63FF]/60 rounded-2xl px-6 py-4 transition-all duration-300">
              <Search className="w-5 h-5 text-white/30 group-focus-within:text-[#6C63FF] transition-colors mr-4 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-white/20 outline-none text-lg"
                placeholder={`Search "${SAMPLE_SEARCHES[placeholderIndex]}"...`}
              />
              <button
                type="submit"
                className="ml-4 shrink-0 bg-[#6C63FF] hover:bg-[#7c74ff] transition-colors text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2"
              >
                Search <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>

        {/* Faculty pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-2 mb-16"
        >
          <span className="text-white/20 text-xs mr-1 self-center">Browse by faculty:</span>
          {FACULTIES.map((f, i) => (
            <motion.button
              key={f}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + i * 0.05 }}
              className="px-3 py-1 text-xs rounded-full border border-white/10 text-white/40 hover:border-[#6C63FF]/50 hover:text-[#a89fff] hover:bg-[#6C63FF]/10 transition-all duration-200"
            >
              {f}
            </motion.button>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="grid grid-cols-3 gap-12 mb-16"
        >
          {[
            { value: "250M+", label: "Research Papers" },
            { value: "Open", label: "Source & Free" },
            { value: "∞", label: "Curious Minds" },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1" style={{ fontFamily: "Georgia, serif" }}>
                {stat.value}
              </div>
              <div className="text-white/30 text-xs tracking-widest uppercase">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-white/20"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 py-32 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <p className="text-[#6C63FF] text-xs tracking-widest uppercase mb-4">How V44V works</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
            Search. Read. Discuss.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Search className="w-6 h-6" />,
              step: "01",
              title: "Search any topic",
              desc: "Real-time search across 250M+ papers from OpenAlex, Semantic Scholar, arXiv and more. No paywalls. No gatekeeping."
            },
            {
              icon: <Microscope className="w-6 h-6" />,
              step: "02",
              title: "AI builds the wiki",
              desc: "Every search generates a live knowledge summary — a dynamic overview of the topic built from the top research in real time."
            },
            {
              icon: <Users className="w-6 h-6" />,
              step: "03",
              title: "Join the discussion",
              desc: "Every paper has a discussion space. Researchers bring credentials. Enthusiasts bring curiosity. Both are welcome."
            },
          ].map((card, i) => (
            <motion.div
              key={card.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="relative group"
            >
              <div className="absolute inset-0 rounded-2xl bg-[#6C63FF] opacity-0 group-hover:opacity-5 transition-opacity duration-500 blur-xl" />
              <div className="relative bg-[#0f0f1a] border border-white/[0.06] group-hover:border-[#6C63FF]/30 rounded-2xl p-8 transition-all duration-300 h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center text-[#6C63FF]">
                    {card.icon}
                  </div>
                  <span className="text-white/10 font-bold text-4xl" style={{ fontFamily: "Georgia, serif" }}>{card.step}</span>
                </div>
                <h3 className="text-white font-semibold text-xl mb-3">{card.title}</h3>
                <p className="text-white/40 leading-relaxed text-sm">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* For everyone */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] bg-[#0a0a14] p-16 text-center">
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, #6C63FF22 0%, transparent 70%)" }}
            />
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <p className="text-[#6C63FF] text-xs tracking-widest uppercase mb-6">Built for everyone</p>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "Georgia, serif" }}>
                  Research without walls
                </h2>
                <p className="text-white/40 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                  V44V brings researchers and enthusiasts to the same table.
                  Your feed stays focused on your field — Science, Humanities, Commerce and beyond.
                  The search bar opens everything.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-[#6C63FF] hover:bg-[#7c74ff] transition-colors text-white px-8 py-3.5 rounded-xl font-medium flex items-center gap-2 justify-center">
                    <Globe className="w-4 h-4" /> Join as Enthusiast
                  </button>
                  <button className="border border-white/10 hover:border-[#6C63FF]/50 hover:bg-[#6C63FF]/10 transition-all text-white/70 hover:text-white px-8 py-3.5 rounded-xl font-medium flex items-center gap-2 justify-center">
                    <BookOpen className="w-4 h-4" /> Verify as Researcher
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] px-8 py-10 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white/60 font-semibold">V44V</span>
            <span className="text-white/20 text-sm">— विचार mirrored</span>
          </div>
          <div className="flex gap-6 text-sm text-white/25">
            <a href="#" className="hover:text-white/60 transition-colors">GitHub</a>
            <a href="#" className="hover:text-white/60 transition-colors">License</a>
            <a href="#" className="hover:text-white/60 transition-colors">About</a>
          </div>
          <div className="text-white/15 text-xs">AGPL-3.0 · Open Source · Built for thought</div>
        </div>
      </footer>
    </main>
  );
}
