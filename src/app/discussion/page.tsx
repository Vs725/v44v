"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Users, Clock, ChevronUp, MessageCircle, Loader2 } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { getGun } from "@/lib/gun";
import { Suspense } from "react";

interface Comment {
  id: string;
  text: string;
  author: string;
  authorId: string;
  timestamp: number;
  upvotes: number;
  parentId: string | null;
}

function DiscussionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const topic = searchParams.get("topic") || "general";
  const paperId = searchParams.get("paperId") || "";
  const paperTitle = searchParams.get("title") || topic;

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const spaceId = `v44v-discussion-${topic.replace(/\s+/g, "-").toLowerCase()}`;

  useEffect(() => {
    const gun = getGun();
    if (!gun) return;

    const space = gun.get(spaceId);
    const loaded: Record<string, Comment> = {};

    space.map().on((data: any, key: string) => {
      if (!data || !data.text) return;
      loaded[key] = { ...data, id: key };
      setComments(Object.values(loaded).sort((a, b) => a.timestamp - b.timestamp));
      setLoading(false);
    });

    setTimeout(() => setLoading(false), 2000);

    return () => {
      space.map().off();
    };
  }, [spaceId]);

  const postComment = async () => {
    if (!newComment.trim() || !isSignedIn || posting) return;
    setPosting(true);

    const gun = getGun();
    if (!gun) return;

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment.trim().slice(0, 1000),
      author: user?.username || user?.firstName || "Anonymous",
      authorId: user?.id || "",
      timestamp: Date.now(),
      upvotes: 0,
      parentId: replyTo,
    };

    gun.get(spaceId).get(comment.id).put(comment);
    setNewComment("");
    setReplyTo(null);
    setPosting(false);
  };

  const upvote = (commentId: string) => {
    const gun = getGun();
    if (!gun || !isSignedIn) return;
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    gun.get(spaceId).get(commentId).get("upvotes").put((comment.upvotes || 0) + 1);
  };

  const topLevel = comments.filter(c => !c.parentId);
  const getReplies = (id: string) => comments.filter(c => c.parentId === id);

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

  return (
    <main className="min-h-screen bg-[#080810] text-[#e8e8e8]">

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[400px] h-[400px] rounded-full bg-[#6C63FF] opacity-[0.05] blur-[100px]" />
      </div>

      {/* Nav */}
      <div className="sticky top-0 z-20 bg-[#080810]/90 backdrop-blur-md border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-semibold text-sm line-clamp-1">{paperTitle}</h1>
            <p className="text-white/30 text-xs flex items-center gap-2 mt-0.5">
              <MessageCircle className="w-3 h-3" /> {comments.length} comments
              <Users className="w-3 h-3 ml-1" /> Discussion Space
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Space header */}
        <div className="bg-[#0a0a14] border border-[#6C63FF]/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#6C63FF] animate-pulse" />
            <span className="text-[#6C63FF] text-xs font-medium tracking-widest uppercase">Live Discussion</span>
          </div>
          <h2 className="text-white font-bold text-xl mb-1" style={{ fontFamily: "Georgia, serif" }}>
            {paperTitle}
          </h2>
          <p className="text-white/30 text-sm">
            Federated discussion space · Powered by Gun.js · Decentralised
          </p>
        </div>

        {/* Comments */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="w-5 h-5 text-[#6C63FF] animate-spin" />
            <span className="text-white/30 text-sm">Loading discussion...</span>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {topLevel.length === 0 ? (
              <div className="text-center py-16">
                <MessageCircle className="w-8 h-8 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">No comments yet.</p>
                <p className="text-white/20 text-xs mt-1">Be the first to start the discussion.</p>
              </div>
            ) : (
              <AnimatePresence>
                {topLevel.map((comment, i) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    {/* Top level comment */}
                    <div className="bg-[#0a0a12] border border-white/[0.05] rounded-2xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#6C63FF]/20 border border-[#6C63FF]/30 flex items-center justify-center text-[#a89fff] text-xs font-bold">
                            {comment.author?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <span className="text-white/80 text-sm font-medium">{comment.author}</span>
                            <span className="text-white/25 text-xs ml-2 flex items-center gap-1 inline-flex">
                              <Clock className="w-2.5 h-2.5" /> {formatTime(comment.timestamp)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => upvote(comment.id)}
                          className="flex items-center gap-1 text-white/25 hover:text-[#6C63FF] transition-colors text-xs"
                        >
                          <ChevronUp className="w-4 h-4" />
                          {comment.upvotes || 0}
                        </button>
                      </div>

                      <p className="text-white/70 text-sm leading-relaxed mb-3">{comment.text}</p>

                      {isSignedIn && (
                        <button
                          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                          className="text-white/25 hover:text-[#6C63FF] text-xs transition-colors"
                        >
                          {replyTo === comment.id ? "Cancel reply" : "Reply"}
                        </button>
                      )}

                      {/* Reply input */}
                      {replyTo === comment.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3 flex gap-2"
                        >
                          <input
                            type="text"
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && postComment()}
                            placeholder="Write a reply..."
                            className="flex-1 bg-white/[0.04] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl px-4 py-2 text-sm text-white placeholder-white/20 outline-none transition-all"
                          />
                          <button
                            onClick={postComment}
                            disabled={posting || !newComment.trim()}
                            className="bg-[#6C63FF] hover:bg-[#7c74ff] disabled:opacity-30 text-white p-2 rounded-xl transition-all"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </motion.div>
                      )}

                      {/* Replies */}
                      {getReplies(comment.id).length > 0 && (
                        <div className="mt-4 pl-4 border-l border-white/[0.06] space-y-3">
                          {getReplies(comment.id).map(reply => (
                            <div key={reply.id} className="flex items-start gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center text-[#a89fff] text-xs font-bold shrink-0">
                                {reply.author?.[0]?.toUpperCase() || "?"}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-white/70 text-xs font-medium">{reply.author}</span>
                                  <span className="text-white/20 text-xs">{formatTime(reply.timestamp)}</span>
                                </div>
                                <p className="text-white/55 text-xs leading-relaxed">{reply.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}

        <div ref={bottomRef} />

        {/* Comment input */}
        <div className="sticky bottom-6">
          {isSignedIn ? (
            <div className="bg-[#0a0a14] border border-white/[0.08] rounded-2xl p-4">
              {replyTo && (
                <div className="flex items-center justify-between mb-2 text-xs text-white/30">
                  <span>Replying to comment</span>
                  <button onClick={() => setReplyTo(null)} className="hover:text-white/60 transition-colors">Cancel</button>
                </div>
              )}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#6C63FF]/20 border border-[#6C63FF]/30 flex items-center justify-center text-[#a89fff] text-xs font-bold shrink-0">
                  {user?.username?.[0]?.toUpperCase() || user?.firstName?.[0]?.toUpperCase() || "?"}
                </div>
                <input
                  type="text"
                  value={replyTo ? newComment : newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !replyTo && postComment()}
                  placeholder="Share your thoughts..."
                  className="flex-1 bg-white/[0.04] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all"
                />
                <button
                  onClick={postComment}
                  disabled={posting || !newComment.trim()}
                  className="bg-[#6C63FF] hover:bg-[#7c74ff] disabled:opacity-30 text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-medium"
                >
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#0a0a14] border border-white/[0.08] rounded-2xl p-4 text-center">
              <p className="text-white/40 text-sm">
                <a href="/" className="text-[#6C63FF] hover:underline">Sign in</a> to join the discussion
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function DiscussionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6C63FF] animate-spin" />
      </div>
    }>
      <DiscussionContent />
    </Suspense>
  );
}
