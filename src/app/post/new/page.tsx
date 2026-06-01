"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Loader2, Tag, X } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getGun } from "@/lib/gun";

const FACULTIES = [
  "Science", "Humanities", "Commerce",
  "Engineering", "Medicine", "Arts & Design", "General"
];

export default function NewPostPage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [faculty, setFaculty] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 mb-4">Sign in to post</p>
          <button onClick={() => router.push("/")} className="text-[#6C63FF] hover:underline text-sm">
            Go home
          </button>
        </div>
      </main>
    );
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags(prev => [...prev, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handlePost = async () => {
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      return;
    }
    if (title.length > 200) {
      setError("Title too long — max 200 characters.");
      return;
    }

    setPosting(true);
    setError("");

    const gun = getGun();
    if (!gun) {
      setError("Connection error. Try again.");
      setPosting(false);
      return;
    }

    const post = {
      id: Date.now().toString(),
      title: title.trim(),
      body: body.trim().slice(0, 5000),
      author: user?.username || user?.firstName || "Anonymous",
      authorId: user?.id || "",
      faculty: faculty || "General",
      tags: JSON.stringify(tags),
      timestamp: Date.now(),
      upvotes: 0,
      type: "post",
    };

    gun.get("v44v-posts").get(post.id).put(post, (ack: any) => {
      if (ack.err) {
        setError("Failed to post. Try again.");
        setPosting(false);
      } else {
        router.push("/posts");
      }
    });
  };

  return (
    <main className="min-h-screen bg-[#080810] text-[#e8e8e8]">

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-[#6C63FF] opacity-[0.05] blur-[100px]" />
      </div>

      {/* Nav */}
      <div className="sticky top-0 z-20 bg-[#080810]/90 backdrop-blur-md border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-white/60 text-sm font-medium">New Post</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>
            Share your vichaar
          </h1>
          <p className="text-white/30 text-sm mb-8">
            Post an idea, question, observation, or insight for the V44V community.
          </p>

          {/* Title */}
          <div className="mb-5">
            <label className="text-white/40 text-xs uppercase tracking-widest mb-2 block">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What's your idea or question?"
              maxLength={200}
              className="w-full bg-[#0f0f1a] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none transition-all text-sm"
            />
            <div className="flex justify-end mt-1">
              <span className="text-white/20 text-xs">{title.length}/200</span>
            </div>
          </div>

          {/* Body */}
          <div className="mb-5">
            <label className="text-white/40 text-xs uppercase tracking-widest mb-2 block">Content *</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Share your thoughts in detail..."
              maxLength={5000}
              rows={8}
              className="w-full bg-[#0f0f1a] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none transition-all text-sm resize-none leading-relaxed"
            />
            <div className="flex justify-end mt-1">
              <span className="text-white/20 text-xs">{body.length}/5000</span>
            </div>
          </div>

          {/* Faculty */}
          <div className="mb-5">
            <label className="text-white/40 text-xs uppercase tracking-widest mb-2 block">Faculty</label>
            <div className="flex flex-wrap gap-2">
              {FACULTIES.map(f => (
                <button
                  key={f}
                  onClick={() => setFaculty(f === faculty ? "" : f)}
                  className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                    faculty === f
                      ? "bg-[#6C63FF]/20 border-[#6C63FF] text-[#a89fff]"
                      : "bg-white/[0.03] border-white/10 text-white/40 hover:border-white/25"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <label className="text-white/40 text-xs uppercase tracking-widest mb-2 block">
              Tags <span className="normal-case text-white/20">(up to 5)</span>
            </label>
            <div className="flex gap-2 mb-3 flex-wrap">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#6C63FF]/10 text-[#a89fff] border border-[#6C63FF]/20">
                  <Tag className="w-2.5 h-2.5" /> {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1 hover:text-white transition-colors">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTag()}
                placeholder="Add a tag and press Enter..."
                className="flex-1 bg-[#0f0f1a] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl px-4 py-2.5 text-white placeholder-white/20 outline-none transition-all text-sm"
              />
              <button
                onClick={addTag}
                disabled={tags.length >= 5}
                className="bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white/60 px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="text-white/30 hover:text-white/60 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handlePost}
              disabled={posting || !title.trim() || !body.trim()}
              className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#7c74ff] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white px-6 py-3 rounded-xl font-medium text-sm"
            >
              {posting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</>
              ) : (
                <><Send className="w-4 h-4" /> Publish Post</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
