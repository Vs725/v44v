"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Users, BookOpen, PenSquare, UserPlus, UserMinus, Loader2, Clock, ChevronUp } from "lucide-react";
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
  timestamp: number;
  upvotes: number;
}

interface UserProfile {
  username: string;
  userId: string;
  faculty: string;
  branch: string;
  niches: string;
  followers: number;
  following: number;
  joinedAt: number;
}

function ProfileContent() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const username = params.username as string;
  const isOwnProfile = user?.username === username || user?.firstName === username;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const profileKey = `v44v-profile-${username}`;
  const followKey = `v44v-follows-${user?.id}-${username}`;

  useEffect(() => {
    const gun = getGun();
    if (!gun) return;

    // Load or create profile
    gun.get(profileKey).on((data: any) => {
      if (data && data.username) {
        setProfile(data);
        setFollowersCount(data.followers || 0);
      } else if (isOwnProfile && user) {
        // Create profile for own user
        const faculty = localStorage.getItem("v44v_faculty") || "";
        const branch = localStorage.getItem("v44v_branch") || "";
        const niches = localStorage.getItem("v44v_niches") || "[]";
        const newProfile: UserProfile = {
          username: user.username || user.firstName || username,
          userId: user.id,
          faculty,
          branch,
          niches,
          followers: 0,
          following: 0,
          joinedAt: Date.now(),
        };
        gun.get(profileKey).put(newProfile);
        setProfile(newProfile);
      }
      setLoading(false);
    });

    // Load user's posts
    const loaded: Record<string, Post> = {};
    gun.get("v44v-posts").map().on((data: any, key: string) => {
      if (!data || !data.title) return;
      if (data.author === username) {
        loaded[key] = { ...data, id: key };
        setPosts(Object.values(loaded).sort((a, b) => b.timestamp - a.timestamp));
      }
    });

    // Check if following
    const following = localStorage.getItem(followKey);
    if (following) setIsFollowing(true);

    setTimeout(() => setLoading(false), 2000);

    return () => {
      gun.get(profileKey).off();
      gun.get("v44v-posts").map().off();
    };
  }, [username, isOwnProfile]);

  const handleFollow = () => {
    const gun = getGun();
    if (!gun || !isSignedIn) {
      router.push("/");
      return;
    }

    if (isFollowing) {
      // Unfollow
      localStorage.removeItem(followKey);
      setIsFollowing(false);
      const newCount = Math.max(0, followersCount - 1);
      setFollowersCount(newCount);
      gun.get(profileKey).get("followers").put(newCount);
    } else {
      // Follow
      localStorage.setItem(followKey, "true");
      setIsFollowing(true);
      const newCount = followersCount + 1;
      setFollowersCount(newCount);
      gun.get(profileKey).get("followers").put(newCount);
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const days = Math.floor(diff / 86400000);
    const months = Math.floor(diff / 2592000000);
    if (days < 1) return "today";
    if (days < 30) return `${days} days ago`;
    if (months < 12) return `${months} months ago`;
    return "over a year ago";
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
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-white/60 text-sm font-medium">{username}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">

          {/* Left — Posts */}
          <div>
            {/* Profile header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a0a14] border border-white/[0.06] rounded-2xl p-6 mb-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#6C63FF]/20 border-2 border-[#6C63FF]/40 flex items-center justify-center text-[#a89fff] text-2xl font-bold">
                    {username?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <h1 className="text-white font-bold text-xl">{username}</h1>
                    {profile?.faculty && (
                      <p className="text-[#a89fff] text-sm">{profile.faculty}{profile.branch ? ` · ${profile.branch}` : ""}</p>
                    )}
                  </div>
                </div>

                {!isOwnProfile && isSignedIn && (
                  <button
                    onClick={handleFollow}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isFollowing
                        ? "border border-white/20 text-white/50 hover:border-red-500/30 hover:text-red-400"
                        : "bg-[#6C63FF] hover:bg-[#7c74ff] text-white"
                    }`}
                  >
                    {isFollowing ? (
                      <><UserMinus className="w-4 h-4" /> Unfollow</>
                    ) : (
                      <><UserPlus className="w-4 h-4" /> Follow</>
                    )}
                  </button>
                )}

                {isOwnProfile && (
                  <button
                    onClick={() => router.push("/onboarding")}
                    className="border border-white/10 hover:border-white/25 text-white/40 hover:text-white px-4 py-2 rounded-xl text-sm transition-all"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-white font-bold text-lg">{posts.length}</div>
                  <div className="text-white/30 text-xs">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-lg">{followersCount}</div>
                  <div className="text-white/30 text-xs">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-lg">{profile?.following || 0}</div>
                  <div className="text-white/30 text-xs">Following</div>
                </div>
              </div>

              {/* Niches */}
              {profile?.niches && profile.niches !== "[]" && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/[0.06]">
                  {JSON.parse(profile.niches).map((niche: string) => (
                    <span key={niche} className="text-xs px-2.5 py-1 rounded-full bg-[#6C63FF]/10 text-[#a89fff] border border-[#6C63FF]/20">
                      {niche}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Posts */}
            <h2 className="text-white/50 text-sm font-medium mb-4 flex items-center gap-2">
              <PenSquare className="w-4 h-4" /> Posts by {username}
            </h2>

            {posts.length === 0 ? (
              <div className="text-center py-16">
                <PenSquare className="w-7 h-7 text-white/10 mx-auto mb-3" />
                <p className="text-white/25 text-sm">No posts yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => router.push(`/post/${post.id}`)}
                    className="group bg-[#0a0a12] border border-white/[0.05] hover:border-white/15 rounded-2xl p-5 cursor-pointer transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={e => { e.stopPropagation(); }}
                        className="flex flex-col items-center gap-1 text-white/25 hover:text-[#6C63FF] transition-colors shrink-0 pt-1"
                      >
                        <ChevronUp className="w-5 h-5" />
                        <span className="text-xs">{post.upvotes || 0}</span>
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 text-xs text-white/25">
                          {post.faculty && <span className="text-[#a89fff]">{post.faculty}</span>}
                          <Clock className="w-2.5 h-2.5" /> {formatTime(post.timestamp)}
                        </div>
                        <h3 className="text-white font-semibold text-base group-hover:text-[#a89fff] transition-colors mb-1">
                          {post.title}
                        </h3>
                        <p className="text-white/35 text-sm line-clamp-2">{post.body}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-[#0a0a14] border border-white/[0.06] rounded-2xl p-5 sticky top-24">
              <h3 className="text-white/50 text-xs uppercase tracking-widest mb-4">About</h3>
              <div className="space-y-3 text-sm">
                {profile?.faculty && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/30">Faculty</span>
                    <span className="text-[#a89fff]">{profile.faculty}</span>
                  </div>
                )}
                {profile?.branch && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/30">Branch</span>
                    <span className="text-white/60 text-xs">{profile.branch}</span>
                  </div>
                )}
                {profile?.joinedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/30">Joined</span>
                    <span className="text-white/40 text-xs">{formatTime(profile.joinedAt)}</span>
                  </div>
                )}
              </div>

              {isOwnProfile && (
                <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2">
                  <button
                    onClick={() => router.push("/posts")}
                    className="w-full border border-white/10 hover:border-white/25 text-white/40 hover:text-white py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <PenSquare className="w-3.5 h-3.5" /> View all posts
                  </button>
                  <button
                    onClick={() => router.push("/spaces")}
                    className="w-full border border-white/10 hover:border-white/25 text-white/40 hover:text-white py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Your spaces
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6C63FF] animate-spin" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
