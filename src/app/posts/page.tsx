"use client";

import { useState as useLocalState } from "react";
import { MessageCircle, Send, ChevronDown, ChevronUp as ChevronUpIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, PenSquare, ChevronUp, Clock, Tag, Users, Loader2, Filter } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getGun } from "@/lib/gun";


interface Post {
  id: string;
  title: string;
  body: string;
  author: string;
  authorId: string;
  faculty: string;
  tags: string;
  timestamp: number;
  upvotes: number;
  type: string;
}

const FACULTIES = ["All", "Science", "Humanities", "Commerce", "Engineering", "Medicine", "Arts & Design", "General"];

export default function PostsPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const gun = getGun();
    if (!gun) return;

    const loaded: Record<string, Post> = {};

    gun.get("v44v-posts").map().on((data: any, key: string) => {
      if (!data || !data.title || !data.type) return;
      loaded[key] = { ...data, id: key };
      setPosts(
        Object.values(loaded)
          .sort((a, b) => b.timestamp - a.timestamp)
      );
      setLoading(false);
    });

    setTimeout(() => setLoading(false), 2000);

    return () => {
      gun.get("v44v-posts").map().off();
    };
  }, []);

  const upvote = (postId: string) => {
    if (!isSignedIn) return;
    const gun = getGun();
    if (!gun) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    gun.get("v44v-posts").get(postId).get("upvotes").put((post.upvotes || 0) + 1);
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filtered = posts.filter(p => {
    const matchFaculty = filter === "All" || p.faculty === filter;
    const matchSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFaculty && matchSearch;
  });

  return (
    <main className="min-h-screen bg-[#080810] text-[#e8e8e8]">

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[400px] h-[400px] rounded-full bg-[#6C63FF] opacity-[0.05] blur-[100px]" />
      </div>

      {/* Nav */}
      <div className="sticky top-0 z-20 bg-[#080810]/90 backdrop-blur-md border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-white/40 hover:text-white transition-colors text-sm flex items-center gap-2">
            ← Dashboard
          </button>

          <div className="flex-1 max-w-md">
            <div className="relative flex items-center bg-[#0f0f1a] border border-white/10 focus-within:border-[#6C63FF]/50 rounded-xl px-4 py-2 transition-all">
              <Search className="w-4 h-4 text-white/30 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="flex-1 bg-transparent text-white placeholder-white/20 outline-none text-sm"
              />
            </div>
          </div>

          {isSignedIn && (
            <button
              onClick={() => router.push("/post/new")}
              className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#7c74ff] transition-colors text-white px-4 py-2 rounded-xl text-sm font-medium"
            >
              <PenSquare className="w-4 h-4" /> New Post
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Georgia, serif" }}>
            Community Posts
          </h1>
          <p className="text-white/30 text-sm">Ideas, questions and insights from the V44V community</p>
        </div>

        {/* Faculty filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter className="w-3.5 h-3.5 text-white/30 shrink-0" />
          {FACULTIES.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full border text-xs whitespace-nowrap transition-all ${
                filter === f
                  ? "bg-[#6C63FF]/20 border-[#6C63FF] text-[#a89fff]"
                  : "bg-white/[0.03] border-white/10 text-white/40 hover:border-white/25"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-5 h-5 text-[#6C63FF] animate-spin" />
            <span className="text-white/30 text-sm">Loading posts...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <PenSquare className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm mb-2">No posts yet.</p>
            {isSignedIn && (
              <button
                onClick={() => router.push("/post/new")}
                className="text-[#6C63FF] hover:underline text-sm"
              >
                Be the first to post →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => router.push(`/post/${post.id}`)}
                  className="group bg-[#0a0a12] border border-white/[0.05] hover:border-white/15 rounded-2xl p-6 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start gap-4">

                    {/* Upvote */}
                    <button
                      onClick={() => upvote(post.id)}
                      className="flex flex-col items-center gap-1 text-white/25 hover:text-[#6C63FF] transition-colors shrink-0 pt-1"
                    >
                      <ChevronUp className="w-5 h-5" />
                      <span className="text-xs font-medium">{post.upvotes || 0}</span>
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {post.faculty && post.faculty !== "General" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6C63FF]/10 text-[#a89fff] border border-[#6C63FF]/20">
                            {post.faculty}
                          </span>
                        )}
                        <span className="text-white/20 text-xs flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {formatTime(post.timestamp)}
                        </span>
                        <span className="text-white/20 text-xs flex items-center gap-1">
                          <Users className="w-2.5 h-2.5" /> {post.author}
                        </span>
                      </div>

                      <h3 className="text-white font-semibold text-base leading-snug mb-2 group-hover:text-[#a89fff] transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-white/40 text-sm leading-relaxed line-clamp-3 mb-3">
                        {post.body}
                      </p>

                      {/* Tags */}
                      {post.tags && post.tags !== "[]" && (
                        <div className="flex flex-wrap gap-1.5">
                          {JSON.parse(post.tags).map((tag: string) => (
                            <span key={tag} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/10">
                              <Tag className="w-2 h-2" /> {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
