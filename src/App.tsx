import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, Plus, Sparkles, Building, BarChart2, ShieldCheck, CheckCircle2, RefreshCw } from "lucide-react";
import { Issue, IssueStatus } from "./types";
import Dashboard from "./components/Dashboard";
import ReportForm from "./components/ReportForm";
import IssueList from "./components/IssueList";
import PredictiveAgent from "./components/PredictiveAgent";

export default function App() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"listings" | "predictive">("listings");

  // Fetch all issues from full-stack backend
  const fetchIssues = async () => {
    try {
      setError(null);
      const response = await fetch("/api/issues");
      if (!response.ok) {
        throw new Error("Failed to load reports from the database");
      }
      const data = await response.json();
      setIssues(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected error occurred while fetching issues.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // Handle citizen endorsement / upvoting
  const handleUpvote = async (id: string) => {
    try {
      const response = await fetch(`/api/issues/${id}/upvote`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to cast upvote");
      }
      const updatedIssue = await response.json();

      // Update state locally
      setIssues((prev) =>
        prev.map((issue) => (issue.id === id ? { ...issue, ...updatedIssue } : issue))
      );
    } catch (err: any) {
      alert("Error upvoting: " + err.message);
    }
  };

  // Handle official municipal progress stepping
  const handleStatusUpdate = async (id: string, status: IssueStatus, description: string) => {
    try {
      const response = await fetch(`/api/issues/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, description }),
      });
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      const updatedIssue = await response.json();

      // Update state locally
      setIssues((prev) =>
        prev.map((issue) => (issue.id === id ? { ...issue, ...updatedIssue } : issue))
      );
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
  };

  // Handle citizen/municipal report deletion
  const handleDeleteIssue = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this municipal report permanently?")) {
      return;
    }
    try {
      const response = await fetch(`/api/issues/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete issue report");
      }
      // Update local state
      setIssues((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      alert("Error deleting report: " + err.message);
    }
  };

  // Form submission success callback
  const handleReportSuccess = (newIssue: Issue) => {
    setIssues((prev) => [newIssue, ...prev]);
    setShowForm(false);
    // Smooth scroll back to listings or stats
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Professional Portal Header Banner */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Civic Agency Label */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-white p-2 rounded-xl border border-slate-800 shadow-sm flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-bold text-slate-900 tracking-tight text-md">
                  Community Hero
                </h1>
                <span className="text-[9px] font-bold text-white bg-emerald-500 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Civic AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Metropolitan Care & Infrastructure Portal</p>
            </div>
          </div>

          {/* Action button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchIssues()}
              className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-all"
              title="Refresh database"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (!showForm) {
                  // Scroll to form position
                  setTimeout(() => {
                    const formElement = document.getElementById("report-section");
                    formElement?.scrollIntoView({ behavior: "smooth" });
                  }, 50);
                }
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>Report Infrastructure Incident</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 flex items-start gap-3 max-w-2xl mx-auto text-xs leading-relaxed">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="font-bold">Sync Error</p>
              <p className="text-slate-500 mt-0.5">{error}</p>
              <button onClick={fetchIssues} className="mt-2 text-red-700 font-semibold hover:underline flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Retry syncing
              </button>
            </div>
          </div>
        )}

        {/* Wizard Form view */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              id="report-section"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="scroll-mt-24"
            >
              <ReportForm
                onSubmitSuccess={handleReportSuccess}
                onCancel={() => setShowForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Toggle Navigation Bar */}
        {!loading && (
          <div className="flex border-b border-slate-200 pb-0.5 max-w-7xl mx-auto mb-6">
            <button
              onClick={() => setActiveTab("listings")}
              className={`pb-3 px-6 text-xs font-bold tracking-tight uppercase transition-all relative flex items-center gap-2 ${
                activeTab === "listings" ? "text-slate-950 font-black" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span>🚨 Live Incident Triage</span>
              {activeTab === "listings" && (
                <motion.div layoutId="activeTabLine" className="absolute bottom-0 inset-x-0 h-1 bg-slate-950 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("predictive")}
              className={`pb-3 px-6 text-xs font-bold tracking-tight uppercase transition-all relative flex items-center gap-2 ${
                activeTab === "predictive" ? "text-slate-950 font-black" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span>🔮 Predictive Agent Grid</span>
                <span className="bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">AI</span>
              </span>
              {activeTab === "predictive" && (
                <motion.div layoutId="activeTabLine" className="absolute bottom-0 inset-x-0 h-1 bg-slate-950 rounded-t-full" />
              )}
            </button>
          </div>
        )}

        {/* Dashboard and stats summary */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Synchronizing platform data...</p>
          </div>
        ) : activeTab === "listings" ? (
          <div className="space-y-8">
            <Dashboard
              issues={issues}
              onSelectCategory={setSelectedCategory}
              selectedCategory={selectedCategory}
            />

            {/* Live Track Listings */}
            <div className="border-t border-slate-100 pt-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-slate-500" />
                  Live Triage Listings
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Explore, search, verify, or simulate progress statuses of community reported incidents</p>
              </div>

              <IssueList
                issues={issues}
                onUpvote={handleUpvote}
                onStatusUpdate={handleStatusUpdate}
                onDelete={handleDeleteIssue}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <PredictiveAgent />
          </motion.div>
        )}

      </main>

      {/* Footer Banner */}
      <footer className="bg-white border-t border-slate-100 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-700">Metropolitan Civic Administration System</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal max-w-md mx-auto">
            All incident reports undergo automated AI visual triage using Gemini. Personal tracking information is secure and filtered to respect citizen privacy.
          </p>
        </div>
      </footer>
    </div>
  );
}
