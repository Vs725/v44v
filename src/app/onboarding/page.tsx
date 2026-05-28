"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, SkipForward } from "lucide-react";
import { useRouter } from "next/navigation";

const TAXONOMY = {
  Science: {
    Biology: ["Neuroscience", "Genetics", "Ecology", "Microbiology", "Zoology", "Botany"],
    Physics: ["Quantum Physics", "Astrophysics", "Thermodynamics", "Optics", "Particle Physics"],
    Chemistry: ["Organic Chemistry", "Biochemistry", "Analytical Chemistry", "Materials Science"],
    "Computer Science": ["AI & Machine Learning", "Algorithms", "Systems", "Cybersecurity", "HCI"],
    Mathematics: ["Pure Mathematics", "Applied Mathematics", "Statistics", "Topology"],
    "Earth Sciences": ["Geology", "Climatology", "Oceanography", "Seismology"],
    Astronomy: ["Cosmology", "Planetary Science", "Stellar Physics", "Astrobiology"],
  },
  Humanities: {
    "English Literature": ["Postcolonial Theory", "Modernism", "Romanticism", "Literary Theory", "Narratology"],
    Linguistics: ["Phonology", "Syntax", "Semantics", "Sociolinguistics", "Computational Linguistics"],
    History: ["Ancient History", "Medieval History", "Modern History", "Colonial History", "Cultural History"],
    Philosophy: ["Epistemology", "Ethics", "Metaphysics", "Philosophy of Mind", "Political Philosophy"],
    Sociology: ["Social Theory", "Cultural Studies", "Gender Studies", "Urban Sociology"],
    Psychology: ["Cognitive Psychology", "Clinical Psychology", "Developmental Psychology", "Neuropsychology"],
    "Political Science": ["International Relations", "Comparative Politics", "Political Theory", "Public Policy"],
    Anthropology: ["Cultural Anthropology", "Archaeology", "Linguistic Anthropology", "Physical Anthropology"],
  },
  Commerce: {
    Economics: ["Microeconomics", "Macroeconomics", "Behavioral Economics", "Development Economics"],
    Finance: ["Corporate Finance", "Investment", "Risk Management", "Financial Markets"],
    Management: ["Strategic Management", "Organizational Behavior", "Human Resources", "Operations"],
    Marketing: ["Consumer Behavior", "Digital Marketing", "Brand Management", "Market Research"],
    Law: ["Constitutional Law", "International Law", "Corporate Law", "Criminal Law"],
    Statistics: ["Biostatistics", "Econometrics", "Data Science", "Probability Theory"],
  },
  "Engineering & Technology": {
    "Computer Engineering": ["Software Engineering", "Networks", "Embedded Systems", "VLSI"],
    "Electrical Engineering": ["Signal Processing", "Power Systems", "Electronics", "Control Systems"],
    "Mechanical Engineering": ["Thermodynamics", "Fluid Mechanics", "Robotics", "Manufacturing"],
    "Civil Engineering": ["Structural Engineering", "Geotechnical", "Environmental Engineering", "Transportation"],
    Biotechnology: ["Genetic Engineering", "Bioinformatics", "Biomedical Engineering", "Synthetic Biology"],
    Aerospace: ["Aerodynamics", "Propulsion", "Space Systems", "Avionics"],
  },
  "Medicine & Health": {
    Medicine: ["Cardiology", "Neurology", "Oncology", "Infectious Disease", "Immunology"],
    "Public Health": ["Epidemiology", "Global Health", "Health Policy", "Biostatistics"],
    Pharmacology: ["Drug Discovery", "Clinical Pharmacology", "Toxicology", "Pharmacogenomics"],
    Psychiatry: ["Clinical Psychiatry", "Psychopharmacology", "Child Psychiatry", "Addiction Medicine"],
    Nutrition: ["Clinical Nutrition", "Sports Nutrition", "Nutritional Epidemiology"],
  },
  "Arts & Design": {
    "Film Studies": ["Film Theory", "Documentary", "Animation", "Screenwriting"],
    Theatre: ["Performance Studies", "Dramaturgy", "Theatre History", "Directing"],
    Music: ["Music Theory", "Ethnomusicology", "Composition", "Music Technology"],
    Architecture: ["Architectural Theory", "Urban Design", "Sustainable Architecture", "Heritage"],
    "Fine Arts": ["Art History", "Contemporary Art", "Visual Culture", "Art Theory"],
  },
};

type Faculty = keyof typeof TAXONOMY;
type Branch = string;
type Niche = string;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedNiches, setSelectedNiches] = useState<Niche[]>([]);

  const faculties = Object.keys(TAXONOMY) as Faculty[];
  const branches = selectedFaculty ? Object.keys(TAXONOMY[selectedFaculty]) : [];
  const niches = selectedFaculty && selectedBranch
    ? TAXONOMY[selectedFaculty][selectedBranch as keyof typeof TAXONOMY[Faculty]] || []
    : [];

  const toggleNiche = (niche: Niche) => {
    setSelectedNiches(prev =>
      prev.includes(niche) ? prev.filter(n => n !== niche) : [...prev, niche]
    );
  };

  const handleFinish = () => {
    // Store preferences in localStorage for now
    // In Phase 6 we'll sync to user profile
    localStorage.setItem("v44v_faculty", selectedFaculty || "");
    localStorage.setItem("v44v_branch", selectedBranch || "");
    localStorage.setItem("v44v_niches", JSON.stringify(selectedNiches));
    localStorage.setItem("v44v_onboarded", "true");
    router.push("/");
  };

  const handleSkip = () => {
    localStorage.setItem("v44v_onboarded", "skipped");
    router.push("/");
  };

  const steps = ["Faculty", "Branch", "Niche"];

  return (
    <main className="min-h-screen bg-[#080810] text-[#e8e8e8] flex flex-col items-center justify-center px-6 py-12">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#6C63FF] opacity-[0.06] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-lg bg-[#6C63FF] flex items-center justify-center">
            <span className="text-white font-bold text-xs">V4</span>
          </div>
          <span className="font-bold text-lg text-white">V44V</span>
          <span className="text-[10px] text-[#6C63FF]/70 ml-1 tracking-widest">विचार</span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-300 ${
                i < step ? "bg-[#6C63FF] text-white" :
                i === step ? "bg-[#6C63FF]/20 border border-[#6C63FF] text-[#6C63FF]" :
                "bg-white/5 text-white/20"
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs ${i === step ? "text-white/60" : "text-white/20"}`}>{s}</span>
              {i < steps.length - 1 && (
                <div className={`h-px w-8 mx-1 ${i < step ? "bg-[#6C63FF]" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">

          {/* Step 0 — Faculty */}
          {step === 0 && (
            <motion.div
              key="faculty"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>
                What's your field?
              </h1>
              <p className="text-white/40 mb-8">Choose your primary faculty to personalise your feed.</p>

              <div className="grid grid-cols-2 gap-3">
                {faculties.map(faculty => (
                  <button
                    key={faculty}
                    onClick={() => setSelectedFaculty(faculty)}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                      selectedFaculty === faculty
                        ? "bg-[#6C63FF]/15 border-[#6C63FF] text-white"
                        : "bg-white/[0.03] border-white/10 text-white/50 hover:border-white/25 hover:text-white/80"
                    }`}
                  >
                    <span className="font-medium text-sm">{faculty}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1 — Branch */}
          {step === 1 && (
            <motion.div
              key="branch"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>
                Pick your branch
              </h1>
              <p className="text-white/40 mb-8">
                Within <span className="text-[#a89fff]">{selectedFaculty}</span>, what's your area?
              </p>

              <div className="grid grid-cols-2 gap-3">
                {branches.map(branch => (
                  <button
                    key={branch}
                    onClick={() => setSelectedBranch(branch)}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                      selectedBranch === branch
                        ? "bg-[#6C63FF]/15 border-[#6C63FF] text-white"
                        : "bg-white/[0.03] border-white/10 text-white/50 hover:border-white/25 hover:text-white/80"
                    }`}
                  >
                    <span className="font-medium text-sm">{branch}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2 — Niche */}
          {step === 2 && (
            <motion.div
              key="niche"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>
                Your niche
              </h1>
              <p className="text-white/40 mb-8">
                Select one or more topics within <span className="text-[#a89fff]">{selectedBranch}</span>. You can always change these later.
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {niches.map(niche => (
                  <button
                    key={niche}
                    onClick={() => toggleNiche(niche)}
                    className={`px-4 py-2 rounded-full border text-sm transition-all duration-200 ${
                      selectedNiches.includes(niche)
                        ? "bg-[#6C63FF]/20 border-[#6C63FF] text-[#a89fff]"
                        : "bg-white/[0.03] border-white/10 text-white/50 hover:border-white/25 hover:text-white/80"
                    }`}
                  >
                    {selectedNiches.includes(niche) && <span className="mr-1">✓</span>}
                    {niche}
                  </button>
                ))}
              </div>

              {selectedNiches.length > 0 && (
                <p className="text-white/30 text-xs mt-3">
                  {selectedNiches.length} selected
                </p>
              )}
            </motion.div>
          )}

        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-10">
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button
              onClick={handleSkip}
              className="flex items-center gap-2 text-white/25 hover:text-white/50 transition-colors text-sm"
            >
              <SkipForward className="w-4 h-4" /> Skip for now
            </button>
          </div>

          {step < 2 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={
                (step === 0 && !selectedFaculty) ||
                (step === 1 && !selectedBranch)
              }
              className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#7c74ff] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white px-6 py-2.5 rounded-xl font-medium text-sm"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#7c74ff] transition-colors text-white px-6 py-2.5 rounded-xl font-medium text-sm"
            >
              Finish setup <Check className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </main>
  );
}
