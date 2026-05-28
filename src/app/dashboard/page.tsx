"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, BookOpen, Users, Quote, Calendar, Unlock, Lock, Sparkles, LogOut, Settings, ChevronRight, Flame, Clock } from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface Paper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  year: number;
  journal: string | null;
  citations: number;
  openAccess: boolean;
  doi: string | null;
  topics: string[];
}

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"feed" | "trending">("feed");

  const faculty = typeof window !== "undefined" ? localStorage.getItem("v44v_faculty") || "" : "";
  const branch = typeof window !== "undefined" ? localStorage.getItem("v44v_branch") || "" : "";
  const niches = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("v44v_niches") || "[]") : [];
  const isSkipped = typeof window !== "undefined" ? localStorage.getItem("v44v_onboarded") === "skipped" : false;

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    fetchFeed();
  }, [isLoaded, isSignedIn, activeTab]);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      let query = "research";
      if (!isSkipped && niches.length > 0 && activeTab === "feed") {
        query = niches[0];
      } else if (!isSkipped && branch && activeTab === "feed") {
        query = branch;
      } else if (!isSkipped && faculty && activeTab === "feed") {
        query = faculty;
      }
      if (activeTab === "trending") {
        query = faculty || "science";
      }
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=1`);
      const data = await res.json();
      setPapers(data.results || []);
    } catch (e) {
      console.error("Feed error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-[#080810] text-[#e8e8e8]">

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#6C63FF] opacity-[0.05] blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full bg-[#00d4ff] opacity-[0.03] blur-[80px]" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-[#080810]/90 backdrop-blur-md border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-[#6C63FF] flex items-center justify-center">
                <span className="text-white font-bold text-xs">V4</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded bg-[#080810] border border-[#6C63FF]/40 flex items-center justify-center">
                <span className="text-[#6C63FF] font-bold" style={{ fontSize: "5px" }}>4V</span>
              </div>
            </div>
            <span className="font-bold text-white hidden sm:block">V44V</span>
          </a>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative flex items-center bg-[#0f0f1a] border border-white/10 focus-within:border-[#6C63FF]/50 rounded-xl px-4 py-2.5 transition-all">
              <Search className="w-4 h-4 text-white/30 mr-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-white/20 outline-none text-sm"
                placeholder="Search 250M+ papers..."
              />
              <button type="submit" className="ml-2 bg-[#6C63FF] hover:bg-[#7c74ff] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                Search
              </button>
            </div>
          </form>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-white/30">
            <button onClick={() => router.push("/onboarding")} className="hover:text-white/60 transition-colors flex items-center gap-1">
              <Settings className="w-3.5 h-3.5" /> Preferences
            </button>
          </div>

          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">

          {/* Left — Feed */}
          <div>

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Georgia, serif" }}>
                {isSkipped ? "Explore Research" : (
                  niches.length > 0 ? niches.join(", ") :
                  branch ? branch :
                  faculty ? faculty : "Your Feed"
                )}
              </h1>
              <p className="text-white/30 text-sm">
                {isSkipped
                  ? "Showing trending research across all fields"
                  : `Personalised for your interests · ${faculty || "All fields"}`
                }
                {isSkipped && (
                  <button onClick={() => router.push("/onboarding")} className="ml-2 text-[#6C63FF] hover:underline">
                    Set preferences →
                  </button>
                )}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 bg-white/[0.03] rounded-xl p-1 w-fit">
              <button
                onClick={() => setActiveTab("feed")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "feed"
                    ? "bg-[#6C63FF] text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> My Feed
              </button>
              <button
                onClick={() => setActiveTab("trending")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "trending"
                    ? "bg-[#6C63FF] text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                <Flame className="w-3.5 h-3.5" /> Trending
              </button>
            </div>

            {/* Papers */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-[#0a0a12] border border-white/[0.05] rounded-2xl p-6 animate-pulse">
                    <div className="h-4 bg-white/5 rounded mb-3 w-3/4" />
                    <div className="h-3 bg-white/5 rounded mb-2 w-1/2" />
                    <div className="h-3 bg-white/5 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {papers.map((paper, i) => (
                  <motion.div
                    key={paper.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="group bg-[#0a0a12] border border-white/[0.05] hover:border-white/15 rounded-2xl p-6 transition-all duration-300 cursor-pointer"
                    onClick={() => router.push(`/search?q=${encodeURIComponent(paper.topics[0] || paper.title)}`)}
                  >
                    {/* Badges */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {paper.openAccess ? (
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                            <Unlock className="w-2.5 h-2.5" /> Open Access
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/10">
                            <Lock className="w-2.5 h-2.5" /> Paywalled
                          </span>
                        )}
                        {paper.year && (
                          <span className="flex items-center gap-1 text-[10px] text-white/30">
                            <Calendar className="w-2.5 h-2.5" /> {paper.year}
                          </span>
                        )}
                      </div>
                      <span className="text-white/20 text-xs flex items-center gap-1">
                        <Quote className="w-3 h-3" /> {paper.citations}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-white font-semibold text-base leading-snug mb-2 group-hover:text-[#a89fff] transition-colors line-clamp-2">
                      {paper.title}
                    </h3>

                    {/* Authors */}
                    {paper.authors.length > 0 && (
                      <div className="flex items-center gap-1.5 mb-3 text-white/40 text-xs">
                        <Users className="w-3 h-3 shrink-0" />
                        <span className="line-clamp-1">{paper.authors.join(", ")}{paper.authors.length >= 3 ? " et al." : ""}</span>
                      </div>
                    )}

                    {/* Abstract */}
                    <p className="text-white/35 text-sm leading-relaxed line-clamp-2 mb-4">
                      {paper.abstract}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5 flex-wrap">
                        {paper.topics.slice(0, 2).map(t => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#6C63FF]/10 text-[#a89fff] border border-[#6C63FF]/20">
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        {paper.journal && (
                          <span className="text-white/25 text-xs flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            <span className="line-clamp-1 max-w-[100px]">{paper.journal}</span>
                          </span>
                        )}
                        <span className="text-[#6C63FF]/60 text-xs flex items-center gap-1 group-hover:text-[#6C63FF] transition-colors">
                          View <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-4">

            {/* Profile card */}
            <div className="bg-[#0a0a14] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <UserButton afterSignOutUrl="/" />
                <div>
                  <p className="text-white text-sm font-medium">Your Profile</p>
                  <p className="text-white/30 text-xs">V44V Member</p>
                </div>
              </div>
              {!isSkipped && faculty && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/30">Faculty</span>
                    <span className="text-[#a89fff]">{faculty}</span>
                  </div>
                  {branch && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/30">Branch</span>
                      <span className="text-[#a89fff]">{branch}</span>
                    </div>
                  )}
                  {niches.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {niches.map((n: string) => (
                        <span key={n} className="text-[10px] px-2 py-0.5 rounded-full bg-[#6C63FF]/10 text-[#a89fff] border border-[#6C63FF]/20">
                          {n}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => router.push("/onboarding")}
                className="mt-4 w-full text-xs text-white/30 hover:text-white/60 transition-colors flex items-center justify-center gap-1"
              >
                <Settings className="w-3 h-3" /> Edit preferences
              </button>
            </div>

            {/* Quick search suggestions */}
            <div className="bg-[#0a0a14] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#6C63FF]" />
                <span className="text-white/60 text-sm font-medium">Explore Topics</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "CRISPR", "Dark Matter", "Postcolonialism",
                  "Quantum Computing", "Climate Change",
                  "Neural Networks", "Linguistics", "Genomics"
                ].map(topic => (
                  <button
                    key={topic}
                    onClick={() => router.push(`/search?q=${encodeURIComponent(topic)}`)}
                    className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/40 hover:border-[#6C63FF]/40 hover:text-[#a89fff] hover:bg-[#6C63FF]/5 transition-all"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Coming soon */}
            <div className="bg-[#0a0a14] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-white/30" />
                <span className="text-white/30 text-sm">Coming Soon</span>
              </div>
              <div className="space-y-2 text-xs text-white/20">
                <p>💬 Discussion spaces</p>
                <p>📄 Upload your research</p>
                <p>🔬 Researcher verification</p>
                <p>📊 Citation tracking</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
