/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Rainbow, 
  Zap, 
  Coins, 
  Settings,
  ChevronRight,
  RefreshCw,
  Play,
  Clover,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

// --- Types ---

interface Student {
  id: string;
  name: string;
  rainbow: boolean;
  mechanism: boolean;
  bait: boolean;
}

interface AppState {
  students: Student[];
  masterCode: string;
  videoUrl: string;
  isUnlocked: boolean;
  view: 'setup' | 'dashboard' | 'reward';
}

// --- Constants ---

const DEFAULT_VIDEO = "https://www.youtube.com/embed/tNVowFhSl6c"; // Updated with user video

const RIDDLE_LINES = [
  "I wear a coat of bright, emerald green,",
  "In patches of grass, I’m easily seen.",
  "I’m not a tall tree, and I’m not a sweet flower,",
  "I don't have a clock, but I show a \"three\" power.",
  "I have three small wings that never take flight,",
  "I hide in the morning and sleep through the night.",
  "I look like a clover, but look at my name,",
  "Without my three leaves, I wouldn't be the same."
];

// --- Components ---

const BackgroundDecorations = () => {
  const icons = [
    { Icon: Clover, color: 'text-emerald-500/10' },
    { Icon: Coins, color: 'text-yellow-500/10' },
    { Icon: Rainbow, color: 'text-indigo-500/10' },
    { Icon: Sparkles, color: 'text-emerald-400/10' },
  ];

  // Generate a stable set of decorations
  const decorations = Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 40 + 20,
    rotation: Math.random() * 360,
    iconIndex: Math.floor(Math.random() * icons.length),
    duration: Math.random() * 20 + 10,
    delay: Math.random() * -20,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {decorations.map((dec) => {
        const { Icon, color } = icons[dec.iconIndex];
        return (
          <motion.div
            key={dec.id}
            initial={{ rotate: dec.rotation, opacity: 0 }}
            animate={{ 
              rotate: dec.rotation + 360,
              opacity: 1,
              y: [0, -20, 0],
              x: [0, 10, 0]
            }}
            transition={{ 
              rotate: { duration: dec.duration, repeat: Infinity, ease: "linear" },
              y: { duration: dec.duration / 2, repeat: Infinity, ease: "easeInOut" },
              x: { duration: dec.duration / 3, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1 }
            }}
            style={{
              position: 'absolute',
              top: dec.top,
              left: dec.left,
            }}
            className={color}
          >
            <Icon size={dec.size} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('leprechaun-trap-state');
    if (saved) return JSON.parse(saved);
    return {
      students: [],
      masterCode: 'SHAMROCK',
      videoUrl: 'https://www.youtube.com/embed/tNVowFhSl6c',
      isUnlocked: false,
      view: 'setup'
    };
  });

  const [inputCode, setInputCode] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem('leprechaun-trap-state', JSON.stringify(state));
  }, [state]);

  const addStudent = () => {
    if (!newStudentName.trim()) return;
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: newStudentName.trim(),
      rainbow: false,
      mechanism: false,
      bait: false
    };
    setState(prev => ({
      ...prev,
      students: [...prev.students, newStudent]
    }));
    setNewStudentName('');
  };

  const removeStudent = (id: string) => {
    setState(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== id)
    }));
  };

  const toggleRequirement = (studentId: string, requirement: keyof Pick<Student, 'rainbow' | 'mechanism' | 'bait'>) => {
    setState(prev => ({
      ...prev,
      students: prev.students.map(s => 
        s.id === studentId ? { ...s, [requirement]: !s[requirement] } : s
      )
    }));
  };

  const allRequirementsMet = state.students.length > 0 && state.students.every(s => s.rainbow && s.mechanism && s.bait);

  const handleUnlock = () => {
    if (inputCode.toUpperCase() === state.masterCode.toUpperCase()) {
      setState(prev => ({ ...prev, isUnlocked: true, view: 'reward' }));
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#a855f7']
      });
    } else {
      alert("That's not the secret word! Try again.");
    }
  };

  const resetApp = () => {
    if (confirm("Are you sure you want to reset everything?")) {
      setState({
        students: [],
        masterCode: 'SHAMROCK',
        videoUrl: 'https://www.youtube.com/embed/tNVowFhSl6c',
        isUnlocked: false,
        view: 'setup'
      });
      localStorage.removeItem('leprechaun-trap-state');
    }
  };

  // --- Views ---

  if (state.view === 'reward') {
    return (
      <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-4 text-white font-sans overflow-hidden">
        <BackgroundDecorations />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-yellow-500 relative z-10"
        >
          <iframe 
            width="100%" 
            height="100%" 
            src={state.videoUrl + "?autoplay=1"} 
            title="Leprechaun Celebration" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen
          ></iframe>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center relative z-10"
        >
          <h1 className="text-5xl font-bold text-yellow-400 mb-4 drop-shadow-lg">Happy St. Patrick's Day!</h1>
          <p className="text-xl text-emerald-100 mb-8 italic">"You caught the leprechaun's spirit!"</p>
          <button 
            onClick={() => setState(prev => ({ ...prev, view: 'dashboard' }))}
            className="px-6 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-full transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} /> Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-emerald-950 font-sans selection:bg-emerald-200 relative">
      <BackgroundDecorations />
      
      {/* Header */}
      <header className="bg-emerald-800 text-white py-8 px-6 shadow-lg relative overflow-hidden z-10">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-4 left-4 transform rotate-12"><Rainbow size={120} /></div>
          <div className="absolute bottom-4 right-4 transform -rotate-12"><Coins size={120} /></div>
        </div>
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Zap className="text-yellow-400" />
              Leprechaun Trap Challenge
            </h1>
            <p className="text-emerald-100 mt-2 opacity-80">Build your trap, collect the cards, and unlock the magic!</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setState(prev => ({ ...prev, view: prev.view === 'setup' ? 'dashboard' : 'setup' }))}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20"
              title="Toggle Setup/Dashboard"
            >
              {state.view === 'setup' ? <ChevronRight /> : <Settings />}
            </button>
            <button 
              onClick={resetApp}
              className="p-3 bg-red-500/20 hover:bg-red-500/40 rounded-xl transition-all border border-red-500/20 text-red-100"
              title="Reset App"
            >
              <RefreshCw />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-10 relative z-10">
        <AnimatePresence mode="wait">
          {state.view === 'setup' ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid md:grid-cols-2 gap-10"
            >
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <Plus className="text-emerald-600" /> Add Students
                </h2>
                <div className="flex gap-2 mb-8">
                  <input 
                    type="text" 
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addStudent()}
                    placeholder="Enter student name..."
                    className="flex-1 px-4 py-3 rounded-xl border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30"
                  />
                  <button 
                    onClick={addStudent}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {state.students.map(student => (
                    <div key={student.id} className="flex justify-between items-center p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <span className="font-medium">{student.name}</span>
                      <button 
                        onClick={() => removeStudent(student.id)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {state.students.length === 0 && (
                    <p className="text-center text-emerald-400 py-10 italic">No students added yet.</p>
                  )}
                </div>
              </section>

              <section className="space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100">
                  <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    <Lock className="text-emerald-600" /> Master Lock Settings
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-1">Secret Unlock Word</label>
                      <input 
                        type="text" 
                        value={state.masterCode}
                        onChange={(e) => setState(prev => ({ ...prev, masterCode: e.target.value.toUpperCase() }))}
                        className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30 font-mono uppercase tracking-widest"
                      />
                      <p className="text-xs text-emerald-500 mt-2">This is the answer to the final riddle the class will solve.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-1">Reward Video URL (Embed)</label>
                      <input 
                        type="text" 
                        value={state.videoUrl}
                        onChange={(e) => setState(prev => ({ ...prev, videoUrl: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30 text-sm"
                      />
                      <p className="text-xs text-emerald-500 mt-2">Use a YouTube embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID)</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setState(prev => ({ ...prev, view: 'dashboard' }))}
                  disabled={state.students.length === 0}
                  className="w-full py-4 bg-emerald-800 text-white rounded-3xl font-bold text-lg hover:bg-emerald-900 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Start Challenge <ChevronRight />
                </button>
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-10"
            >
              {/* Progress Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Trophy />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{state.students.length}</div>
                    <div className="text-sm text-emerald-600 uppercase tracking-wider font-semibold">Total Students</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600">
                    <Zap />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {state.students.filter(s => s.rainbow && s.mechanism && s.bait).length}
                    </div>
                    <div className="text-sm text-emerald-600 uppercase tracking-wider font-semibold">Requirement Ready</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${allRequirementsMet ? 'bg-green-500 text-white animate-pulse' : 'bg-red-100 text-red-600'}`}>
                    {allRequirementsMet ? <Unlock /> : <Lock />}
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{allRequirementsMet ? 'READY' : 'LOCKED'}</div>
                    <div className="text-sm text-emerald-600 uppercase tracking-wider font-semibold">Master Lock Status</div>
                  </div>
                </div>
              </div>

              {/* Student Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {state.students.map(student => (
                  <motion.div 
                    layout
                    key={student.id}
                    className={`p-5 rounded-3xl border-2 transition-all ${
                      (student.rainbow && student.mechanism && student.bait) 
                      ? 'bg-emerald-50 border-emerald-500 shadow-md' 
                      : 'bg-white border-emerald-100 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg truncate pr-2">{student.name}</h3>
                      {(student.rainbow && student.mechanism && student.bait) && (
                        <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <RequirementButton 
                        label="Rainbow Collected" 
                        active={student.rainbow} 
                        onClick={() => toggleRequirement(student.id, 'rainbow')} 
                        icon={<Rainbow size={16} />}
                        color="text-red-500"
                      />
                      <RequirementButton 
                        label="Leprechaun Caught" 
                        active={student.mechanism} 
                        onClick={() => toggleRequirement(student.id, 'mechanism')} 
                        icon={<Zap size={16} />}
                        color="text-blue-500"
                      />
                      <RequirementButton 
                        label="Pot of Gold" 
                        active={student.bait} 
                        onClick={() => toggleRequirement(student.id, 'bait')} 
                        icon={<Coins size={16} />}
                        color="text-yellow-500"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Master Lock Section */}
              <AnimatePresence>
                {allRequirementsMet && (
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-900 text-white p-10 rounded-[3rem] shadow-2xl border-4 border-yellow-500 text-center relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-400 to-transparent"></div>
                    
                    <div className="relative z-10 max-w-xl mx-auto">
                      <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Lock size={48} className="text-emerald-900" />
                      </div>
                      <h2 className="text-4xl font-bold mb-4">The Master Lock is Active!</h2>
                      
                      <div className="bg-emerald-800/50 p-6 rounded-2xl mb-8 border border-emerald-700 text-left">
                        <h3 className="text-yellow-400 font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                          <Sparkles size={16} /> The Leprechaun's Riddle
                        </h3>
                        <div className="space-y-2 font-serif italic text-lg text-emerald-50">
                          {RIDDLE_LINES.slice(0, hintIndex + 1).map((line, i) => (
                            <motion.p 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              key={i}
                            >
                              {line}
                            </motion.p>
                          ))}
                        </div>
                        
                        {hintIndex < RIDDLE_LINES.length - 1 && (
                          <button 
                            onClick={() => setHintIndex(prev => prev + 1)}
                            className="mt-6 text-sm font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition-colors"
                          >
                            <Plus size={14} /> Reveal Next Hint
                          </button>
                        )}
                      </div>

                      <p className="text-emerald-100 mb-8 text-lg">
                        Solve the riddle together and enter the secret word to unlock the leprechaun's treasure!
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input 
                          type="text" 
                          value={inputCode}
                          onChange={(e) => setInputCode(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                          placeholder="ENTER SECRET WORD..."
                          className="flex-1 px-6 py-4 rounded-2xl bg-white text-emerald-950 font-mono text-xl uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-yellow-400"
                        />
                        <button 
                          onClick={handleUnlock}
                          className="px-10 py-4 bg-yellow-500 text-emerald-900 rounded-2xl font-bold text-xl hover:bg-yellow-400 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          UNLOCK <Play fill="currentColor" size={20} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!allRequirementsMet && (
                <div className="text-center py-10 opacity-40">
                  <Lock className="mx-auto mb-2" />
                  <p>Complete all student requirements to reveal the Master Lock</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-6xl mx-auto p-10 text-center text-emerald-600/50 text-sm relative z-10">
        <p>© 2026 St. Patrick's Day Classroom Challenge</p>
      </footer>
    </div>
  );
}

function RequirementButton({ label, active, onClick, icon, color }: { 
  label: string, 
  active: boolean, 
  onClick: () => void, 
  icon: React.ReactNode,
  color: string
}) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all ${
        active 
        ? 'bg-emerald-100 border-emerald-200 text-emerald-800' 
        : 'bg-white border-emerald-50 text-emerald-400 hover:border-emerald-200'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={active ? color : 'text-emerald-200'}>{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {active ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Circle size={16} />}
    </button>
  );
}
