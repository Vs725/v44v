"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Users, BookOpen, PenSquare, Search, Loader2, Clock, ChevronUp, MessageCircle } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { getGun } from "@/lib/gun";

interface Space {
  id: string;
  name: string;
  description: string;
  faculty: string;
  branch: string;
  members: number;
}

interface Post {
  id: string;
  title: string;
  body: string;
  author: string;
  timestamp: number;
  upvotes: number;
  spaceId: string;
}

function SpaceContent() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const spaceId = params.id as string;

  const [space, setSpace] = useState<Space | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [joined, setJoined] = useState(false);

  const postsKey = `v44v-space-posts-${spaceId}`;

  useEffect(() => {
    const gun = getGun();
    if (!gun) return;

    // Load space
    gun.get("v44v-spaces").get(spaceId).on((data: any) => {
      if (data) setSpace({ ...data, id: spaceId });
      setLoading(false);
    });

    // Load posts
    const loaded: Record<string, Post> = {};
    gun.get(postsKey).map().on((data: any, key: string) => {
      if (!data || !data.title) return;
      loaded[key] = { ...data, id: key };
      setPosts(Object.values(loaded).sort((a, b) => b.timestamp - a.timestamp));
    });

    // Check if joined
    const savedJoined = localStorage.getItem(`v44v-joined-${spaceId}`);
    if (savedJoined) setJoined(true);

    setTimeout(() => setLoading(false), 2000);

    return () => {
      gun.get("v44v-spaces").get(spaceId).off();
      gun.get(postsKey).map().off();
    };
  }, [spaceId]);

  const handleJoin = () => {
    const gun = getGun();
    if (!gun || !isSignedIn) return;
    const newCount = (space?.members || 1) + 1;
    gun.get("v44v-spaces").get(spaceId).get("members").put(newCount);
    localStorage.setItem(`v44v-joined-${spaceId}`, "true");
    setJoined(true);
  };

  const handlePost = () => {
    const gun = getGun();
    if (!gun || !isSignedIn || !newPostTitle.trim()) return;
    setPosting(true);

    const post: Post = {
      id: Date.now().toString(),
      title: newPostTitle.trim(),
      body: newPostBody.trim(),
      author: user?.username || user?.firstName || "Anonymous",
      timestamp: Date.now(),
      upvotes: 0,
      spaceId,
    };

    gun.get(postsKey).get(post.id).put(post);
    setNewPostTitle("");
    setNewPostBody("");
    setShowPostForm(false);
    setPosting(false);
  };

  const upvotePost = (postId: string) => {
    const gun = getGun();
    if (!gun || !isSignedIn) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    gun.get(postsKey).get(postId).get("upvotes").put((post.upvotes || 0) + 1);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6C63FF] animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#080810] text-[#e8e8e8]">

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[400px] h-[400px] rounded-full bg-[#6C63FF] opacity-[0.05] blur-[100px]" />
      </div>

      {/* Nav */}
      <div className="sticky top-0 z-20 bg-[#080810]/90 backdrop-blur-md border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push("/spaces")}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Spaces
          </button>
          <span className="text-white/60 text-sm font-medium flex-1 line-clamp-1">{space?.name || "Space"}</span>
          {isSignedIn && !joined && (
            <button
              onClick={handleJoin}
              className="bg-[#6C63FF] hover:bg-[#7c74ff] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Join Space
            </button>
          )}
          {joined && (
            <span className="text-[#4CAF50] text-xs flex items-center gap-1">
              ✓ Joined
            </span>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">

          {/* Left — Posts */}
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="text-[#a89fff] text-xs mb-1">{space?.faculty}</div>
              <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>
                {space?.name || "Space"}
              </h1>
              <p className="text-white/30 text-sm">{space?.description}</p>
            </div>

            {/* New post form */}
            {isSignedIn && (
              <div className="mb-6">
                {!showPostForm ? (
                  <button
                    onClick={() => setShowPostForm(true)}
                    className="w-full flex items-center gap-3 bg-[#0a0a12] border border-white/[0.05] hover:border-[#6C63FF]/30 rounded-2xl p-4 text-white/30 hover:text-white/60 transition-all text-sm"
                  >
                    <PenSquare className="w-4 h-4" />
                    Share something with this space...
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0a0a14] border border-[#6C63FF]/20 rounded-2xl p-5"
                  >
                    <input
                      type="text"
                      value={newPostTitle}
                      onChange={e => setNewPostTitle(e.target.value)}
                      placeholder="Title"
                      className="w-full bg-white/[0.04] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl px-4 py-2.5 text-white placeholder-white/20 outline-none text-sm mb-3 transition-all"
                    />
                    <textarea
                      value={newPostBody}
                      onChange={e => setNewPostBody(e.target.value)}
                      placeholder="What's on your mind? (optional)"
                      rows={3}
                      className="w-full bg-white/[0.04] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl px-4 py-2.5 text-white placeholder-white/20 outline-none text-sm mb-3 resize-none transition-all"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setShowPostForm(false)} className="flex-1 border border-white/10 text-white/40 py-2 rounded-xl text-sm hover:border-white/25 transition-colors">
                        Cancel
                      </button>
                      <button
                        onClick={handlePost}
                        disabled={posting || !newPostTitle.trim()}
                        className="flex-1 bg-[#6C63FF] hover:bg-[#7c74ff] disabled:opacity-30 text-white py-2 rounded-xl text-sm font-medium transition-colors"
                      >
                        {posting ? "Posting..." : "Post"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Posts list */}
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-7 h-7 text-white/10 mx-auto mb-3" />
                <p className="text-white/25 text-sm">No posts yet in this space.</p>
                {isSignedIn && (
                  <button onClick={() => setShowPostForm(true)} className="text-[#6C63FF] hover:underline text-sm mt-2">
                    Be the first to post →
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="group bg-[#0a0a12] border border-white/[0.05] hover:border-white/15 rounded-2xl p-5 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => upvotePost(post.id)}
                        className="flex flex-col items-center gap-1 text-white/25 hover:text-[#6C63FF] transition-colors shrink-0 pt-1"
                      >
                        <ChevronUp className="w-5 h-5" />
                        <span className="text-xs">{post.upvotes || 0}</span>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 text-xs text-white/25">
                          <Users className="w-2.5 h-2.5" /> {post.author}
                          <Clock className="w-2.5 h-2.5 ml-1" /> {formatTime(post.timestamp)}
                        </div>
                        <h3 className="text-white font-semibold text-base mb-2 group-hover:text-[#a89fff] transition-colors">
                          {post.title}
                        </h3>
                        {post.body && (
                          <p className="text-white/40 text-sm leading-relaxed line-clamp-2">{post.body}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <div className="bg-[#0a0a14] border border-white/[0.06] rounded-2xl p-5 sticky top-24">
              <h3 className="text-white font-semibold mb-3">{space?.name}</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-4">{space?.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/30">Faculty</span>
                  <span className="text-[#a89fff] text-xs">{space?.faculty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/30">Members</span>
                  <span className="text-white/60 text-xs">{space?.members || 1}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/30">Posts</span>
                  <span className="text-white/60 text-xs">{posts.length}</span>
                </div>
              </div>
              {isSignedIn && !joined && (
                <button
                  onClick={handleJoin}
                  className="mt-4 w-full bg-[#6C63FF] hover:bg-[#7c74ff] text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Join Space
                </button>
              )}
              <button
                onClick={() => router.push(`/search?q=${encodeURIComponent(space?.name || "")}`)}
                className="mt-2 w-full border border-white/10 hover:border-white/25 text-white/50 hover:text-white py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-3.5 h-3.5" /> Search papers
              </button>
              <button
                onClick={() => router.push(`/discussion?topic=${encodeURIComponent(space?.name || "")}&title=${encodeURIComponent(space?.name || "")}`)}
                className="mt-2 w-full border border-white/10 hover:border-[#6C63FF]/30 text-white/50 hover:text-[#a89fff] py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Live Discussion
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SpaceDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6C63FF] animate-spin" />
      </div>
    }>
      <SpaceContent />
    </Suspense>
  );
}
