import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, ThumbsUp, Calendar, AlertTriangle, ArrowRight, UserCheck, Shield, ClipboardList, Sparkles, Building2, HelpCircle, ChevronRight, Trash2 } from "lucide-react";
import { Issue, IssueStatus } from "../types";

interface IssueCardProps {
  key?: string;
  issue: Issue;
  onUpvote: (id: string) => void;
  onStatusUpdate: (id: string, status: IssueStatus, description: string) => void;
  onDelete: (id: string) => void;
}

export default function IssueCard({ issue, onUpvote, onStatusUpdate, onDelete }: IssueCardProps) {
  const [upvoting, setUpvoting] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminStatus, setAdminStatus] = useState<IssueStatus>(issue.status);
  const [adminNote, setAdminNote] = useState("");
  const [showPriorityFormula, setShowPriorityFormula] = useState(false);

  // Compute Severity Colors
  const severityColors = {
    Low: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Medium: "bg-amber-50 text-amber-700 border-amber-100",
    High: "bg-orange-50 text-orange-700 border-orange-100",
    Critical: "bg-red-50 text-red-700 border-red-100",
  };

  // Compute Status Badges
  const statusColors = {
    Reported: "bg-slate-100 text-slate-700 border-slate-200",
    Verified: "bg-blue-50 text-blue-700 border-blue-150",
    "In Progress": "bg-indigo-50 text-indigo-700 border-indigo-150",
    Resolved: "bg-emerald-150 text-emerald-800 border-emerald-200",
  };

  // Compute AI Priority Colors
  const priorityColors = {
    Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Medium: "bg-blue-50 text-blue-700 border-blue-200",
    High: "bg-orange-50 text-orange-700 border-orange-200",
    Critical: "bg-red-50 text-red-700 border-red-200",
  };

  // Relative Date Helper
  const getRelativeAge = (isoString: string) => {
    const elapsedMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(elapsedMs / (1000 * 60));
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleUpvoteClick = async () => {
    setUpvoting(true);
    await onUpvote(issue.id);
    setUpvoting(false);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStatusUpdate(issue.id, adminStatus, adminNote || `Issue status advanced to ${adminStatus}.`);
    setAdminNote("");
    setShowAdmin(false);
  };

  // Score Calculations breakdown for Priority Agent Transparency
  const sevPoints = issue.severity === "Low" ? 10 : issue.severity === "Medium" ? 30 : issue.severity === "High" ? 60 : 100;
  const votePoints = issue.upvotes * 5;
  const ageHours = Math.max(0, (Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60));
  const agePoints = Math.round(Math.min(100, ageHours * 0.5));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col md:flex-row h-full"
    >
      {/* Visual Image Banner Section */}
      <div className="w-full md:w-72 shrink-0 relative bg-slate-900 overflow-hidden h-52 md:h-auto min-h-[14rem]">
        {issue.imageUrl.startsWith("http") ? (
          <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover" />
        ) : (
          <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover" />
        )}
        {/* Hover category overlay */}
        <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
          {issue.category}
        </span>
      </div>

      {/* Narrative Section */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Tagline / Department and Age */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-semibold font-mono">
            <span className="flex items-center gap-1 uppercase tracking-wide">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {issue.department}
            </span>
            <span className="flex items-center gap-1 uppercase tracking-wide">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {getRelativeAge(issue.createdAt)}
            </span>
          </div>

          {/* Headline */}
          <h3 className="text-md font-bold font-display text-slate-900 leading-tight">
            {issue.title}
          </h3>

          {/* Summary / Core Description */}
          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
            {issue.summary || issue.description}
          </p>

          {/* Location details */}
          <div className="flex items-start gap-1 text-xs text-slate-500 pt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
            <span className="line-clamp-2">{issue.location}</span>
          </div>
        </div>

        {/* Technical Triage Indicators (Priority & Severity) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-50">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${severityColors[issue.severity]}`}>
            {issue.severity}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColors[issue.status]}`}>
            {issue.status}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1 ${priorityColors[issue.priority || "Low"]}`}>
            <Sparkles className="w-3 h-3 text-current" />
            Priority: {issue.priority || "Low"}
          </span>

          {/* Interactive Priority Score */}
          <div className="relative">
            <button
              onClick={() => setShowPriorityFormula(!showPriorityFormula)}
              className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
              Score: {issue.priorityScore}
              <HelpCircle className="w-3 h-3 text-slate-400" />
            </button>

            <AnimatePresence>
              {showPriorityFormula && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute bottom-8 left-0 w-56 bg-slate-950 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-[10px] space-y-1.5 z-10"
                >
                  <p className="font-bold border-b border-slate-800 pb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> Priority breakdown
                  </p>
                  <div className="space-y-1 font-mono text-slate-300">
                    <div className="flex justify-between">
                      <span>Severity ({issue.severity}):</span>
                      <span className="text-red-400">+{sevPoints} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Votes ({issue.upvotes}):</span>
                      <span className="text-amber-300">+{votePoints} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Age Slope:</span>
                      <span className="text-teal-300">+{agePoints} pts</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-800 pt-1 flex justify-between font-bold">
                    <span>Total AI Score:</span>
                    <span className="text-white font-mono">{issue.priorityScore}</span>
                  </div>
                  {issue.priorityExplanation && (
                    <div className="border-t border-slate-800 pt-1.5 mt-1">
                      <p className="font-bold text-slate-200 text-[9px] uppercase tracking-wider mb-0.5">AI Agent Reason</p>
                      <p className="text-slate-400 font-sans leading-normal italic text-[9.5px]">{issue.priorityExplanation}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Upvote & State Stepper Buttons */}
        <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <button
            onClick={handleUpvoteClick}
            disabled={upvoting}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${issue.upvotes > 1 ? "text-amber-500 fill-amber-200" : "text-slate-400"}`} />
            <span>Verify & Upvote ({issue.upvotes})</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdmin(!showAdmin)}
              className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors font-medium flex items-center gap-1 border-b border-slate-100 hover:border-slate-300"
            >
              <Shield className="w-3 h-3 text-slate-400" /> State Simulator
            </button>
            <button
              type="button"
              onClick={() => onDelete(issue.id)}
              className="text-[10px] text-red-400 hover:text-red-600 transition-colors font-medium flex items-center gap-1 border-b border-red-50 hover:border-red-200"
            >
              <Trash2 className="w-3 h-3 text-red-400" /> Delete
            </button>
          </div>
        </div>

        {/* Admin State Stepper simulation portal */}
        <AnimatePresence>
          {showAdmin && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAdminSubmit}
              className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2.5 overflow-hidden text-xs"
            >
              <div className="font-bold text-slate-700 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-slate-500" /> Municipal State Simulator
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(["Reported", "Verified", "In Progress", "Resolved"] as IssueStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setAdminStatus(st)}
                    className={`p-1.5 border rounded-lg font-semibold text-[10px] tracking-wide uppercase transition-colors text-center ${
                      adminStatus === st
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {st.replace("In ", "")}
                  </button>
                ))}
              </div>
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Official memo (e.g. Sanitization unit dispatched)"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 focus:border-slate-800 focus:outline-none rounded-lg text-xs"
                />
              </div>
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowAdmin(false)}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-[10px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[10px] font-semibold flex items-center gap-1"
                >
                  Update State <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Progress Timeline view */}
        <div className="bg-slate-50/50 rounded-xl p-3.5 border border-slate-100 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <ClipboardList className="w-3.5 h-3.5 text-slate-400" /> Tracking Milestones
          </div>
          <div className="relative pl-3 border-l border-slate-200 space-y-2.5">
            {issue.timeline.map((event) => (
              <div key={event.id} className="relative text-[11px]">
                {/* Visual bullet bullet point */}
                <span className={`absolute -left-[16.5px] top-1 w-2 h-2 rounded-full ring-4 ring-white ${
                  event.status === "Resolved"
                    ? "bg-emerald-500"
                    : event.status === "In Progress"
                    ? "bg-indigo-500"
                    : event.status === "Verified"
                    ? "bg-blue-500"
                    : "bg-slate-400"
                }`} />
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span className="text-[10px] font-bold tracking-wide uppercase">{event.status}</span>
                  <span className="text-[9px] text-slate-400 font-normal">{getRelativeAge(event.timestamp)}</span>
                </div>
                <p className="text-slate-500 text-[10px] mt-0.5 leading-normal">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
