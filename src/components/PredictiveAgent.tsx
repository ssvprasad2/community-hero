import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MapPin, AlertTriangle, RefreshCw, Eye, ShieldAlert, Compass, ChevronRight, LayoutGrid, CheckCircle, Flame, Droplet, Zap, HelpCircle } from "lucide-react";

interface Sector {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  openIssueCount: number;
  resolvedIssueCount: number;
  totalIssueCount: number;
  categories: string[];
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Extreme";
  prediction: string;
}

interface Inspection {
  id: string;
  areaName: string;
  coordinates: { lat: number; lng: number };
  priority: "High" | "Medium" | "Low";
  reason: string;
  predictedIssueType: string;
}

export default function PredictiveAgent() {
  const [loading, setLoading] = useState(true);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [aiSummary, setAiSummary] = useState("");
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/predictive-analysis");
      if (response.ok) {
        const data = await response.json();
        setSectors(data.sectors || []);
        setInspections(data.recommendedInspections || []);
        setAiSummary(data.aiSummary || "");
        if (data.sectors && data.sectors.length > 0) {
          // Select highest risk sector by default
          const sorted = [...data.sectors].sort((a, b) => b.riskScore - a.riskScore);
          setSelectedSectorId(sorted[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch predictive analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const triggerRescan = () => {
    setScanning(true);
    setTimeout(() => {
      fetchAnalysis();
      setScanning(false);
    }, 1800);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Extreme": return "text-red-600 bg-red-50 border-red-200 hover:bg-red-100/50";
      case "High": return "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100/50";
      case "Medium": return "text-yellow-600 bg-yellow-50 border-yellow-100 hover:bg-yellow-100/30";
      default: return "text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100/30";
    }
  };

  const getRiskPulseColor = (level: string) => {
    switch (level) {
      case "Extreme": return "bg-red-500 shadow-red-500/50";
      case "High": return "bg-amber-500 shadow-amber-500/50";
      case "Medium": return "bg-yellow-500 shadow-yellow-500/50";
      default: return "bg-emerald-500 shadow-emerald-500/50";
    }
  };

  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes("water") || c.includes("leak")) return <Droplet className="w-3.5 h-3.5 text-blue-500" />;
    if (c.includes("pothole") || c.includes("road") || c.includes("damage")) return <Compass className="w-3.5 h-3.5 text-slate-500" />;
    if (c.includes("light") || c.includes("lamp")) return <Zap className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" />;
    if (c.includes("garbage") || c.includes("trash")) return <Flame className="w-3.5 h-3.5 text-amber-600" />;
    return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
  };

  const selectedSector = sectors.find(s => s.id === selectedSectorId);
  const selectedInspection = inspections.find(ins => ins.id === selectedInspectionId);

  // Approximate relative bounding box positions to render on a styled map grid SVG (37.75 - 37.81 Lat, -122.51 - -122.38 Lng)
  const mapCoordinatesToSvg = (lat: number, lng: number) => {
    const minLat = 37.750;
    const maxLat = 37.815;
    const minLng = -122.510;
    const maxLng = -122.380;

    // Normalised percentages
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100; // Flip Y for screen coords

    return {
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y))
    };
  };

  return (
    <div id="predictive-agent-section" className="bg-white border border-slate-150 rounded-3xl shadow-sm overflow-hidden p-6 md:p-8 space-y-8">
      {/* Upper Title Block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-slate-900 text-emerald-400 rounded-xl shadow-xs">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-slate-900 text-lg tracking-tight">
                  Predictive Infrastructure Agent
                </h3>
                <span className="text-[9px] font-bold text-white bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" /> GEMINI POWERED
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Automated spatial density tracking & future municipal hazard forecasts</p>
            </div>
          </div>
        </div>

        <button
          onClick={triggerRescan}
          disabled={loading || scanning}
          className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 disabled:opacity-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading || scanning ? "animate-spin" : ""}`} />
          <span>{scanning ? "Sweeping Grid..." : "Refresh Forecast Models"}</span>
        </button>
      </div>

      {loading ? (
        /* SKELETON RADAR SCAN LOADING SCREEN */
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-emerald-500/15 rounded-full animate-ping" />
            <div className="absolute inset-2 border border-slate-900/10 rounded-full animate-pulse" />
            <div className="w-16 h-16 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center shadow-lg border border-slate-800">
              <Compass className="w-8 h-8 animate-spin" />
            </div>
          </div>
          <div className="text-center max-w-sm space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">Synthesizing City Hazard Matrix</h4>
            <p className="text-xs text-slate-500 leading-normal px-4">
              Analyzing report density, calculating local sector risk scores, and calling the Gemini prediction model...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* TOP LEVEL INTUITIVE AI SUMMARY CARD */}
          {aiSummary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-slate-900 text-slate-100 p-5 md:p-6 rounded-2xl shadow-md border border-slate-850 flex flex-col md:flex-row gap-5 items-start"
            >
              {/* Radial gradient backing for sci-fi look */}
              <div className="absolute right-0 top-0 w-80 h-80 bg-radial from-emerald-500/15 to-transparent -mr-20 -mt-20 blur-2xl pointer-events-none rounded-full" />
              
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl shrink-0">
                <Sparkles className="w-6 h-6 fill-emerald-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/50 border border-emerald-900/40 px-2.5 py-0.5 rounded-full">
                    Active AI Synthesizer
                  </span>
                  <span className="text-slate-400 text-[10.5px] font-medium">• Overall Hazard Summary</span>
                </div>
                <p className="text-xs md:text-sm text-slate-300 font-sans leading-relaxed">
                  "{aiSummary}"
                </p>
              </div>
            </motion.div>
          )}

          {/* TWO COLUMN GRID: LEFT STYLIZED HEATMAP VIZ, RIGHT SIDEBAR DETAILS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* SVG HEATMAP VIEWPORT (SPAN 7) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <LayoutGrid className="w-4 h-4 text-slate-400" /> Interactive Heatmap Grid Viewport
                </h4>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                  Scope: Metro San Francisco Area
                </span>
              </div>

              {/* Styled Interactive Canvas Stage */}
              <div className="relative bg-slate-950 border border-slate-850 aspect-video w-full rounded-2xl overflow-hidden shadow-inner flex items-center justify-center group">
                
                {/* Cyber grid overlay backing */}
                <div 
                  className="absolute inset-0 opacity-[0.07] pointer-events-none" 
                  style={{
                    backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px), linear-gradient(to right, #ffffff11 1px, transparent 1px), linear-gradient(to bottom, #ffffff11 1px, transparent 1px)`,
                    backgroundSize: '24px 24px, 48px 48px, 48px 48px',
                    backgroundPosition: 'center'
                  }}
                />

                {/* City Shorelines Outline (Stylized SVG Drawing) */}
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 0,20 Q 30,50 60,30 T 120,40 T 180,20 T 240,60 T 300,50 T 400,20" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M 400,20 L 400,300 M 0,20 L 0,300" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
                </svg>

                {/* RADAR SWEEP LINE EFFECT */}
                <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent shadow-emerald-500/20 shadow-md animate-radar-sweep pointer-events-none" />

                {/* SVG RENDERING HOTSPOTS AND RECOMMENDATIONS */}
                <svg className="absolute inset-0 w-full h-full z-10 select-none">
                  
                  {/* SECTOR GLOWS & LABELS */}
                  {sectors.map((sec) => {
                    const pos = mapCoordinatesToSvg(sec.center.lat, sec.center.lng);
                    const isSelected = sec.id === selectedSectorId;
                    const rLevel = sec.riskLevel;

                    let glowColor = "rgba(16, 185, 129, 0.25)"; // Low
                    if (rLevel === "Extreme") glowColor = "rgba(239, 68, 68, 0.45)";
                    else if (rLevel === "High") glowColor = "rgba(245, 158, 11, 0.4)";
                    else if (rLevel === "Medium") glowColor = "rgba(234, 179, 8, 0.35)";

                    // Radius based on risk score & issue counts
                    const baseRadius = 25 + (sec.riskScore / 3);

                    return (
                      <g key={sec.id} className="cursor-pointer" onClick={() => { setSelectedSectorId(sec.id); setSelectedInspectionId(null); }}>
                        
                        {/* Interactive invisible larger circle to trigger click easily */}
                        <circle cx={`${pos.x}%`} cy={`${pos.y}%`} r={baseRadius + 15} fill="transparent" />

                        {/* Outer pulsing glow ripple */}
                        <circle 
                          cx={`${pos.x}%`} 
                          cy={`${pos.y}%`} 
                          r={baseRadius} 
                          fill={glowColor}
                          className={`transition-all duration-300 ${isSelected ? "animate-pulse" : "opacity-80"}`}
                        />
                        
                        {/* Concentric rings */}
                        <circle cx={`${pos.x}%`} cy={`${pos.y}%`} r={baseRadius * 0.6} fill="none" stroke={glowColor} strokeWidth="1" strokeDasharray={isSelected ? "none" : "2 2"} />
                        
                        {/* Center core coordinate dot */}
                        <circle 
                          cx={`${pos.x}%`} 
                          cy={`${pos.y}%`} 
                          r={isSelected ? 6 : 4} 
                          fill={rLevel === "Extreme" ? "#ef4444" : rLevel === "High" ? "#f59e0b" : rLevel === "Medium" ? "#eab308" : "#10b981"}
                          className="transition-all duration-300"
                        />

                        {/* Text Label Backdrop */}
                        <rect
                          x={`${pos.x - 30}%`}
                          y={`${pos.y - 18}%`}
                          width="60%"
                          height="14"
                          rx="4"
                          fill="rgba(15, 23, 42, 0.8)"
                          className={`transition-opacity duration-300 pointer-events-none ${isSelected ? "opacity-100" : "opacity-40"}`}
                        />

                        {/* Short Label text */}
                        <text
                          x={`${pos.x}%`}
                          y={`${pos.y - 10}%`}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="7"
                          fontWeight="bold"
                          className="pointer-events-none"
                        >
                          {sec.name.split(" ")[0]} ({sec.riskScore})
                        </text>

                      </g>
                    );
                  })}

                  {/* RECOMMENDED INSPECTION PINPOINT MARKERS */}
                  {inspections.map((ins) => {
                    const pos = mapCoordinatesToSvg(ins.coordinates.lat, ins.coordinates.lng);
                    const isSelected = ins.id === selectedInspectionId;
                    const isHigh = ins.priority === "High";

                    return (
                      <g 
                        key={ins.id} 
                        className="cursor-pointer" 
                        onClick={() => { setSelectedInspectionId(ins.id); setSelectedSectorId(null); }}
                      >
                        {/* Ring highlight if selected */}
                        {isSelected && (
                          <circle cx={`${pos.x}%`} cy={`${pos.y}%`} r="14" fill="none" stroke="#10b981" strokeWidth="1.5" className="animate-ping" />
                        )}

                        {/* Crosshairs marker backdrop */}
                        <line x1={`${pos.x - 6}%`} y1={`${pos.y}%`} x2={`${pos.x + 6}%`} y2={`${pos.y}%`} stroke={isHigh ? "#ef4444" : "#f59e0b"} strokeWidth="1" />
                        <line x1={`${pos.x}%`} y1={`${pos.y - 6}%`} x2={`${pos.x}%`} y2={`${pos.y + 6}%`} stroke={isHigh ? "#ef4444" : "#f59e0b"} strokeWidth="1" />

                        {/* Inner blinking dot */}
                        <circle 
                          cx={`${pos.x}%`} 
                          cy={`${pos.y}%`} 
                          r="4" 
                          fill={isHigh ? "#ef4444" : "#eab308"} 
                          stroke="#ffffff" 
                          strokeWidth="1" 
                          className="animate-pulse" 
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* FLOATING OVERLAY MAP UTILITIES */}
                <div className="absolute bottom-3 left-3 bg-slate-900/95 border border-slate-800 rounded-xl p-3 text-[10px] space-y-1.5 z-20 text-slate-300">
                  <p className="font-bold text-slate-200">Grid Legend</p>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 block" /> <span>Extreme Hazard Risk ({`>=`}75)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 block" /> <span>High Risk ({`>=`}50)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 block" /> <span>Medium Wear Risk ({`>=`}25)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 block" /> <span>Low Risk (Stable)</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800">
                      <span className="text-[12px] leading-none text-red-400">⌖</span> <span>Inspection Area</span>
                    </div>
                  </div>
                </div>

                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs border border-slate-800 px-2.5 py-1 rounded-full text-[9px] font-semibold text-slate-300 flex items-center gap-1">
                  <span>🛰️ LIVE SATELLITE ORBIT SECTOR MAP</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic text-center">
                Click on any colored sector area or pinpoint crosshair marker (⌖) on the radar viewport above to inspect predictive analysis.
              </p>
            </div>

            {/* SECTOR OR INSPECTION DETAIL COLUMN (SPAN 5) */}
            <div className="lg:col-span-5 space-y-6">
              
              <AnimatePresence mode="wait">
                {/* 1. SECTOR DETAIL ACTIVE TAB */}
                {selectedSector && (
                  <motion.div
                    key="sector-detail"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="border border-slate-150 rounded-2xl bg-slate-50/50 p-5 space-y-4 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">
                        Selected Sector Analysis
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRiskColor(selectedSector.riskLevel)}`}>
                        {selectedSector.riskLevel} Risk
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-display font-extrabold text-slate-900 text-md leading-tight">
                        {selectedSector.name}
                      </h4>
                      <p className="text-[10.5px] font-mono text-slate-500">
                        Sector Center: {selectedSector.center.lat.toFixed(4)}N, {selectedSector.center.lng.toFixed(4)}W
                      </p>
                    </div>

                    {/* RISK DIAL GRAPHICS */}
                    <div className="bg-white border border-slate-150 rounded-xl p-4 flex items-center justify-between shadow-xs">
                      <div className="space-y-1.5">
                        <p className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider">Dynamic Risk Score</p>
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-3xl font-black font-mono tracking-tight ${
                            selectedSector.riskScore >= 75 ? "text-red-600" :
                            selectedSector.riskScore >= 50 ? "text-amber-500" :
                            selectedSector.riskScore >= 25 ? "text-yellow-600" : "text-emerald-500"
                          }`}>
                            {selectedSector.riskScore}
                          </span>
                          <span className="text-xs text-slate-400">/ 100 max</span>
                        </div>
                      </div>

                      {/* Micro gauge visual */}
                      <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="28" cy="28" r="24" stroke="#f1f5f9" strokeWidth="5" fill="none" />
                          <circle 
                            cx="28" 
                            cy="28" 
                            r="24" 
                            stroke={
                              selectedSector.riskScore >= 75 ? "#ef4444" :
                              selectedSector.riskScore >= 50 ? "#f59e0b" :
                              selectedSector.riskScore >= 25 ? "#eab308" : "#10b981"
                            } 
                            strokeWidth="5" 
                            fill="none" 
                            strokeDasharray={150}
                            strokeDashoffset={150 - (150 * selectedSector.riskScore) / 100}
                          />
                        </svg>
                        <span className="absolute text-[10px] font-extrabold text-slate-700">GRID</span>
                      </div>
                    </div>

                    {/* SECTOR STATISTICS */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-white border border-slate-200/60 p-2.5 rounded-xl">
                        <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">Active Reports</p>
                        <p className="text-lg font-black text-slate-900 mt-0.5">{selectedSector.openIssueCount}</p>
                      </div>
                      <div className="bg-white border border-slate-200/60 p-2.5 rounded-xl">
                        <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">Resolved Reports</p>
                        <p className="text-lg font-black text-slate-900 mt-0.5">{selectedSector.resolvedIssueCount}</p>
                      </div>
                    </div>

                    {/* LOCAL ACTIVE CATEGORIES */}
                    {selectedSector.categories.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">Scanned Categories</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedSector.categories.map((cat, i) => (
                            <span key={i} className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1 text-[10.5px] font-semibold flex items-center gap-1.5">
                              {getCategoryIcon(cat)}
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI AGENT PREDICTIVE MODEL FEED */}
                    <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 border border-slate-800 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                        <span className="text-[10px] font-black tracking-wider text-emerald-300 uppercase">
                          AI Agent Predictive Forecast
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 italic font-medium leading-relaxed">
                        "{selectedSector.prediction}"
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* 2. RECOMMENDED INSPECTION DETAIL ACTIVE TAB */}
                {selectedInspection && (
                  <motion.div
                    key="inspection-detail"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="border border-red-150 rounded-2xl bg-red-50/10 p-5 space-y-4 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> High priority inspection spot
                      </span>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-red-50 text-red-700 rounded-full border border-red-200 uppercase tracking-wide">
                        {selectedInspection.priority} URGENCY
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-display font-extrabold text-slate-900 text-md leading-tight">
                        {selectedInspection.areaName}
                      </h4>
                      <p className="text-[10.5px] font-mono text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-400" /> {selectedInspection.coordinates.lat.toFixed(5)}N, {selectedInspection.coordinates.lng.toFixed(5)}W
                      </p>
                    </div>

                    {/* SPECIFIC ANTICIPATED HAZARD TYPE */}
                    <div className="bg-white border border-slate-150 p-3.5 rounded-xl space-y-1 shadow-xs">
                      <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">Predicted Imminent Hazard</p>
                      <p className="text-xs font-extrabold text-red-600 flex items-center gap-1">
                        ⚠️ {selectedInspection.predictedIssueType}
                      </p>
                    </div>

                    {/* REASON */}
                    <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 border border-slate-800 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                        <span className="text-[10px] font-black tracking-wider text-emerald-300 uppercase">
                          Inspection Recommendation Rationale
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {selectedInspection.reason}
                      </p>
                    </div>

                    {/* QUICK RESET TO VIEW SECTOR DETAILS BUTTON */}
                    <button
                      onClick={() => {
                        setSelectedInspectionId(null);
                        if (sectors.length > 0) setSelectedSectorId(sectors[0].id);
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-colors text-center"
                    >
                      Return to Sector Insights
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

          {/* LOWER SECTION: LIST OF ALL RECOMMENDED INSPECTIONS FEED */}
          <div className="border-t border-slate-100 pt-8 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-600" /> Recommended Proactive Inspection Checklist
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Prioritized dispatch locations suggested by the AI agent patterns to preempt catastrophic structural failure</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inspections.map((ins) => {
                const isSelected = ins.id === selectedInspectionId;
                const isHigh = ins.priority === "High";

                return (
                  <div
                    key={ins.id}
                    onClick={() => {
                      setSelectedInspectionId(ins.id);
                      setSelectedSectorId(null);
                      // scroll view up slightly if mobile to focus map
                    }}
                    className={`cursor-pointer border rounded-2xl p-4 space-y-3 transition-all duration-200 flex flex-col justify-between hover:shadow-xs hover:border-slate-350 ${
                      isSelected 
                        ? "border-emerald-500 bg-emerald-50/15 ring-2 ring-emerald-500/10" 
                        : "border-slate-150 bg-white"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          isHigh 
                            ? "bg-red-50 text-red-600 border border-red-100" 
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}>
                          {ins.priority} Urgency
                        </span>
                        <span className="text-[9.5px] font-mono text-slate-400">
                          {ins.coordinates.lat.toFixed(3)}N, {ins.coordinates.lng.toFixed(3)}W
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h5 className="font-bold text-slate-900 text-xs leading-tight">
                          {ins.areaName}
                        </h5>
                        <p className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block animate-pulse" />
                          Anticipated: {ins.predictedIssueType}
                        </p>
                        <p className="text-xs text-slate-500 leading-normal line-clamp-2">
                          {ins.reason}
                        </p>
                      </div>
                    </div>

                    <button
                      className={`text-[10.5px] font-bold w-full mt-2 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                        isSelected 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isSelected ? "Active Focal Point" : "Locate on Grid"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
