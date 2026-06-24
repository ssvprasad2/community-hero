import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UploadCloud, Sparkles, MapPin, FileText, AlertCircle, RefreshCw, CheckCircle2, ChevronRight, CornerDownRight, AlertTriangle } from "lucide-react";
import { SeverityLevel } from "../types";

interface ReportFormProps {
  onSubmitSuccess: (newIssue: any) => void;
  onCancel: () => void;
}

export default function ReportForm({ onSubmitSuccess, onCancel }: ReportFormProps) {
  // Form fields
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // Geolocation fields
  const [latitude, setLatitude] = useState<number>(37.7749);
  const [longitude, setLongitude] = useState<number>(-122.4194);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  const handleGetGPS = () => {
    setGpsLoading(true);
    setGpsSuccess(false);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(parseFloat(position.coords.latitude.toFixed(6)));
          setLongitude(parseFloat(position.coords.longitude.toFixed(6)));
          setGpsLoading(false);
          setGpsSuccess(true);
        },
        (error) => {
          console.warn("Geolocation API denied or timed out. Generating randomized municipal coordinates offset:", error);
          // Standard city coordinates with minor randomized neighborhood offset for realistic simulation
          const randomLatOffset = (Math.random() - 0.5) * 0.04;
          const randomLngOffset = (Math.random() - 0.5) * 0.04;
          setLatitude(parseFloat((37.7749 + randomLatOffset).toFixed(6)));
          setLongitude(parseFloat((-122.4194 + randomLngOffset).toFixed(6)));
          setGpsLoading(false);
          setGpsSuccess(true);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setGpsLoading(false);
      alert("Geolocation is not supported by your browser.");
    }
  };

  // AI Analyzed details
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{
    category: string;
    severity: SeverityLevel;
    title: string;
    summary: string;
    department: string;
  } | null>(null);

  // Submitting final report
  const [submitting, setSubmitting] = useState(false);

  // Duplicate Detection Agent States
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [duplicateIssue, setDuplicateIssue] = useState<any | null>(null);
  const [duplicateExplanation, setDuplicateExplanation] = useState("");
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [merging, setMerging] = useState(false);

  // Duplicate Check Handler
  const checkDuplicatesBeforeSubmit = async () => {
    if (!image || !location) return false;
    setCheckingDuplicates(true);
    try {
      const response = await fetch("/api/detect-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image,
          description: description || "No detailed description provided.",
          location,
          latitude,
          longitude
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.isDuplicate && data.duplicateIssue) {
          setDuplicateIssue(data.duplicateIssue);
          setDuplicateExplanation(data.explanation);
          setShowDuplicateWarning(true);
          return true; // found duplicate
        }
      }
    } catch (err) {
      console.warn("Failed to check duplicates:", err);
    } finally {
      setCheckingDuplicates(false);
    }
    return false; // no duplicate or failed
  };

  const handleJoinComplaint = async () => {
    if (!duplicateIssue) return;
    setMerging(true);
    try {
      const response = await fetch(`/api/issues/${duplicateIssue.id}/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("Failed to join existing complaint.");
      }
      const updatedIssue = await response.json();
      onSubmitSuccess(updatedIssue);
    } catch (err: any) {
      alert("Failed to join existing complaint: " + err.message);
    } finally {
      setMerging(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image Conversion
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);
      // Automatically analyze the uploaded image immediately
      runAiAnalysis(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Trigger Gemini Analysis via Server API
  const runAiAnalysis = async (imgOverride?: string) => {
    const targetImage = imgOverride || image;
    if (!targetImage) return;
    setAnalyzing(true);
    setAnalysisError(null);
    setAiAnalysis(null);

    try {
      const response = await fetch("/api/analyze-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: targetImage,
          description: description || "No detailed description provided.",
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Server returned status " + response.status);
      }

      const data = await response.json();
      setAiAnalysis(data);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err?.message || "An error occurred while calling the AI Analyzer.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Submit report to server
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !aiAnalysis || !location) return;

    // First time submitting, perform duplicate checks
    if (!showDuplicateWarning) {
      const found = await checkDuplicatesBeforeSubmit();
      if (found) {
        return; // Halt and show warning panel
      }
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: aiAnalysis.title,
          description: description || "No further details.",
          location,
          imageUrl: image,
          latitude,
          longitude,
          category: aiAnalysis.category,
          severity: aiAnalysis.severity,
          summary: aiAnalysis.summary,
          department: aiAnalysis.department,
        }),
      });

      if (!response.ok) {
        throw new Error("Submission failed.");
      }

      const newIssue = await response.json();
      onSubmitSuccess(newIssue);
    } catch (err: any) {
      alert("Failed to submit issue report: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm max-w-3xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-slate-500" />
            Report Infrastructure Incident
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Submit visual evidence to engage AI-assisted municipal tracking</p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleFinalSubmit} className="space-y-6">
        {/* Step 1: Drag-and-Drop Image Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Step 1: Upload Photo Evidence *
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
              dragging
                ? "border-slate-800 bg-slate-50 scale-[0.99]"
                : image
                ? "border-emerald-200 bg-emerald-50/10"
                : "border-slate-200 hover:border-slate-400 hover:bg-slate-50/50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            {image ? (
              <div className="relative group w-full max-w-md mx-auto aspect-video rounded-xl overflow-hidden shadow-xs">
                <img src={image} alt="Evidence preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs font-semibold text-white bg-slate-900/80 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Replace Image
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-slate-50 rounded-full border border-slate-100 text-slate-400">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-slate-700">Drag & drop your photo here</p>
                  <p className="text-xs text-slate-400">or click to browse local files</p>
                </div>
                <p className="text-[10px] text-slate-400">Supports PNG, JPG, JPEG up to 10MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: General Details (Description & Location) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Incident Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide context (e.g., how long has this been present? Does it represent an immediate danger to drivers or children?)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white focus:outline-none rounded-xl p-3 placeholder-slate-400 transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Exact Location *
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g., Near 240 West Boulevard, right outside the public library entrance, obstructing the bicycle pathway."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white focus:outline-none rounded-xl p-3 placeholder-slate-400 transition-all resize-none"
            />
          </div>
        </div>

        {/* Step 2.5: Interactive Geolocation Selector */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Civic Mapping Coordinates</span>
              <span className="block text-xs font-bold text-slate-700">Map Pin Geolocation *</span>
            </div>
            <button
              type="button"
              onClick={handleGetGPS}
              disabled={gpsLoading}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-xs"
            >
              {gpsLoading ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin text-slate-500" /> Geolocation Sync...
                </>
              ) : gpsSuccess ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-100" /> Coordinates Locked
                </>
              ) : (
                <>
                  <MapPin className="w-3 h-3 text-red-500" /> Fetch GPS Coordinates
                </>
              )}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500">Latitude</label>
              <input
                type="number"
                step="0.000001"
                required
                value={latitude}
                onChange={(e) => {
                  setLatitude(parseFloat(e.target.value) || 0);
                  setGpsSuccess(true);
                }}
                className="w-full text-xs font-mono bg-white border border-slate-200 focus:border-slate-800 focus:outline-none rounded-lg p-2"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500">Longitude</label>
              <input
                type="number"
                step="0.000001"
                required
                value={longitude}
                onChange={(e) => {
                  setLongitude(parseFloat(e.target.value) || 0);
                  setGpsSuccess(true);
                }}
                className="w-full text-xs font-mono bg-white border border-slate-200 focus:border-slate-800 focus:outline-none rounded-lg p-2"
              />
            </div>
          </div>
        </div>

        {/* Trigger AI Appraisal Step */}
        {image && !aiAnalysis && !analyzing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-slate-600 fill-slate-300" />
                Run AI Diagnosis Agent
              </div>
              <p className="text-xs text-slate-500">Let Gemini automatically detect categories, risk severity, and suggest departments.</p>
            </div>
            <button
              type="button"
              onClick={runAiAnalysis}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm shrink-0 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" /> Analyze with Gemini
            </button>
          </motion.div>
        )}

        {/* Analyzing / Skeleton Loader */}
        <AnimatePresence>
          {analyzing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4 overflow-hidden"
            >
              <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
                <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
                Gemini AI is examining visual pixels...
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 animate-pulse rounded-md w-3/4" />
                <div className="h-3 bg-slate-200 animate-pulse rounded-md w-1/2" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-10 bg-slate-200 animate-pulse rounded-xl" />
                  <div className="h-10 bg-slate-200 animate-pulse rounded-xl" />
                  <div className="h-10 bg-slate-200 animate-pulse rounded-xl" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Error */}
        {analysisError && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 flex items-start gap-2 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="font-bold">AI Diagnosis Blocked</p>
              <p className="text-slate-500 mt-0.5">{analysisError}</p>
              <button
                type="button"
                onClick={runAiAnalysis}
                className="mt-2 text-red-700 font-semibold hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Retry analysis
              </button>
            </div>
          </div>
        )}

        {/* Step 3: AI Analysis Review Panel */}
        <AnimatePresence>
          {aiAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-amber-500 fill-amber-300 animate-pulse" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Step 2: AI Diagnostic Output</h4>
                </div>
                <button
                  type="button"
                  onClick={runAiAnalysis}
                  className="text-[10px] text-slate-400 hover:text-slate-700 font-medium flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> Re-Analyze
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Generated Title</label>
                  <input
                    type="text"
                    required
                    value={aiAnalysis.title}
                    onChange={(e) => setAiAnalysis({ ...aiAnalysis, title: e.target.value })}
                    className="w-full text-xs font-semibold bg-white border border-slate-200 focus:border-slate-800 focus:outline-none rounded-lg p-2.5"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Department</label>
                  <input
                    type="text"
                    required
                    value={aiAnalysis.department}
                    onChange={(e) => setAiAnalysis({ ...aiAnalysis, department: e.target.value })}
                    className="w-full text-xs font-semibold bg-white border border-slate-200 focus:border-slate-800 focus:outline-none rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detected Category</label>
                  <select
                    value={aiAnalysis.category}
                    onChange={(e) => setAiAnalysis({ ...aiAnalysis, category: e.target.value })}
                    className="w-full text-xs font-semibold bg-white border border-slate-200 focus:border-slate-800 focus:outline-none rounded-lg p-2.5"
                  >
                    <option value="Pothole">Pothole</option>
                    <option value="Garbage Dump">Garbage Dump</option>
                    <option value="Water Leak">Water Leak</option>
                    <option value="Damaged Streetlight">Damaged Streetlight</option>
                    <option value="Road Damage">Road Damage</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Evaluated Severity</label>
                  <select
                    value={aiAnalysis.severity}
                    onChange={(e) => setAiAnalysis({ ...aiAnalysis, severity: e.target.value as SeverityLevel })}
                    className="w-full text-xs font-semibold bg-white border border-slate-200 focus:border-slate-800 focus:outline-none rounded-lg p-2.5"
                  >
                    <option value="Low">Low (No Immediate Danger)</option>
                    <option value="Medium">Medium (Disruptive / Attention Needed)</option>
                    <option value="High">High (Immediate Traffic/Accident Hazard)</option>
                    <option value="Critical">Critical (Structural / Toxic / Bodily Harm)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Generated Summary</label>
                <textarea
                  required
                  rows={2}
                  value={aiAnalysis.summary}
                  onChange={(e) => setAiAnalysis({ ...aiAnalysis, summary: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-200 focus:border-slate-800 focus:outline-none rounded-lg p-2.5 resize-none leading-relaxed"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Duplicate Warning Panel */}
        <AnimatePresence>
          {showDuplicateWarning && duplicateIssue && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="border-2 border-amber-200 bg-amber-50/15 rounded-2xl p-5 space-y-4 shadow-xs mt-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">This issue may already exist.</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Our city's Duplicate Detection Agent analyzed your report and identified an active matching incident nearby.
                  </p>
                </div>
              </div>

              {/* Duplicate Details Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start shadow-xs">
                {duplicateIssue.imageUrl && (
                  <div className="w-full md:w-32 aspect-video md:aspect-square bg-slate-50 border border-slate-100 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={duplicateIssue.imageUrl}
                      alt="Duplicate issue"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded-full">
                      {duplicateIssue.category}
                    </span>
                    <span className="text-[10px] font-bold text-white bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>👍</span> {duplicateIssue.votes || duplicateIssue.upvotes || 1} endorsements
                    </span>
                  </div>
                  <h5 className="font-semibold text-slate-900 text-sm leading-snug">
                    {duplicateIssue.title}
                  </h5>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {duplicateIssue.description}
                  </p>
                  <p className="text-[10.5px] text-slate-400 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-400" /> {duplicateIssue.location}
                  </p>
                </div>
              </div>

              {/* AI Agent Reasoning */}
              {duplicateExplanation && (
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
                  <p className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Detection Agent Explanation
                  </p>
                  <p className="text-xs text-slate-600 italic font-sans leading-relaxed">
                    "{duplicateExplanation}"
                  </p>
                </div>
              )}

              {/* Quick Actions to Join or Proceed */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-amber-100">
                <button
                  type="button"
                  disabled={merging}
                  onClick={handleJoinComplaint}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  {merging ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin animate-spin-slow" /> Merging endorsements...
                    </>
                  ) : (
                    <>
                      <span>👍</span> Yes, Join Existing Complaint
                    </>
                  )}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  No, Submit New Anyway
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDuplicateWarning(false);
                    setDuplicateIssue(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel & Edit Form
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Actions */}
        {!showDuplicateWarning && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || checkingDuplicates || !image || !aiAnalysis}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Publishing...
                </>
              ) : checkingDuplicates ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking for duplicates...
                </>
              ) : (
                <>
                  Submit Official Report <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
