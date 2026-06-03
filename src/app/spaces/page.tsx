"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Users, BookOpen, Loader2, Compass } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getGun } from "@/lib/gun";

interface Space {
  id: string;
  name: string;
  description: string;
  faculty: string;
  branch: string;
  creator: string;
  creatorId: string;
  timestamp: number;
  members: number;
}

const SUGGESTED_SPACES = [
  { name: "Neuroscience", faculty: "Science", branch: "Biology", description: "Brain, cognition, neural mechanisms" },
  { name: "Postcolonial Theory", faculty: "Humanities", branch: "English Literature", description: "Colonial discourse, power, identity" },
  { name: "Quantum Computing", faculty: "Science", branch: "Computer Science", description: "Qubits, algorithms, quantum supremacy" },
  { name: "Behavioral Economics", faculty: "Commerce", branch: "Economics", description: "Decision making, biases, nudges" },
  { name: "Climate Science", faculty: "Science", branch: "Earth Sciences", description: "Climate change, emissions, modeling" },
  { name: "Computational Linguistics", faculty: "Humanities", branch: "Linguistics", description: "NLP, syntax, semantics, corpora" },
  { name: "CRISPR & Gene Editing", faculty: "Science", branch: "Biology", description: "Genome editing, ethics, applications" },
  { name: "Philosophy of Mind", faculty: "Humanities", branch: "Philosophy", description: "Consciousness, qualia, identity" },
];

export default function SpacesPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [newSpaceDesc, setNewSpaceDesc] = useState("");
  const [newSpaceFaculty, setNewSpaceFaculty] = useState("Science");

  useEffect(() => {
    const gun = getGun();
    if (!gun) return;

    const loaded: Record<string, Space> = {};
    gun.get("v44v-spaces").map().on((data: any, key: string) => {
      if (!data || !data.name) return;
      loaded[key] = { ...data, id: key };
      setSpaces(Object.values(loaded).sort((a, b) => (b.members || 0) - (a.members || 0)));
      setLoading(false);
    });

    setTimeout(() => setLoading(false), 2000);
    return () => gun.get("v44v-spaces").map().off();
  }, []);

  const joinSpace = (spaceId: string) => {
    router.push(`/space/${spaceId}`);
  };

  const createSpaceFromSuggestion = (suggestion: typeof SUGGESTED_SPACES[0]) => {
    const gun = getGun();
    if (!gun || !isSignedIn) {
      router.push("/");
      return;
    }
    const id = suggestion.name.replace(/\s+/g, "-").toLowerCase() + "-" + Date.now();
    const space: Space = {
      id,
      name: suggestion.name,
      description: suggestion.description,
      faculty: suggestion.faculty,
      branch: suggestion.branch,
      creator: "V44V",
      creatorId: "system",
      timestamp: Date.now(),
      members: 1,
    };
    gun.get("v44v-spaces").get(id).put(space);
    setTimeout(() => router.push(`/space/${id}`), 500);
  };

  const handleCreateSpace = () => {
    const gun = getGun();
    if (!gun || !isSignedIn || !newSpaceName.trim()) return;

    const id = newSpaceName.trim().replace(/\s+/g, "-").toLowerCase() + "-" + Date.now();
    const space: Space = {
      id,
      name: newSpaceName.trim(),
      description: newSpaceDesc.trim() || `A space for ${newSpaceName}`,
      faculty: newSpaceFaculty,
      branch: "",
      creator: "You",
      creatorId: "",
      timestamp: Date.now(),
      members: 1,
    };
    gun.get("v44v-spaces").get(id).put(space);
    setCreating(false);
    setNewSpaceName("");
    setNewSpaceDesc("");
    setTimeout(() => router.push(`/space/${id}`), 500);
  };

  const filtered = spaces.filter(s =>
    !searchQuery ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.faculty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#080810] text-[#e8e8e8]">

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[400px] h-[400px] rounded-full bg-[#6C63FF] opacity-[0.05] blur-[100px]" />
      </div>

      {/* Nav */}
      <div className="sticky top-0 z-20 bg-[#080810]/90 backdrop-blur-md border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
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
                placeholder="Search spaces..."
                className="flex-1 bg-transparent text-white placeholder-white/20 outline-none text-sm"
              />
            </div>
          </div>

          {isSignedIn && (
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#7c74ff] transition-colors text-white px-4 py-2 rounded-xl text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Create Space
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Create space modal */}
        {creating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0a14] border border-[#6C63FF]/30 rounded-2xl p-6 mb-6"
          >
            <h3 className="text-white font-semibold mb-4">Create a new Space</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newSpaceName}
                onChange={e => setNewSpaceName(e.target.value)}
                placeholder="Space name (e.g. Primate Cognition)"
                className="w-full bg-white/[0.04] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl px-4 py-2.5 text-white placeholder-white/20 outline-none text-sm transition-all"
              />
              <input
                type="text"
                value={newSpaceDesc}
                onChange={e => setNewSpaceDesc(e.target.value)}
                placeholder="Short description"
                className="w-full bg-white/[0.04] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl px-4 py-2.5 text-white placeholder-white/20 outline-none text-sm transition-all"
              />
              <select
                value={newSpaceFaculty}
                onChange={e => setNewSpaceFaculty(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 focus:border-[#6C63FF]/50 rounded-xl px-4 py-2.5 text-white outline-none text-sm transition-all"
              >
                {["Science", "Humanities", "Commerce", "Engineering", "Medicine", "Arts & Design"].map(f => (
                  <option key={f} value={f} className="bg-[#0f0f1a]">{f}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button onClick={() => setCreating(false)} className="flex-1 border border-white/10 text-white/40 py-2.5 rounded-xl text-sm hover:border-white/25 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleCreateSpace}
                  disabled={!newSpaceName.trim()}
                  className="flex-1 bg-[#6C63FF] hover:bg-[#7c74ff] disabled:opacity-30 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Suggested spaces */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="w-4 h-4 text-[#6C63FF]" />
            <h2 className="text-white/60 text-sm font-medium">Suggested Spaces</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SUGGESTED_SPACES.map((s, i) => (
              <motion.button
                key={s.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => createSpaceFromSuggestion(s)}
                className="group bg-[#0a0a12] border border-white/[0.05] hover:border-[#6C63FF]/30 rounded-2xl p-4 text-left transition-all duration-300"
              >
                <div className="text-[10px] text-[#a89fff] mb-1">{s.faculty}</div>
                <div className="text-white text-sm font-medium mb-1 group-hover:text-[#a89fff] transition-colors">{s.name}</div>
                <div className="text-white/30 text-xs line-clamp-2">{s.description}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Community spaces */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-white/30" />
            <h2 className="text-white/60 text-sm font-medium">Community Spaces</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 className="w-5 h-5 text-[#6C63FF] animate-spin" />
              <span className="text-white/30 text-sm">Loading spaces...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-7 h-7 text-white/10 mx-auto mb-3" />
              <p className="text-white/25 text-sm mb-2">No community spaces yet.</p>
              {isSignedIn && (
                <button onClick={() => setCreating(true)} className="text-[#6C63FF] hover:underline text-sm">
                  Create the first one →
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((space, i) => (
                <motion.div
                  key={space.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => joinSpace(space.id)}
                  className="group bg-[#0a0a12] border border-white/[0.05] hover:border-[#6C63FF]/30 rounded-2xl p-5 cursor-pointer transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-[10px] text-[#a89fff] mb-1">{space.faculty}</div>
                      <h3 className="text-white font-semibold group-hover:text-[#a89fff] transition-colors">{space.name}</h3>
                    </div>
                    <span className="text-white/20 text-xs flex items-center gap-1">
                      <Users className="w-3 h-3" /> {space.members || 1}
                    </span>
                  </div>
                  <p className="text-white/35 text-xs leading-relaxed">{space.description}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
