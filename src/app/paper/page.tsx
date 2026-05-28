"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Users, Calendar, Quote, BookOpen, Unlock, Lock, MessageCircle, Sparkles, Loader2, Tag } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

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

function PaperContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paperId = searchParams.get("id") || "";
  const doi = searchParams.get("doi") || "";
  const title = searchParams.get("title") || "";

  const [paper, setPaper] = useState<Paper | null>(null);
  const [wiki, setWiki] = useState("");
  const [wikiLoading, setWikiLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!title) return;
    fetchPaper();
  }, [title]);

  const fetchPaper = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(title)}&page=1`);
      const data = await res.json();
      const found = data.results?.find((p: Paper) =>
        p.title.toLowerCase() === title.toLowerCase() ||
        p.doi === doi
      ) || data.results?.[0];
      if (found) {
        setPaper(found);
        generateWiki(found);
      }
    } catch (e) {
      console.error("Paper fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const generateWiki = async (p: Paper) => {
    setWikiLoading(true);
    try {
      const res = await fetch("/api/wiki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: p.title, papers: [p] }),
      });
      const data = await res.json();
      if (data.wiki) setWiki(data.wiki);
    } catch (e) {
      console.error("Wiki error:", e);
    } finally {
      setWikiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#6C63FF] animate-spin" />
          <p className="text-white/30 text-sm">Loading paper...</p>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/30 mb-4">Paper not found</p>
          <button onClick={() => router.back()} className="text-[#6C63FF] hover:underline text-sm">Go back</button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#080810] text-[#e8e8e8]">

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#6C63FF] opacity-[0.05] blur-[100px]" />
      </div>

      {/* Nav */}
      <div className="sticky top-0 z-20 bg-[#080810]/90 backdrop-blur-md border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex-1 text-white/30 text-xs line-clamp-1">{paper.title}</div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">

          {/* Left — Main content */}
          <div>

            {/* Paper header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {paper.openAccess ? (
                  <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    <Unlock className="w-3 h-3" /> Open Access
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-white/5 text-white/40 border border-white/10">
                    <Lock className="w-3 h-3" /> Paywalled
                  </span>
                )}
                {paper.year && (
                  <span className="flex items-center gap-1 text-xs text-white/30">
                    <Calendar className="w-3 h-3" /> {paper.year}
                  </span>
                )}
                {paper.journal && (
                  <span className="flex items-center gap-1 text-xs text-white/30">
                    <BookOpen className="w-3 h-3" /> {paper.journal}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1
                className="text-3xl font-bold text-white leading-snug mb-4"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {paper.title}
              </h1>

              {/* Authors */}
              {paper.authors.length > 0 && (
                <div className="flex items-center gap-2 text-[#a89fff] mb-4">
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="text-sm">{paper.authors.join(", ")}{paper.authors.length >= 3 ? " et al." : ""}</span>
                </div>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-6 text-sm text-white/30">
                <span className="flex items-center gap-1.5">
                  <Quote className="w-4 h-4" />
                  {paper.citations.toLocaleString()} citations
                </span>
                {paper.doi && (
                  <span className="flex items-center gap-1.5 text-xs font-mono text-white/20">
                    DOI: {paper.doi.replace("https://doi.org/", "")}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Abstract */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="bg-[#0a0a14] border border-white/[0.06] rounded-2xl p-6 mb-6"
            >
              <h2 className="text-white/50 text-xs uppercase tracking-widest mb-4">Abstract</h2>
              <p className="text-white/70 leading-relaxed text-sm">{paper.abstract}</p>
            </motion.div>

            {/* Topics */}
            {paper.topics.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="bg-[#0a0a14] border border-white/[0.06] rounded-2xl p-6 mb-6"
              >
                <h2 className="text-white/50 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" /> Topics
                </h2>
                <div className="flex flex-wrap gap-2">
                  {paper.topics.map(t => (
                    <button
                      key={t}
                      onClick={() => router.push(`/search?q=${encodeURIComponent(t)}`)}
                      className="text-sm px-3 py-1.5 rounded-full bg-[#6C63FF]/10 text-[#a89fff] border border-[#6C63FF]/20 hover:bg-[#6C63FF]/20 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* AI Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="bg-[#0a0a14] border border-[#6C63FF]/20 rounded-2xl p-6 mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#6C63FF]" />
                <h2 className="text-white/60 text-sm font-medium">AI Overview</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6C63FF]/10 text-[#a89fff] border border-[#6C63FF]/20 ml-auto">
                  Generated by V44V
                </span>
              </div>

              {wikiLoading ? (
                <div className="flex items-center gap-2 text-white/30 text-sm py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#6C63FF]" />
                  Generating overview...
                </div>
              ) : wiki ? (
                <div className="space-y-3">
                  {wiki.split("\n\n").filter(Boolean).map((para, i) => (
                    <p key={i} className="text-white/55 text-sm leading-relaxed">{para}</p>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-sm italic">Overview unavailable.</p>
              )}
            </motion.div>

            {/* Discussion CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-[#0a0a14] border border-white/[0.06] rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4 text-white/40" />
                <h2 className="text-white/60 text-sm font-medium">Discussion</h2>
              </div>
              <p className="text-white/30 text-sm mb-4">
                Join the community discussion about this paper on V44V.
              </p>
              <button
                onClick={() => router.push(`/discussion?topic=${encodeURIComponent(paper.title)}&title=${encodeURIComponent(paper.title)}`)}
                className="w-full flex items-center justify-center gap-2 border border-[#6C63FF]/30 hover:border-[#6C63FF]/60 hover:bg-[#6C63FF]/5 transition-all text-[#a89fff] px-4 py-3 rounded-xl text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4" /> Open Discussion Space
              </button>
            </motion.div>
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-4">

            {/* Read paper card */}
            <div className="bg-[#0a0a14] border border-white/[0.06] rounded-2xl p-5 sticky top-24">
              <h3 className="text-white/50 text-xs uppercase tracking-widest mb-4">Access Paper</h3>

              {paper.openAccess ? (
                <div className="mb-4 p-3 rounded-xl bg-green-500/5 border border-green-500/15">
                  <p className="text-green-400 text-xs flex items-center gap-1.5">
                    <Unlock className="w-3.5 h-3.5" /> This paper is freely available
                  </p>
                </div>
              ) : (
                <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <p className="text-white/30 text-xs flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Paywalled — check your institution
                  </p>
                </div>
              )}

              {paper.doi && (
                <a
                  href={`https://doi.org/${paper.doi.replace("https://doi.org/", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#6C63FF] hover:bg-[#7c74ff] transition-colors text-white px-4 py-3 rounded-xl text-sm font-medium mb-3"
                >
                  <ExternalLink className="w-4 h-4" /> Read Full Paper
                </a>
              )}

              <a
                href={`https://scholar.google.com/scholar?q=${encodeURIComponent(paper.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 border border-white/10 hover:border-white/25 transition-colors text-white/50 hover:text-white px-4 py-2.5 rounded-xl text-sm mb-2"
              >
                Search Google Scholar
              </a>

              <a
                href={`https://unpaywall.org/${paper.doi?.replace("https://doi.org/", "") || ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 border border-white/10 hover:border-white/25 transition-colors text-white/50 hover:text-white px-4 py-2.5 rounded-xl text-sm"
              >
                Find Free Version
              </a>

              <p className="text-white/15 text-xs text-center mt-3">
                V44V never hosts copyrighted papers
              </p>
            </div>

            {/* Citation info */}
            <div className="bg-[#0a0a14] border border-white/[0.06] rounded-2xl p-5">
              <h3 className="text-white/50 text-xs uppercase tracking-widest mb-4">Citation Info</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/30 text-xs">Times Cited</span>
                  <span className="text-white font-bold">{paper.citations.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/30 text-xs">Published</span>
                  <span className="text-white/70 text-xs">{paper.year || "Unknown"}</span>
                </div>
                {paper.journal && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/30 text-xs">Journal</span>
                    <span className="text-white/70 text-xs text-right max-w-[140px] line-clamp-2">{paper.journal}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaperPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6C63FF] animate-spin" />
      </div>
    }>
      <PaperContent />
    </Suspense>
  );
}
