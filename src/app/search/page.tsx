"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowLeft, ExternalLink, Users,
  Calendar, BookOpen, Quote, Tag, Loader2,
  ChevronLeft, ChevronRight, Lock, Unlock
} from "lucide-react";

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

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [papers, setPapers] = useState<Paper[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState(query);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

  useEffect(() => {
    if (!query) return;
    fetchPapers(query, 1);
  }, [query]);

  const fetchPapers = async (q: string, p: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&page=${p}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPapers(data.results);
      setTotal(data.total);
      setPage(p);
      setSelectedPaper(data.results[0] || null);
    } catch (e) {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchInput)}`;
    }
  };

  const totalPages = Math.min(Math.ceil(total / 10), 50);

  return (
    <main className="min-h-screen bg-[#080810] text-[#e8e8e8]">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 bg-[#080810]/90 backdrop-blur-md border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">

          {/* Logo back */}
          <a href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-7 h-7 rounded-lg bg-[#6C63FF] flex items-center justify-center">
              <span className="text-white font-bold text-xs">V4</span>
            </div>
            <ArrowLeft className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
          </a>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative flex items-center bg-[#0f0f1a] border border-white/10 focus-within:border-[#6C63FF]/50 rounded-xl px-4 py-2.5 transition-all">
              <Search className="w-4 h-4 text-white/30 mr-3 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-white/20 outline-none text-sm"
                placeholder="Search research papers..."
              />
              <button
                type="submit"
                className="ml-2 bg-[#6C63FF] hover:bg-[#7c74ff] text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Result count */}
          {!loading && total > 0 && (
            <div className="text-white/30 text-sm shrink-0">
              {total.toLocaleString()} results
            </div>
          )}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Query heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Results for{" "}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #6C63FF, #a89fff)" }}
            >
              "{query}"
            </span>
          </h1>
          {!loading && (
            <p className="text-white/30 text-sm">
              Showing page {page} of {totalPages} — powered by OpenAlex
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 text-[#6C63FF] animate-spin" />
            <p className="text-white/30 text-sm">Searching 250M+ papers...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-32">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => fetchPapers(query, 1)}
              className="text-[#6C63FF] hover:underline text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results grid */}
        {!loading && !error && papers.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

            {/* ── Left: Paper list ── */}
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {papers.map((paper, i) => (
                  <motion.div
                    key={paper.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    onClick={() => setSelectedPaper(paper)}
                    className={`relative group cursor-pointer rounded-2xl border p-6 transition-all duration-300 ${
                      selectedPaper?.id === paper.id
                        ? "bg-[#0f0f1a] border-[#6C63FF]/50 shadow-lg shadow-[#6C63FF]/5"
                        : "bg-[#0a0a12] border-white/[0.05] hover:border-white/15"
                    }`}
                  >
                    {/* Open access badge */}
                    <div className="flex items-start justify-between gap-4 mb-3">
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
                      <span className="text-white/20 text-xs shrink-0 flex items-center gap-1">
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
                    <p className="text-white/35 text-sm leading-relaxed line-clamp-3 mb-4">
                      {paper.abstract}
                    </p>

                    {/* Topics + Journal */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex gap-1.5 flex-wrap">
                        {paper.topics.map(t => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#6C63FF]/10 text-[#a89fff] border border-[#6C63FF]/20">
                            {t}
                          </span>
                        ))}
                      </div>
                      {paper.journal && (
                        <span className="text-white/25 text-xs flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span className="line-clamp-1 max-w-[140px]">{paper.journal}</span>
                        </span>
                      )}
                    </div>

                    {/* Selected indicator */}
                    {selectedPaper?.id === paper.id && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-12 bg-[#6C63FF] rounded-full" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6">
                  <button
                    onClick={() => fetchPapers(query, page - 1)}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border border-white/10 text-white/40 hover:border-[#6C63FF]/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <span className="text-white/30 text-sm">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => fetchPapers(query, page + 1)}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border border-white/10 text-white/40 hover:border-[#6C63FF]/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* ── Right: Paper detail panel ── */}
            <div className="lg:sticky lg:top-24 h-fit">
              <AnimatePresence mode="wait">
                {selectedPaper && (
                  <motion.div
                    key={selectedPaper.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#0a0a14] border border-white/[0.06] rounded-2xl p-6"
                  >
                    {/* Header */}
                    <div className="mb-5 pb-5 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2 mb-3">
                        {selectedPaper.openAccess ? (
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                            <Unlock className="w-2.5 h-2.5" /> Open Access
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/10">
                            <Lock className="w-2.5 h-2.5" /> Paywalled
                          </span>
                        )}
                        {selectedPaper.year && (
                          <span className="text-white/30 text-xs">{selectedPaper.year}</span>
                        )}
                      </div>
                      <h2 className="text-white font-semibold text-lg leading-snug mb-3"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        {selectedPaper.title}
                      </h2>
                      {selectedPaper.authors.length > 0 && (
                        <p className="text-[#a89fff] text-sm">
                          {selectedPaper.authors.join(", ")}
                          {selectedPaper.authors.length >= 3 ? " et al." : ""}
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                        <div className="text-white font-bold text-xl">{selectedPaper.citations.toLocaleString()}</div>
                        <div className="text-white/30 text-xs mt-0.5">Citations</div>
                      </div>
                      <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                        <div className="text-white font-bold text-xl">{selectedPaper.year || "—"}</div>
                        <div className="text-white/30 text-xs mt-0.5">Published</div>
                      </div>
                    </div>

                    {/* Journal */}
                    {selectedPaper.journal && (
                      <div className="flex items-center gap-2 mb-5 text-sm">
                        <BookOpen className="w-4 h-4 text-white/30 shrink-0" />
                        <span className="text-white/50">{selectedPaper.journal}</span>
                      </div>
                    )}

                    {/* Abstract */}
                    <div className="mb-5">
                      <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Abstract</p>
                      <p className="text-white/55 text-sm leading-relaxed">
                        {selectedPaper.abstract}
                      </p>
                    </div>

                    {/* Topics */}
                    {selectedPaper.topics.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Topics</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedPaper.topics.map(t => (
                            <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-[#6C63FF]/10 text-[#a89fff] border border-[#6C63FF]/20">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {selectedPaper.doi && (
                        <a
                          href={`https://doi.org/${selectedPaper.doi.replace("https://doi.org/", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-[#6C63FF] hover:bg-[#7c74ff] transition-colors text-white px-4 py-2.5 rounded-xl text-sm font-medium"
                        >
                          <ExternalLink className="w-4 h-4" /> View Paper
                        </a>
                      )}
                      <button className="flex items-center justify-center gap-2 border border-white/10 hover:border-[#6C63FF]/40 hover:bg-[#6C63FF]/5 transition-all text-white/60 hover:text-white px-4 py-2.5 rounded-xl text-sm">
                        💬 Discuss on V44V
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* No results */}
        {!loading && !error && papers.length === 0 && (
          <div className="text-center py-32">
            <p className="text-white/30 text-lg mb-2">No results found for "{query}"</p>
            <p className="text-white/20 text-sm">Try a different search term</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6C63FF] animate-spin" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
