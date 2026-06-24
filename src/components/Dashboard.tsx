import React, { useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, CheckCircle, Clock, ShieldAlert, Sparkles, BarChart3, PieChart, Sliders, Cpu, ArrowRight } from "lucide-react";
import { Issue, DashboardStats } from "../types";

interface DashboardProps {
  issues: Issue[];
  onSelectCategory: (category: string | null) => void;
  selectedCategory: string | null;
}

export default function Dashboard({ issues, onSelectCategory, selectedCategory }: DashboardProps) {
  // Simulation states for AI Priority Agent
  const [simSeverity, setSimSeverity] = useState<string>("Medium");
  const [simVotes, setSimVotes] = useState<number>(12);
  const [simAge, setSimAge] = useState<number>(48); // age in hours
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<{ priority: string; explanation: string } | null>(null);
  const [simError, setSimError] = useState<string | null>(null);

  const runPrioritySimulation = async () => {
    setSimulating(true);
    setSimError(null);
    try {
      const response = await fetch("/api/prioritize-agent-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          severity: simSeverity,
          votes: simVotes,
          ageHours: simAge,
        }),
      });
      if (!response.ok) {
        throw new Error("Simulation endpoint returned an error");
      }
      const data = await response.json();
      setSimResult(data);
    } catch (err: any) {
      console.error(err);
      setSimError(err.message || "Failed to run AI Priority Agent simulation.");
    } finally {
      setSimulating(false);
    }
  };

  // Compute Stats
  const total = issues.length;
  const open = issues.filter((i) => i.status !== "Resolved").length;
  const resolved = issues.filter((i) => i.status === "Resolved").length;
  const highPriority = issues.filter(
    (i) => i.severity === "Critical" || i.severity === "High"
  ).length;

  // Compute Category Counts
  const categories = ["Pothole", "Garbage Dump", "Water Leak", "Damaged Streetlight", "Road Damage", "Other"];
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = issues.filter((i) => i.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  // Compute Severity Counts
  const severities = ["Low", "Medium", "High", "Critical"];
  const severityColors = {
    Low: "bg-emerald-500",
    Medium: "bg-amber-500",
    High: "bg-orange-500",
    Critical: "bg-red-500",
  };
  const severityTextColors = {
    Low: "text-emerald-500",
    Medium: "text-amber-500",
    High: "text-orange-500",
    Critical: "text-red-500",
  };
  const severityCounts = severities.reduce((acc, sev) => {
    acc[sev] = issues.filter((i) => i.severity === sev).length;
    return acc;
  }, {} as Record<string, number>);

  const totalSeverityCount = Object.values(severityCounts).reduce((a, b) => a + b, 0) || 1;

  // Compute AI Priority Counts
  const priorities = ["Low", "Medium", "High", "Critical"];
  const priorityColorsMap = {
    Low: "bg-emerald-500",
    Medium: "bg-blue-500",
    High: "bg-orange-500",
    Critical: "bg-red-500",
  };
  const priorityCounts = priorities.reduce((acc, pri) => {
    acc[pri] = issues.filter((i) => (i.priority || "Low") === pri).length;
    return acc;
  }, {} as Record<string, number>);

  const totalPriorityCount = Object.values(priorityCounts).reduce((a, b) => a + b, 0) || 1;

  // Cards Data
  const statsCards = [
    {
      id: "stat-total",
      title: "Total Issues",
      value: total,
      sub: "Citizen submissions",
      icon: AlertTriangle,
      color: "bg-slate-50 text-slate-700 border-slate-200",
      iconColor: "text-slate-500",
    },
    {
      id: "stat-open",
      title: "Open Action Items",
      value: open,
      sub: "Awaiting resolution",
      icon: Clock,
      color: "bg-amber-50/50 text-amber-900 border-amber-100",
      iconColor: "text-amber-600",
    },
    {
      id: "stat-resolved",
      title: "Resolved Issues",
      value: resolved,
      sub: "Fixed & closed",
      icon: CheckCircle,
      color: "bg-emerald-50/50 text-emerald-900 border-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      id: "stat-high",
      title: "Urgent Concerns",
      value: highPriority,
      sub: "High & Critical severity",
      icon: ShieldAlert,
      color: "bg-red-50/50 text-red-900 border-red-100",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`p-4 rounded-2xl border ${card.color} flex flex-col justify-between shadow-xs`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider uppercase opacity-80">{card.title}</span>
                <IconComponent className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold font-display tracking-tight">{card.value}</span>
                <p className="text-[11px] opacity-75 mt-0.5">{card.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts & Priority Agent Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <h3 className="font-display font-semibold text-slate-900">Issues by Category</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">Click a category bar below to filter the reports</p>
          </div>

          <div className="grid grid-cols-6 gap-2 items-end h-44 px-2">
            {categories.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const heightPercent = Math.max(8, (count / maxCategoryCount) * 100);
              const isSelected = selectedCategory === cat;

              return (
                <div key={cat} className="flex flex-col items-center group h-full justify-end cursor-pointer" onClick={() => onSelectCategory(isSelected ? null : cat)}>
                  <div className="w-full relative flex justify-center">
                    {/* Tooltip */}
                    <div className="absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-mono">
                      {count} {count === 1 ? "issue" : "issues"}
                    </div>

                    {/* Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                      className={`w-full rounded-t-xl transition-all ${
                        isSelected
                          ? "bg-slate-800 shadow-md ring-2 ring-slate-400"
                          : "bg-slate-100 group-hover:bg-slate-200"
                      }`}
                    />
                  </div>
                  {/* Category Label */}
                  <span className={`text-[9px] mt-2 text-center font-medium line-clamp-1 w-full ${isSelected ? "text-slate-900 font-bold" : "text-slate-500"}`}>
                    {cat.replace("Damaged ", "")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity & Priority Breakdown Card */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieChart className="w-4 h-4 text-slate-500" />
              <h3 className="font-display font-semibold text-slate-900">Urgency & Priority Distribution</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">Comparative triage metrics across all reported incidents</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Severity Levels */}
            <div className="space-y-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1">Severity Levels</span>
              <div className="space-y-2">
                {severities.map((sev) => {
                  const count = severityCounts[sev] || 0;
                  const percentage = Math.round((count / totalSeverityCount) * 100);

                  return (
                    <div key={sev} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${severityColors[sev as keyof typeof severityColors]}`} />
                        <span className="font-medium text-slate-600">{sev}</span>
                      </div>
                      <span className="font-semibold text-slate-800 font-mono">
                        {count} <span className="text-[10px] text-slate-400 font-normal">({percentage}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Priority Triage */}
            <div className="space-y-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                AI Priority Triage
              </span>
              <div className="space-y-2">
                {priorities.map((pri) => {
                  const count = priorityCounts[pri] || 0;
                  const percentage = Math.round((count / totalPriorityCount) * 100);

                  let colorStyle = "bg-emerald-500";
                  if (pri === "Medium") colorStyle = "bg-blue-500";
                  if (pri === "High") colorStyle = "bg-orange-500";
                  if (pri === "Critical") colorStyle = "bg-red-500";

                  return (
                    <div key={pri} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${colorStyle}`} />
                        <span className="font-medium text-slate-600">{pri}</span>
                      </div>
                      <span className="font-semibold text-slate-800 font-mono">
                        {count} <span className="text-[10px] text-slate-400 font-normal">({percentage}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Priority Engine Agent Information Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-700"
      >
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
            <h4 className="font-display font-semibold text-white tracking-wide">AI Priority Agent Online</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The municipal priority queue is automatically audited using standard triage metrics:{" "}
            <span className="text-amber-200 font-semibold font-mono">Priority Score = Severity Level + Community Endorsements + Complaint Age</span>.
            This ensures critical public hazards are resolved first, free of administrative bias.
          </p>
        </div>
        <div className="flex items-center gap-6 bg-slate-800/80 p-3 rounded-xl border border-slate-700 font-mono text-[11px] shrink-0">
          <div>
            <div className="text-slate-400">Severity Max</div>
            <div className="text-red-400 font-bold text-sm">100 pts</div>
          </div>
          <div className="border-l border-slate-700 h-8" />
          <div>
            <div className="text-slate-400">Vote Weight</div>
            <div className="text-amber-300 font-bold text-sm">5 pts / vote</div>
          </div>
          <div className="border-l border-slate-700 h-8" />
          <div>
            <div className="text-slate-400">Age Slope</div>
            <div className="text-teal-300 font-bold text-sm">+0.5 pts / hr</div>
          </div>
        </div>
      </motion.div>

      {/* AI Priority Agent Simulator Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Sliders className="w-4 h-4 text-slate-500" />
          <h3 className="font-display font-semibold text-slate-900">AI Priority Agent Simulator</h3>
          <span className="text-[9px] font-bold text-white bg-blue-500 px-1.5 py-0.5 rounded uppercase tracking-wider ml-auto">Gemini 2.5 Flash</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Manually adjust risk factors to simulate how the AI Triage Agent classifies incident reports dynamically.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Severity Selection */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Severity Level</label>
                <select
                  value={simSeverity}
                  onChange={(e) => setSimSeverity(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 focus:border-slate-800 focus:outline-none rounded-xl px-3 py-2 transition-all cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Endorsements / Votes Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Endorsements (Votes)</label>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{simVotes}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={simVotes}
                  onChange={(e) => setSimVotes(Number(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
              </div>

              {/* Age Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Incident Age (Hours)</label>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{simAge}h</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="168" // up to 1 week
                  value={simAge}
                  onChange={(e) => setSimAge(Number(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
              </div>
            </div>

            <button
              onClick={runPrioritySimulation}
              disabled={simulating}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Cpu className={`w-4 h-4 ${simulating ? "animate-spin" : ""}`} />
              <span>{simulating ? "AI Thinking..." : "Analyze Incident Priority Class"}</span>
            </button>
          </div>

          {/* Outputs */}
          <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-center min-h-[10rem]">
            {simError && (
              <div className="text-center text-xs text-red-500 p-2">
                <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-red-400" />
                {simError}
              </div>
            )}

            {!simResult && !simError && !simulating && (
              <div className="text-center text-xs text-slate-400 space-y-1.5">
                <Sparkles className="w-6 h-6 mx-auto text-slate-300" />
                <p className="font-semibold">Awaiting Agent Inputs</p>
                <p className="text-[10px] leading-relaxed max-w-[15rem] mx-auto">
                  Modify the indicators and run analysis to invoke the AI Priority Agent decision tree.
                </p>
              </div>
            )}

            {simulating && (
              <div className="text-center text-xs text-slate-500 space-y-1.5">
                <Cpu className="w-6 h-6 mx-auto text-slate-400 animate-spin" />
                <p className="font-semibold uppercase tracking-wider text-[10px]">Calling Gemini Flash API...</p>
                <p className="text-[10px]">Analyzing risk multipliers and computing safety matrix.</p>
              </div>
            )}

            {simResult && !simulating && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agent Evaluation</span>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      simResult.priority === "Critical"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : simResult.priority === "High"
                        ? "bg-orange-50 text-orange-700 border-orange-200"
                        : simResult.priority === "Medium"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {simResult.priority} Priority
                  </span>
                </div>

                <div className="bg-white border border-slate-150 p-3 rounded-xl shadow-xs">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" /> Gemini Reason
                  </p>
                  <p className="text-xs text-slate-700 italic leading-relaxed font-sans">
                    "{simResult.explanation}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
