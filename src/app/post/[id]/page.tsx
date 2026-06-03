"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, ChevronUp, Clock, Users, Loader2, Tag, MessageCircle } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
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

interface Comment {
  id: string;
  text: string;
  author: string;
  authorId: string;
  timestamp: number;
  upvotes: number;
  parentId: string | null;
}

function PostDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const commentsKey = `v44v-post-comments-${postId}`;

  useEffect(() => {
    const gun = getGun();
    if (!gun) return;

    // Load post
    gun.get("v44v-posts").get(postId).on((data: any) => {
      if (data) setPost({ ...data, id: postId });
      setLoading(false);
    });

    // Load comments
    const loaded: Record<string, Comment> = {};
    gun.get(commentsKey).map().on((data: any, key: string) => {
      if (!data || !data.text) return;
      loaded[key] = { ...data, id: key };
      setComments(Object.values(loaded).sort((a, b) => a.timestamp - b.timestamp));
    });

    setTimeout(() => setLoading(false), 2000);

    return () => {
      gun.get("v44v-posts").get(postId).off();
      gun.get(commentsKey).map().off();
    };
  }, [postId]);

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

    gun.get(commentsKey).get(comment.id).put(comment);
    setNewComment("");
    setReplyTo(null);
    setPosting(false);
  };

  const upvoteComment = (commentId: string) => {
    const gun = getGun();
    if (!gun || !isSignedIn) return;
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    gun.get(commentsKey).get(commentId).get("upvotes").put((comment.upvotes || 0) + 1);
  };

  const upvotePost = () => {
    const gun = getGun();
    if (!gun || !isSignedIn || !post) return;
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

  const topLevel = comments.filter(c => !c.parentId);
  const getReplies = (id: string) => comments.filter(c => c.parentId === id);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6C63FF] animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/30 mb-4">Post not found</p>
          <button onClick={() => router.push("/posts")} className="text-[#6C63FF] hover:underline text-sm">
            Back to posts
          </button>
        </div>
      </div>
    );
  }

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
            onClick={() => router.push("/posts")}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Posts
          </button>
          <span className="text-white/20 text-xs line-clamp-1 flex-1">{post.title}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Post */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a14] border border-white/[0.06] rounded-2xl p-6 mb-6"
        >
          {/* Meta */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {post.faculty && post.faculty !== "General" && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6C63FF]/10 text-[#a89fff] border border-[#6C63FF]/20">
                {post.faculty}
              </span>
            )}
            <span className="text-white/25 text-xs flex items-center gap-1">
              <Users className="w-2.5 h-2.5" /> {post.author}
            </span>
            <span className="text-white/25 text-xs flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> {formatTime(post.timestamp)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-4 leading-snug"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {post.title}
          </h1>

          {/* Body */}
          <p className="text-white/60 leading-relaxed text-sm mb-6 whitespace-pre-wrap">
            {post.body}
          </p>

          {/* Tags */}
          {post.tags && post.tags !== "[]" && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {JSON.parse(post.tags).map((tag: string) => (
                <span key={tag} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/10">
                  <Tag className="w-2 h-2" /> {tag}
                </span>
              ))}
            </div>
          )}

          {/* Upvote */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/[0.06]">
            <button
              onClick={upvotePost}
              className="flex items-center gap-2 text-white/30 hover:text-[#6C63FF] transition-colors text-sm"
            >
              <ChevronUp className="w-4 h-4" />
              {post.upvotes || 0} upvotes
            </button>
            <span className="text-white/20 text-sm flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {comments.length} comments
            </span>
          </div>
        </motion.div>

        {/* Comments section */}
        <div className="mb-4">
          <h2 className="text-white/50 text-sm font-medium mb-4 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            {comments.length} Comments
          </h2>

          {topLevel.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-6 h-6 text-white/10 mx-auto mb-2" />
              <p className="text-white/25 text-sm">No comments yet. Start the discussion.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {topLevel.map((comment, i) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-[#0a0a12] border border-white/[0.05] rounded-2xl p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#6C63FF]/20 border border-[#6C63FF]/30 flex items-center justify-center text-[#a89fff] text-xs font-bold">
                          {comment.author?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <span className="text-white/70 text-sm font-medium">{comment.author}</span>
                          <span className="text-white/25 text-xs ml-2">{formatTime(comment.timestamp)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => upvoteComment(comment.id)}
                        className="flex items-center gap-1 text-white/25 hover:text-[#6C63FF] transition-colors text-xs"
                      >
                        <ChevronUp className="w-4 h-4" /> {comment.upvotes || 0}
                      </button>
                    </div>

                    <p className="text-white/60 text-sm leading-relaxed mb-3">{comment.text}</p>

                    {isSignedIn && (
                      <button
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                        className="text-white/25 hover:text-[#6C63FF] text-xs transition-colors"
                      >
                        {replyTo === comment.id ? "Cancel" : "Reply"}
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
                                <span className="text-white/60 text-xs font-medium">{reply.author}</span>
                                <span className="text-white/20 text-xs">{formatTime(reply.timestamp)}</span>
                              </div>
                              <p className="text-white/50 text-xs leading-relaxed">{reply.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div ref={bottomRef} />

        {/* Comment input */}
        <div className="sticky bottom-6 mt-6">
          {isSignedIn ? (
            <div className="bg-[#0a0a14] border border-white/[0.08] rounded-2xl p-4">
              {replyTo && (
                <div className="flex items-center justify-between mb-2 text-xs text-white/30">
                  <span>Replying to comment</span>
                  <button onClick={() => setReplyTo(null)} className="hover:text-white/60">Cancel</button>
                </div>
              )}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#6C63FF]/20 border border-[#6C63FF]/30 flex items-center justify-center text-[#a89fff] text-xs font-bold shrink-0">
                  {user?.username?.[0]?.toUpperCase() || user?.firstName?.[0]?.toUpperCase() || "?"}
                </div>
                <input
                  type="text"
                  value={!replyTo ? newComment : newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !replyTo && postComment()}
                  placeholder="Add a comment..."
                  className="flex-1 bg-white/[0.04] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all"
                />
                <button
                  onClick={postComment}
                  disabled={posting || !newComment.trim()}
                  className="bg-[#6C63FF] hover:bg-[#7c74ff] disabled:opacity-30 text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm"
                >
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#0a0a14] border border-white/[0.08] rounded-2xl p-4 text-center">
              <p className="text-white/40 text-sm">
                <a href="/" className="text-[#6C63FF] hover:underline">Sign in</a> to comment
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function PostDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6C63FF] animate-spin" />
      </div>
    }>
      <PostDetailContent />
    </Suspense>
  );
}
