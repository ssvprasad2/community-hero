import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, RefreshCw, AlertCircle, Sparkles, LayoutGrid } from "lucide-react";
import { Issue, IssueStatus, SeverityLevel } from "../types";
import IssueCard from "./IssueCard";

interface IssueListProps {
  issues: Issue[];
  onUpvote: (id: string) => void;
  onStatusUpdate: (id: string, status: IssueStatus, description: string) => void;
  onDelete: (id: string) => void;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function IssueList({
  issues,
  onUpvote,
  onStatusUpdate,
  onDelete,
  selectedCategory,
  onSelectCategory,
}: IssueListProps) {
  // Local filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | "All">("All");
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | "All">("All");
  const [sortBy, setSortBy] = useState<"priority" | "upvotes" | "newest">("priority");

  // Filter and Sort Logic
  const filteredIssues = issues
    .filter((issue) => {
      // Search term match
      const text = `${issue.title} ${issue.description} ${issue.location} ${issue.department} ${issue.category}`.toLowerCase();
      const matchesSearch = text.includes(searchTerm.toLowerCase());

      // Category filter match
      const matchesCategory = selectedCategory ? issue.category === selectedCategory : true;

      // Status match
      const matchesStatus = selectedStatus === "All" ? true : issue.status === selectedStatus;

      // Severity match
      const matchesSeverity = selectedSeverity === "All" ? true : issue.severity === selectedSeverity;

      return matchesSearch && matchesCategory && matchesStatus && matchesSeverity;
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        const priorityVal = (p: string) => {
          if (p === "Critical") return 4;
          if (p === "High") return 3;
          if (p === "Medium") return 2;
          return 1;
        };
        const pDiff = priorityVal(b.priority || "Low") - priorityVal(a.priority || "Low");
        if (pDiff !== 0) return pDiff;
        const scoreDiff = b.priorityScore - a.priorityScore;
        if (scoreDiff !== 0) return scoreDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "upvotes") {
        return b.upvotes - a.upvotes;
      }
      // "newest"
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const categories = ["Pothole", "Garbage Dump", "Water Leak", "Damaged Streetlight", "Road Damage", "Other"];
  const statuses: (IssueStatus | "All")[] = ["All", "Reported", "Verified", "In Progress", "Resolved"];
  const severities: (SeverityLevel | "All")[] = ["All", "Low", "Medium", "High", "Critical"];

  return (
    <div className="space-y-6">
      {/* Filtering Actions Panel */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports by title, location, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white focus:outline-none rounded-xl placeholder-slate-400 transition-all"
            />
          </div>

          {/* Sort selection dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 focus:border-slate-800 focus:outline-none rounded-xl px-3 py-2.5 transition-all cursor-pointer"
            >
              <option value="priority">Priority Queue (AI Rank)</option>
              <option value="upvotes">Community Upvotes</option>
              <option value="newest">Newest Incidents</option>
            </select>
          </div>
        </div>

        {/* Filter categories & parameters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 border-t border-slate-100 pt-4">
          {/* Category Filter Pills */}
          <div className="md:col-span-6 space-y-1.5">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Incident Category</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onSelectCategory(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  !selectedCategory
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  {cat.replace("Damaged ", "")}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Municipal Status</label>
            <div className="flex flex-wrap gap-1.5">
              {statuses.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedStatus === st
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Filter */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Severity Rating</label>
            <div className="flex flex-wrap gap-1.5">
              {severities.map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedSeverity === sev
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid count display */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
        <div className="flex items-center gap-1.5">
          <LayoutGrid className="w-4 h-4 text-slate-400" />
          <span>Showing {filteredIssues.length} incident {filteredIssues.length === 1 ? "report" : "reports"}</span>
        </div>
        {(searchTerm || selectedCategory || selectedStatus !== "All" || selectedSeverity !== "All") && (
          <button
            onClick={() => {
              setSearchTerm("");
              onSelectCategory(null);
              setSelectedStatus("All");
              setSelectedSeverity("All");
            }}
            className="text-slate-400 hover:text-slate-600 hover:underline flex items-center gap-1 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        )}
      </div>

      {/* Grid of Issue Cards */}
      <AnimatePresence mode="popLayout">
        {filteredIssues.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 xl:grid-cols-2 gap-6"
          >
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onUpvote={onUpvote}
                onStatusUpdate={onStatusUpdate}
                onDelete={onDelete}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-50 border border-slate-100 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-3"
          >
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-700">No Matching Reports found</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Adjust or reset your filters above. You can also report a new incident with the button at the top to add to the dashboard.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                onSelectCategory(null);
                setSelectedStatus("All");
                setSelectedSeverity("All");
              }}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
