import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // Enable large payloads for base64 image uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Initialize Gemini Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // File-based Database Persistence Configuration
  const DB_PATH = path.join(process.cwd(), "data", "issues.json");

  // Ensure directories exist
  if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  }

  // Seed issues containing all required fields: id, title, description, image, latitude, longitude, category, severity, department, status, votes, created_at
  const seedIssues = [
    {
      id: "issue-1",
      title: "Dangerous Pothole on Pine Street Lane",
      description: "Extremely deep pothole in the middle lane near Central Park entrance. Cars are swerving into oncoming traffic to avoid it, creating an immediate danger.",
      location: "1420 Pine Street (near Central Park)",
      imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=800",
      image: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=800",
      latitude: 37.774929,
      longitude: -122.419416,
      category: "Pothole",
      severity: "High",
      summary: "A deep, hazardous pothole located in a high-speed traffic lane, causing drivers to execute dangerous maneuvers and posing a severe risk of tire blowouts or multi-car collisions.",
      department: "Department of Transportation",
      status: "Verified",
      upvotes: 42,
      votes: 42,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      timeline: [
        {
          id: "t-1",
          status: "Reported",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Issue submitted by citizen with visual confirmation.",
        },
        {
          id: "t-2",
          status: "Verified",
          timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Community verification threshold met. Department of Transportation has acknowledged the report.",
        }
      ],
      priorityScore: 0,
    },
    {
      id: "issue-2",
      title: "Illegal Electronic & Chemical Garbage Dump in Alley",
      description: "Several old computer monitors, car batteries, and large trash bags dumped overnight in the residential service alleyway.",
      location: "Rear alley of 805 Oak Avenue",
      imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=800",
      image: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=800",
      latitude: 37.785834,
      longitude: -122.406417,
      category: "Garbage Dump",
      severity: "Critical",
      summary: "Illegal dumping of hazardous electronic waste and chemicals in a pedestrian alleyway. Poses environmental toxicity risks and blocks local resident emergency access.",
      department: "Sanitation & Recycling Dept",
      status: "In Progress",
      upvotes: 68,
      votes: 68,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      timeline: [
        {
          id: "t-3",
          status: "Reported",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Issue submitted with toxic e-waste warning details.",
        },
        {
          id: "t-4",
          status: "Verified",
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Community upvotes verified the high impact. Sanitization crew scheduled.",
        },
        {
          id: "t-5",
          status: "In Progress",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Sanitation crew has arrived on site to begin sorting and removal of hazardous waste.",
        }
      ],
      priorityScore: 0,
    },
    {
      id: "issue-3",
      title: "Ruptured Water Main Sidewalk Flooding",
      description: "Clean water bubbling up violently through the pavement seams. The sidewalk is completely submerged and the road is beginning to ice/slick.",
      location: "Intersection of Main St & 5th Ave",
      imageUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800",
      image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800",
      latitude: 37.769929,
      longitude: -122.446816,
      category: "Water Leak",
      severity: "Medium",
      summary: "Water pressure breach beneath the walkway creating minor pedestrian detours and localized pavement erosion.",
      department: "Municipal Water Authority",
      status: "Resolved",
      upvotes: 18,
      votes: 18,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      timeline: [
        {
          id: "t-6",
          status: "Reported",
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Sidewalk rupture and flooding reported.",
        },
        {
          id: "t-7",
          status: "Verified",
          timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Verified by emergency dispatcher.",
        },
        {
          id: "t-8",
          status: "In Progress",
          timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Engineers are bypassing the local water main loop.",
        },
        {
          id: "t-9",
          status: "Resolved",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Pipe successfully patched, pavement dried and reinforced. Complete resolution.",
        }
      ],
      priorityScore: 0,
    },
    {
      id: "issue-4",
      title: "Broken Streetlight at Busy Pedestrian Crosswalk",
      description: "Streetlight is completely out, leaving a dark shadow over the zebra crossing where kids cross from the after-school program.",
      location: "300 Block of Maple Street",
      imageUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=800",
      image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=800",
      latitude: 37.794931,
      longitude: -122.399929,
      category: "Damaged Streetlight",
      severity: "Medium",
      summary: "Dark pedestrian crossing near residential zone. Elevates safety and crime risks during evening hours.",
      department: "Municipal Lighting Division",
      status: "Reported",
      upvotes: 12,
      votes: 12,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      timeline: [
        {
          id: "t-10",
          status: "Reported",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Broken streetlight reported near school.",
        }
      ],
      priorityScore: 0,
    }
  ];

  // Load and sync issues from the persistent database file
  let issues: any[] = [];
  try {
    if (fs.existsSync(DB_PATH)) {
      const fileContent = fs.readFileSync(DB_PATH, "utf-8");
      issues = JSON.parse(fileContent);
    } else {
      issues = seedIssues;
      fs.writeFileSync(DB_PATH, JSON.stringify(issues, null, 2), "utf-8");
    }
  } catch (error) {
    console.error("Failed to initialize or read persistent issues file database:", error);
    issues = seedIssues;
  }

  // Database sync helper
  const syncDatabase = () => {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(issues, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed writing changes to persistent issues file database:", err);
    }
  };

  // Helper to compute priority scores
  function calculatePriority(issue: any) {
    let severityWeight = 10;
    if (issue.severity === "Medium") severityWeight = 30;
    if (issue.severity === "High") severityWeight = 60;
    if (issue.severity === "Critical") severityWeight = 100;

    const currentVotes = issue.votes !== undefined ? issue.votes : (issue.upvotes || 1);
    const upvoteWeight = currentVotes * 5;

    const createdTime = new Date(issue.created_at || issue.createdAt || Date.now()).getTime();
    const hoursSinceCreated = Math.max(0, (Date.now() - createdTime) / (1000 * 60 * 60));
    const ageWeight = Math.min(100, hoursSinceCreated * 0.5);

    return Math.round(severityWeight + upvoteWeight + ageWeight);
  }

  // Heuristic Priority Fallback Function
  function getHeuristicPriority(severity: string, votes: number, createdAt: string): "Critical" | "High" | "Medium" | "Low" {
    const createdTime = new Date(createdAt).getTime();
    const hoursSinceCreated = Math.max(0, (Date.now() - createdTime) / (1000 * 60 * 60));
    
    let score = 0;
    if (severity === "Critical") score += 100;
    else if (severity === "High") score += 70;
    else if (severity === "Medium") score += 40;
    else score += 15;

    score += votes * 6;
    score += hoursSinceCreated * 0.4;

    if (score >= 120) return "Critical";
    if (score >= 75) return "High";
    if (score >= 40) return "Medium";
    return "Low";
  }

  // AI Priority Agent using Gemini 2.5 Flash
  async function determineAIPriority(severity: string, votes: number, createdAt: string): Promise<{ priority: "Critical" | "High" | "Medium" | "Low"; explanation: string }> {
    const isPlaceholderKey = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY" || process.env.GEMINI_API_KEY.includes("placeholder");
    const createdTime = new Date(createdAt).getTime();
    const hoursSinceCreated = Math.max(0, (Date.now() - createdTime) / (1000 * 60 * 60));
    const daysSinceCreated = hoursSinceCreated / 24;

    const defaultPriority = getHeuristicPriority(severity, votes, createdAt);
    const defaultExplanation = `Calculated with dynamic municipal priority weighting: Severity (${severity}), Endorsements (${votes}), Age (${hoursSinceCreated.toFixed(1)} hours).`;

    if (isPlaceholderKey) {
      return { priority: defaultPriority, explanation: defaultExplanation };
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the priority of a municipal infrastructure issue based on three inputs:
1. Severity Level: "${severity}"
2. Votes (community endorsements): ${votes}
3. Issue Age (hours since reported): ${hoursSinceCreated.toFixed(1)} hours (approx. ${daysSinceCreated.toFixed(1)} days)

Classify this issue into exactly one of these priority tiers:
- 'Critical': Direct threat to life, public safety, or major structural failure. Must be addressed immediately.
- 'High': High safety risk, significant transit/utility disruption, or high community support.
- 'Medium': Moderately disruptive, minor safety concern, or moderate community support.
- 'Low': Minimal impact, cosmetic issues, or low community urgency.

Return a JSON object containing the determined priority tier and a concise 1-sentence explanation.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              priority: {
                type: Type.STRING,
                description: "Must be exactly one of: 'Critical', 'High', 'Medium', 'Low'."
              },
              explanation: {
                type: Type.STRING,
                description: "A concise 1-sentence explanation of why this priority was determined."
              }
            },
            required: ["priority", "explanation"]
          }
        }
      });

      const parsed = JSON.parse(response.text.trim());
      if (['Critical', 'High', 'Medium', 'Low'].includes(parsed.priority)) {
        return {
          priority: parsed.priority as "Critical" | "High" | "Medium" | "Low",
          explanation: parsed.explanation || defaultExplanation
        };
      }
    } catch (err) {
      console.warn("AI Priority Agent failed to query Gemini, utilizing heuristics fallback:", err);
    }

    return { priority: defaultPriority, explanation: defaultExplanation };
  }

  // AI Duplicate Detection Agent using Gemini 2.5 Flash
  async function findDuplicateWithAI(
    newImage: string,
    newDescription: string,
    newLocation: string,
    newLat: number,
    newLng: number
  ): Promise<{ isDuplicate: boolean; duplicateIssue?: any; explanation: string }> {
    const isPlaceholderKey = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY" || process.env.GEMINI_API_KEY.includes("placeholder");

    // Pre-filter candidates (only consider active, non-resolved issues that are within ~1.5km, or matching category)
    const activeIssues = issues.filter(i => i.status !== "Resolved");
    
    const candidates = activeIssues.filter((candidate) => {
      if (newLat && newLng && candidate.latitude && candidate.longitude) {
        const latDiff = Math.abs(candidate.latitude - newLat);
        const lngDiff = Math.abs(candidate.longitude - newLng);
        // within ~1.5km
        if (latDiff < 0.015 && lngDiff < 0.015) {
          return true;
        }
      }
      return true;
    }).slice(0, 5); // Take top 5 recent candidates for safety & context limits

    const defaultExplanation = "No similar municipal incident found in this neighborhood grid.";

    if (candidates.length === 0) {
      return { isDuplicate: false, explanation: defaultExplanation };
    }

    // Heuristics Fallback algorithm
    const runHeuristicCheck = () => {
      for (const candidate of candidates) {
        const descNew = (newDescription || "").toLowerCase();
        const descCand = (candidate.description || "").toLowerCase();
        const locNew = (newLocation || "").toLowerCase();
        const locCand = (candidate.location || "").toLowerCase();

        // 1. Proximity check
        let isClose = false;
        if (newLat && newLng && candidate.latitude && candidate.longitude) {
          const latDiff = Math.abs(candidate.latitude - newLat);
          const lngDiff = Math.abs(candidate.longitude - newLng);
          if (latDiff < 0.003 && lngDiff < 0.003) { // ~300 meters
            isClose = true;
          }
        }

        // 2. Keyword/Street matching
        const wordsNew = locNew.split(/[\s,.-]+/);
        const wordsCand = locCand.split(/[\s,.-]+/);
        const streetDesignators = ["street", "st", "avenue", "ave", "boulevard", "blvd", "road", "rd", "drive", "dr", "lane", "ln", "way", "court", "ct"];
        const commonLocWords = wordsNew.filter(w => w.length > 3 && !streetDesignators.includes(w) && wordsCand.includes(w));

        // 3. Description keyword intersection
        const descWordsNew = descNew.split(/[\s,.-]+/);
        const descWordsCand = descCand.split(/[\s,.-]+/);
        const commonDescWords = descWordsNew.filter(w => w.length > 3 && descWordsCand.includes(w));

        // If very close and matches main category/keywords, or has highly similar location details
        if ((isClose && (commonDescWords.length >= 2)) || 
            (commonLocWords.length >= 2 && commonDescWords.length >= 2)) {
          return {
            isDuplicate: true,
            duplicateIssue: candidate,
            explanation: `Heuristics matching flagged candidate #${candidate.id} (${candidate.title}) due to spatial overlap (${(isClose ? "under 300m" : "same street group")}) and related keywords: "${commonDescWords.slice(0, 3).join(", ")}".`
          };
        }
      }
      return { isDuplicate: false, explanation: defaultExplanation };
    };

    if (isPlaceholderKey) {
      console.log("Gemini API key is placeholder. Running smart local duplicate heuristics...");
      return runHeuristicCheck();
    }

    try {
      // Prepare subset of fields to send to Gemini
      const candidateData = candidates.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        location: c.location,
        category: c.category,
        latitude: c.latitude,
        longitude: c.longitude,
        status: c.status
      }));

      // Extract raw base64 data for Gemini
      const matches = newImage.match(/^data:(image\/\w+);base64,(.+)$/);
      let mimeType = "image/jpeg";
      let base64Data = newImage;

      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      }

      const imagePart = {
        inlineData: {
          mimeType,
          data: base64Data
        }
      };

      const textPart = {
        text: `You are the Duplicate Detection Agent for our city's Citizen Infrastructure Triage platform.
Analyze if this newly reported municipal infrastructure issue is a duplicate of an already existing issue from the candidate list below.

A report is a duplicate if it represents the exact same physical issue at the same or nearly the same location. For example, if both are potholes on the same street, water leaks from the same broken main, or trash heaps at the same corner.

New Report details:
- Description: "${newDescription}"
- Location Context: "${newLocation}"
- Latitude: ${newLat}
- Longitude: ${newLng}

List of existing candidate reports:
${JSON.stringify(candidateData, null, 2)}

Instructions:
Compare the new report's visual image, description, and location details against the list of candidates.
Return a JSON object indicating:
- isDuplicate: boolean (true if it represents the same physical issue as one of the candidates)
- duplicateIssueId: string (the id of the matching candidate from the list, empty string "" if none match)
- explanation: string (a concise 1-2 sentence explanation of why this decision was made, referencing street location, visual cues, or description similarities).`
      };

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isDuplicate: { type: Type.BOOLEAN },
              duplicateIssueId: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["isDuplicate", "explanation"]
          }
        }
      });

      const parsed = JSON.parse(response.text.trim());
      if (parsed.isDuplicate && parsed.duplicateIssueId) {
        const found = candidates.find(c => c.id === parsed.duplicateIssueId);
        if (found) {
          return {
            isDuplicate: true,
            duplicateIssue: found,
            explanation: parsed.explanation || "Identified as a duplicated incident report by Gemini vision triage."
          };
        }
      }
    } catch (err) {
      console.warn("AI Duplicate Agent failed, resorting to local heuristics:", err);
    }

    return runHeuristicCheck();
  }

  // Compute priorities on startup
  issues.forEach(issue => {
    // Fill in backwards compatible aliased fields if missing
    if (issue.votes === undefined) issue.votes = issue.upvotes || 1;
    if (issue.upvotes === undefined) issue.upvotes = issue.votes;
    if (!issue.created_at) issue.created_at = issue.createdAt || new Date().toISOString();
    if (!issue.createdAt) issue.createdAt = issue.created_at;
    if (!issue.image) issue.image = issue.imageUrl;
    if (!issue.imageUrl) issue.imageUrl = issue.image;
    if (issue.latitude === undefined) issue.latitude = 37.7749;
    if (issue.longitude === undefined) issue.longitude = -122.4194;

    issue.priorityScore = calculatePriority(issue);
    if (!issue.priority) {
      const hoursSince = Math.max(0, (Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60));
      issue.priority = getHeuristicPriority(issue.severity, issue.votes || 1, issue.created_at);
      issue.priorityExplanation = `Determined using smart municipal heuristic triage system: Severity (${issue.severity}), Endorsements (${issue.votes}), Age (${hoursSince.toFixed(1)} hours).`;
    }
  });
  syncDatabase();

  // API Routes (Complete CRUD)

  // 1. READ ALL (GET)
  app.get("/api/issues", (req, res) => {
    const calculatedIssues = issues.map(issue => {
      const votesVal = issue.votes !== undefined ? issue.votes : (issue.upvotes || 1);
      const createdAtVal = issue.created_at || issue.createdAt || new Date().toISOString();
      const imageVal = issue.image || issue.imageUrl || "";

      const updated = {
        ...issue,
        upvotes: votesVal,
        votes: votesVal,
        createdAt: createdAtVal,
        created_at: createdAtVal,
        imageUrl: imageVal,
        image: imageVal,
      };
      updated.priorityScore = calculatePriority(updated);
      return updated;
    });
    res.json(calculatedIssues);
  });

  // 2. READ ONE (GET)
  app.get("/api/issues/:id", (req, res) => {
    const { id } = req.params;
    const issue = issues.find(i => i.id === id);
    if (!issue) {
      return res.status(404).json({ error: "Issue report not found" });
    }
    const votesVal = issue.votes !== undefined ? issue.votes : (issue.upvotes || 1);
    const createdAtVal = issue.created_at || issue.createdAt || new Date().toISOString();
    const imageVal = issue.image || issue.imageUrl || "";

    const updated = {
      ...issue,
      upvotes: votesVal,
      votes: votesVal,
      createdAt: createdAtVal,
      created_at: createdAtVal,
      imageUrl: imageVal,
      image: imageVal,
      priorityScore: calculatePriority(issue),
    };
    res.json(updated);
  });

  // 3. CREATE (POST)
  app.post("/api/issues", async (req, res) => {
    const {
      title,
      description,
      location,
      imageUrl,
      image,
      latitude,
      longitude,
      category,
      severity,
      summary,
      department
    } = req.body;

    if (!title || !description || !location || (!imageUrl && !image) || !category || !severity) {
      return res.status(400).json({ error: "Missing required report fields" });
    }

    const finalImage = image || imageUrl;
    const finalLat = latitude !== undefined ? Number(latitude) : 37.7749;
    const finalLng = longitude !== undefined ? Number(longitude) : -122.4194;
    const nowStr = new Date().toISOString();

    const priRes = await determineAIPriority(severity, 1, nowStr);

    const newIssue: any = {
      id: `issue-${Date.now()}`,
      title,
      description,
      location,
      imageUrl: finalImage,
      image: finalImage,
      latitude: finalLat,
      longitude: finalLng,
      category,
      severity,
      summary: summary || "Citizen reported infrastructure issue.",
      department: department || "General Municipal Services",
      status: "Reported",
      upvotes: 1,
      votes: 1,
      createdAt: nowStr,
      created_at: nowStr,
      priority: priRes.priority,
      priorityExplanation: priRes.explanation,
      timeline: [
        {
          id: `t-${Date.now()}-1`,
          status: "Reported",
          timestamp: nowStr,
          description: "Report filed successfully with GPS coordinates via civic app.",
        }
      ],
      priorityScore: 0,
    };

    newIssue.priorityScore = calculatePriority(newIssue);
    issues.unshift(newIssue);
    syncDatabase();

    res.status(201).json(newIssue);
  });

  // 4. UPDATE (PUT)
  app.put("/api/issues/:id", async (req, res) => {
    const { id } = req.params;
    const index = issues.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Issue not found" });
    }

    const current = issues[index];
    const {
      title,
      description,
      location,
      imageUrl,
      image,
      latitude,
      longitude,
      category,
      severity,
      summary,
      department,
      status,
      votes,
      upvotes
    } = req.body;

    const finalImage = image !== undefined ? image : (imageUrl !== undefined ? imageUrl : current.image);
    const finalLat = latitude !== undefined ? Number(latitude) : current.latitude;
    const finalLng = longitude !== undefined ? Number(longitude) : current.longitude;
    const finalVotes = votes !== undefined ? Number(votes) : (upvotes !== undefined ? Number(upvotes) : current.votes);

    // Track status transitions in timeline if changed
    const finalStatus = status || current.status;
    const updatedTimeline = [...(current.timeline || [])];
    if (status && status !== current.status) {
      updatedTimeline.push({
        id: `t-${Date.now()}-update`,
        status,
        timestamp: new Date().toISOString(),
        description: `Field updated: Status changed to ${status}.`,
      });
    }

    const priRes = await determineAIPriority(severity || current.severity, finalVotes, current.created_at || current.createdAt);

    const updatedIssue: any = {
      ...current,
      title: title || current.title,
      description: description || current.description,
      location: location || current.location,
      imageUrl: finalImage,
      image: finalImage,
      latitude: finalLat,
      longitude: finalLng,
      category: category || current.category,
      severity: severity || current.severity,
      summary: summary || current.summary,
      department: department || current.department,
      status: finalStatus,
      votes: finalVotes,
      upvotes: finalVotes,
      priority: priRes.priority,
      priorityExplanation: priRes.explanation,
      timeline: updatedTimeline,
    };

    updatedIssue.priorityScore = calculatePriority(updatedIssue);
    issues[index] = updatedIssue;
    syncDatabase();

    res.json(updatedIssue);
  });

  // 5. DELETE (DELETE)
  app.delete("/api/issues/:id", (req, res) => {
    const { id } = req.params;
    const index = issues.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Issue not found" });
    }
    issues.splice(index, 1);
    syncDatabase();
    res.json({ success: true, message: `Report ${id} successfully removed from persistence.` });
  });

  // Citizen Upvote Endpoint
  app.post("/api/issues/:id/upvote", async (req, res) => {
    const { id } = req.params;
    const issue = issues.find(i => i.id === id);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    const currentVotes = issue.votes !== undefined ? issue.votes : (issue.upvotes || 1);
    const nextVotes = currentVotes + 1;
    issue.votes = nextVotes;
    issue.upvotes = nextVotes;

    if (issue.status === "Reported" && nextVotes >= 10) {
      issue.status = "Verified";
      issue.timeline.push({
        id: `t-${Date.now()}-verify`,
        status: "Verified",
        timestamp: new Date().toISOString(),
        description: "Community verification threshold (10 votes) met. Issue escalated to municipality.",
      });
    }

    const priRes = await determineAIPriority(issue.severity, nextVotes, issue.created_at || issue.createdAt);
    issue.priority = priRes.priority;
    issue.priorityExplanation = priRes.explanation;

    issue.priorityScore = calculatePriority(issue);
    syncDatabase();
    res.json(issue);
  });

  // Admin state progression simulation endpoint
  app.post("/api/issues/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status, description } = req.body;
    const issue = issues.find(i => i.id === id);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    if (!status) {
      return res.status(400).json({ error: "Missing status field" });
    }

    issue.status = status;
    issue.timeline.push({
      id: `t-${Date.now()}-status`,
      status,
      timestamp: new Date().toISOString(),
      description: description || `Status updated to ${status}.`,
    });

    const currentVotes = issue.votes !== undefined ? issue.votes : (issue.upvotes || 1);
    const priRes = await determineAIPriority(issue.severity, currentVotes, issue.created_at || issue.createdAt);
    issue.priority = priRes.priority;
    issue.priorityExplanation = priRes.explanation;

    issue.priorityScore = calculatePriority(issue);
    syncDatabase();
    res.json(issue);
  });

  // AI Priority Agent Simulator Endpoint
  app.post("/api/prioritize-agent-run", async (req, res) => {
    const { severity, votes, ageHours } = req.body;
    if (!severity || votes === undefined) {
      return res.status(400).json({ error: "Missing severity or votes fields" });
    }
    const finalAge = ageHours !== undefined ? Number(ageHours) : 0;
    // Compute synthetic createdAt string based on ageHours
    const createdAt = new Date(Date.now() - finalAge * 60 * 60 * 1000).toISOString();
    
    try {
      const result = await determineAIPriority(severity, Number(votes), createdAt);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Duplicate Detection Agent Endpoint
  app.post("/api/detect-duplicate", async (req, res) => {
    const { image, description, location, latitude, longitude } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Missing image for duplicate verification." });
    }
    try {
      const latNum = latitude !== undefined ? Number(latitude) : 0;
      const lngNum = longitude !== undefined ? Number(longitude) : 0;
      const result = await findDuplicateWithAI(image, description || "", location || "", latNum, lngNum);
      res.json(result);
    } catch (err: any) {
      console.error("Duplicate Detection Agent error:", err);
      res.status(500).json({ error: err?.message || "Failed during duplicate detection check." });
    }
  });

  // Citizen Join Complaint / Merge Votes Endpoint
  app.post("/api/issues/:id/merge", async (req, res) => {
    const { id } = req.params;
    const issue = issues.find(i => i.id === id);
    if (!issue) {
      return res.status(404).json({ error: "Target issue to join not found." });
    }

    try {
      const oldVotes = issue.votes !== undefined ? issue.votes : (issue.upvotes || 1);
      const nextVotes = oldVotes + 1;
      issue.votes = nextVotes;
      issue.upvotes = nextVotes;

      // Add a timeline event to reflect citizen joining
      issue.timeline.push({
        id: `t-${Date.now()}-merge`,
        status: issue.status || "Reported",
        timestamp: new Date().toISOString(),
        description: "Another citizen joined this complaint (merged report from Duplicate Detection Agent). Total endorsements increased.",
      });

      // Recompute Priority on vote change
      const priRes = await determineAIPriority(issue.severity, nextVotes, issue.created_at || issue.createdAt);
      issue.priority = priRes.priority;
      issue.priorityExplanation = priRes.explanation;
      issue.priorityScore = calculatePriority(issue);

      syncDatabase();
      res.json(issue);
    } catch (err: any) {
      console.error("Join complaint merge error:", err);
      res.status(500).json({ error: err?.message || "Failed to join existing complaint." });
    }
  });

  // AI analysis endpoint (Gemini integration)
  app.post("/api/analyze-issue", async (req, res) => {
    const { image, description } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Missing image data" });
    }

    // Heuristics Fallback Function
    const getHeuristicAnalysis = (desc: string) => {
      const descLower = (desc || "").toLowerCase();

      // 1. Detect Category
      let category = "Other";
      if (descLower.includes("pothole") || descLower.includes("crater") || descLower.includes("hole in road")) {
        category = "Pothole";
      } else if (descLower.includes("garbage") || descLower.includes("dump") || descLower.includes("trash") || descLower.includes("litter") || descLower.includes("waste")) {
        category = "Garbage Dump";
      } else if (descLower.includes("water") || descLower.includes("leak") || descLower.includes("pipe") || descLower.includes("burst") || descLower.includes("flood")) {
        category = "Water Leak";
      } else if (descLower.includes("streetlight") || descLower.includes("lamp") || descLower.includes("light out") || descLower.includes("dark")) {
        category = "Damaged Streetlight";
      } else if (descLower.includes("road") || descLower.includes("crack") || descLower.includes("asphalt") || descLower.includes("pavement")) {
        category = "Road Damage";
      }

      // 2. Severity level
      let severity = "Low";
      if (descLower.includes("critical") || descLower.includes("toxic") || descLower.includes("poison") || descLower.includes("danger") || descLower.includes("hazard") || descLower.includes("emergency")) {
        severity = "Critical";
      } else if (descLower.includes("high") || descLower.includes("severe") || descLower.includes("accident") || descLower.includes("crash")) {
        severity = "High";
      } else if (descLower.includes("medium") || descLower.includes("moderate") || descLower.includes("disruptive")) {
        severity = "Medium";
      }

      // 3. Department recommendation
      let department = "General Municipal Services";
      if (category === "Pothole" || category === "Road Damage") {
        department = "Department of Transportation";
      } else if (category === "Garbage Dump") {
        department = "Sanitation & Recycling Dept";
      } else if (category === "Water Leak") {
        department = "Municipal Water Authority";
      } else if (category === "Damaged Streetlight") {
        department = "Municipal Lighting Division";
      }

      // 4. Generate Title
      let title = "Citizen Reported Infrastructure Issue";
      if (category === "Pothole") {
        title = "Dangerous Roadway Pothole Encountered";
      } else if (category === "Garbage Dump") {
        title = "Illegal Litter and Trash Dumping Site";
      } else if (category === "Water Leak") {
        title = "Significant Water Main/Sidewalk Leakage";
      } else if (category === "Damaged Streetlight") {
        title = "Inoperable Pedestrian Streetlight Hazard";
      } else if (category === "Road Damage") {
        title = "Deformed Roadway and Pavement Cracks";
      }

      // 5. Generate Summary
      let summary = "Citizen reported infrastructure issue requiring department level triage.";
      if (category === "Pothole") {
        summary = "Deep surface pothole presenting vehicle wheel damage risks and potential swerving hazards on local lanes.";
      } else if (category === "Garbage Dump") {
        summary = "Unregulated pile of waste accumulating in public space, creating public health, vermin, and aesthetic issues.";
      } else if (category === "Water Leak") {
        summary = "Continuous pressurized clean water discharge causing local surface flooding, erosion, and safety hazards.";
      } else if (category === "Damaged Streetlight") {
        summary = "Malfunctioning overhead street level lighting creating dangerous blind spots for pedestrians and school kids.";
      } else if (category === "Road Damage") {
        summary = "Significant asphalt erosion or surface fissures degrading neighborhood transit lanes and pathway safety.";
      }

      return {
        category,
        severity,
        title,
        summary,
        department,
        _isLocalFallback: true
      };
    };

    // If Gemini key is dummy/missing or has been blocked/restricted by project, immediately fall back.
    const isPlaceholderKey = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY" || process.env.GEMINI_API_KEY.includes("placeholder");

    if (isPlaceholderKey) {
      console.warn("Using smart local heuristics analysis because the GEMINI_API_KEY is not configured.");
      const result = getHeuristicAnalysis(description);
      return res.json(result);
    }

    try {
      // Clean up base64 header if present (e.g., data:image/png;base64,...)
      const matches = image.match(/^data:(image\/\w+);base64,(.+)$/);
      let mimeType = "image/jpeg";
      let base64Data = image;

      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      }

      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      };

      const textPart = {
        text: `Analyze this photograph of a municipal infrastructure issue reported by a citizen.
        User's description: "${description || "No description provided"}"

        Perform the following tasks:
        1. Detect the category: Select exactly one from 'Pothole', 'Garbage Dump', 'Water Leak', 'Damaged Streetlight', 'Road Damage', or 'Other'.
        2. Estimate severity: Determine if it's 'Low', 'Medium', 'High', or 'Critical' based on potential danger to pedestrians, vehicular traffic, and environment.
        3. Generate a title: A concise, highly professional 4-7 word title naming the specific issue and visual impact.
        4. Generate a summary: A clear, empathetic 1-2 sentence description detailing the visual evidence and hazard.
        5. Department recommendation: Suggest a standard department responsible, e.g., 'Department of Transportation', 'Water Utility Bureau', 'Municipal Lighting Division', 'Sanitation Department', etc.`,
      };

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", // Use stable general release model
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: "Must be exactly one of: 'Pothole', 'Garbage Dump', 'Water Leak', 'Damaged Streetlight', 'Road Damage', or 'Other'."
              },
              severity: {
                type: Type.STRING,
                description: "Must be exactly one of: 'Low', 'Medium', 'High', 'Critical'."
              },
              title: {
                type: Type.STRING,
                description: "Concise, professional 4-7 word title of the infrastructure issue."
              },
              summary: {
                type: Type.STRING,
                description: "Empathetic, descriptive 1-2 sentence summary detailing why it requires attention."
              },
              department: {
                type: Type.STRING,
                description: "Recommended municipal department responsible for addressing the issue."
              }
            },
            required: ["category", "severity", "title", "summary", "department"]
          }
        }
      });

      const parsedResult = JSON.parse(response.text.trim());
      res.json(parsedResult);
    } catch (err: any) {
      console.warn("Gemini API call failed or project has restricted access. Activating smart local heuristics fallback... Error:", err?.message || err);
      // Fallback gracefully without crash (no 500 error!)
      const result = getHeuristicAnalysis(description);
      res.json(result);
    }
  });

  // API for Predictive Infrastructure Agent
  app.get("/api/predictive-analysis", async (req, res) => {
    try {
      const sectors = [
        {
          id: "sector-1",
          name: "Marina & Fisherman's Wharf",
          center: { lat: 37.803, lng: -122.432 },
        },
        {
          id: "sector-2",
          name: "Financial District & Downtown",
          center: { lat: 37.792, lng: -122.402 },
        },
        {
          id: "sector-3",
          name: "SOMA & Mission Bay",
          center: { lat: 37.774, lng: -122.398 },
        },
        {
          id: "sector-4",
          name: "Mission & Central District",
          center: { lat: 37.761, lng: -122.418 },
        },
        {
          id: "sector-5",
          name: "Western Addition & Haight-Ashbury",
          center: { lat: 37.772, lng: -122.441 },
        },
        {
          id: "sector-6",
          name: "Sunset & Richmond (West)",
          center: { lat: 37.775, lng: -122.486 },
        }
      ];

      function getEuclideanDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
        return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
      }

      // Group issues into sectors
      const sectorMap = sectors.map(s => ({
        ...s,
        openIssues: [] as any[],
        resolvedIssues: [] as any[],
        totalIssuesCount: 0,
        categories: new Set<string>()
      }));

      issues.forEach(issue => {
        let closestSec = sectorMap[0];
        let minD = Infinity;
        const lat = Number(issue.latitude) || 37.7749;
        const lng = Number(issue.longitude) || -122.4194;

        sectorMap.forEach(s => {
          const d = getEuclideanDistance(lat, lng, s.center.lat, s.center.lng);
          if (d < minD) {
            minD = d;
            closestSec = s;
          }
        });

        closestSec.totalIssuesCount++;
        if (issue.category) closestSec.categories.add(issue.category);
        if (issue.status === "Resolved") {
          closestSec.resolvedIssues.push(issue);
        } else {
          closestSec.openIssues.push(issue);
        }
      });

      // Compute raw scores and base predictions
      const analyzedSectors = sectorMap.map(sec => {
        let rawScore = 12; // base risk score
        sec.openIssues.forEach(i => {
          if (i.severity === "Critical") rawScore += 18;
          else if (i.severity === "High") rawScore += 12;
          else if (i.severity === "Medium") rawScore += 6;
          else rawScore += 3;

          const votes = i.votes !== undefined ? i.votes : (i.upvotes || 0);
          rawScore += Math.min(10, votes * 0.4);
        });

        // Add density boost
        rawScore += Math.min(15, sec.totalIssuesCount * 1.5);
        const riskScore = Math.max(5, Math.min(100, Math.round(rawScore)));

        let riskLevel: "Low" | "Medium" | "High" | "Extreme" = "Low";
        if (riskScore >= 75) riskLevel = "Extreme";
        else if (riskScore >= 50) riskLevel = "High";
        else if (riskScore >= 25) riskLevel = "Medium";

        // Local dynamic predictions based on actual categories
        const catArr = Array.from(sec.categories);
        let prediction = `Standard structural wear and tear is expected. Regular visual scans along major streets will help maintain excellent safety baselines.`;
        let recommendedInspection = {
          areaName: `${sec.name} Central Corridor`,
          latitude: sec.center.lat,
          longitude: sec.center.lng,
          priority: "Low" as "Low" | "Medium" | "High",
          reason: "Periodic pavement scanning and utility conduit verification.",
          predictedIssueType: "Surface Wear & Tear"
        };

        if (catArr.includes("Water Leak") && catArr.includes("Pothole")) {
          prediction = `Sub-surface saturation from local water distribution leaks is undermining the roadway soil. This poses a high probability of structural street sinkholes or immediate pavement base failures.`;
          recommendedInspection = {
            areaName: `Pavement intersection at ${sec.name}`,
            latitude: sec.center.lat + 0.001,
            longitude: sec.center.lng - 0.0015,
            priority: "High",
            reason: "Water leaks are active near major pothole reports. Ground radar scanning is recommended immediately.",
            predictedIssueType: "Sub-grade erosion / Sinkhole"
          };
        } else if (catArr.includes("Garbage Dump") || catArr.includes("Other")) {
          prediction = `Accumulating rubbish and blockages in commercial easements are creating localized environmental hazards and drainage blockage vulnerabilities.`;
          recommendedInspection = {
            areaName: `${sec.name} back-alley service nodes`,
            latitude: sec.center.lat - 0.0015,
            longitude: sec.center.lng + 0.001,
            priority: "Medium",
            reason: "Persistent secondary waste dumping. Sanitation patrols should clear drain blockages.",
            predictedIssueType: "Storm drain blockage / Runoff"
          };
        } else if (catArr.includes("Damaged Streetlight")) {
          prediction = `Localized night illumination deficits are compounding dark intersections, which increases nighttime pedestrian safety index concerns and vehicular blindspot incidents.`;
          recommendedInspection = {
            areaName: `${sec.name} residential crosswalk grid`,
            latitude: sec.center.lat + 0.0012,
            longitude: sec.center.lng + 0.0012,
            priority: "Medium",
            reason: "Reported dark areas are overlapping with pedestrian corridors. Streetlamp grid check advised.",
            predictedIssueType: "Circuit grid short / Pedestrian Safety"
          };
        } else if (catArr.includes("Road Damage") || catArr.includes("Pothole")) {
          prediction = `Deep stress fractures and heavy vehicular traffic load are causing rapid lateral cracking. This is projected to degrade into a cluster of high-severity potholes within 30 days.`;
          recommendedInspection = {
            areaName: `${sec.name} transit main lanes`,
            latitude: sec.center.lat - 0.0008,
            longitude: sec.center.lng - 0.0008,
            priority: "High",
            reason: "Heavy bus line traffic coupled with structural surface cracks. High stress localized zone.",
            predictedIssueType: "Severe asphalt cracking"
          };
        }

        return {
          id: sec.id,
          name: sec.name,
          center: sec.center,
          openIssueCount: sec.openIssues.length,
          resolvedIssueCount: sec.resolvedIssues.length,
          totalIssueCount: sec.totalIssuesCount,
          categories: catArr,
          riskScore,
          riskLevel,
          prediction,
          recommendedInspection
        };
      });

      // Construct default/fallback inspection list
      const defaultInspections = analyzedSectors
        .map(sec => ({
          id: `ins-${sec.id}`,
          areaName: sec.recommendedInspection.areaName,
          coordinates: { lat: sec.recommendedInspection.latitude, lng: sec.recommendedInspection.longitude },
          priority: sec.recommendedInspection.priority,
          reason: sec.recommendedInspection.reason,
          predictedIssueType: sec.recommendedInspection.predictedIssueType
        }))
        .filter(ins => ins.priority === "High" || ins.priority === "Medium")
        // sort high first
        .sort((a, b) => {
          const val = (p: string) => p === "High" ? 3 : p === "Medium" ? 2 : 1;
          return val(b.priority) - val(a.priority);
        });

      // If no high/medium found, default back to adding some
      if (defaultInspections.length === 0) {
        analyzedSectors.forEach(sec => {
          defaultInspections.push({
            id: `ins-${sec.id}`,
            areaName: sec.recommendedInspection.areaName,
            coordinates: { lat: sec.recommendedInspection.latitude, lng: sec.recommendedInspection.longitude },
            priority: "Medium",
            reason: "Periodic structural inspection and drain clearing.",
            predictedIssueType: "Surface Wear"
          });
        });
      }

      const defaultSummary = "Predictive analysis indicates elevated risk of localized street sinkholes and illumination deficits in central transit zones due to combined sub-surface saturation and dark spot reports. Municipal inspection crews are recommended to prioritize Ground Penetrating Radar scanning.";

      const isPlaceholderKey = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY" || process.env.GEMINI_API_KEY.includes("placeholder");

      if (isPlaceholderKey) {
        console.log("Gemini API Key is placeholder. Using smart deterministic predictive analysis fallback.");
        return res.json({
          sectors: analyzedSectors.map(s => ({
            id: s.id,
            name: s.name,
            center: s.center,
            openIssueCount: s.openIssueCount,
            resolvedIssueCount: s.resolvedIssueCount,
            totalIssueCount: s.totalIssueCount,
            categories: s.categories,
            riskScore: s.riskScore,
            riskLevel: s.riskLevel,
            prediction: s.prediction
          })),
          recommendedInspections: defaultInspections.slice(0, 4),
          aiSummary: defaultSummary
        });
      }

      // Gemini 2.5 Flash API Call
      try {
        const payloadData = analyzedSectors.map(s => ({
          id: s.id,
          name: s.name,
          openIssueCount: s.openIssueCount,
          categories: s.categories,
          riskScore: s.riskScore,
          riskLevel: s.riskLevel
        }));

        const textPrompt = `You are the Predictive Infrastructure Agent for our municipal triage portal.
Analyze our city's current reported incidents per sector and generate a prediction matrix about future issues.

City Sector Incidents Summary:
${JSON.stringify(payloadData, null, 2)}

Task:
1. Provide a highly professional, 2-sentence 'prediction' for each sector ID detailing what future issues may develop (e.g., sinkholes, utility corridor failures, toxic runoff, grid failure) based on the co-location of these reports.
2. Recommend exactly 3 specific high-priority inspection areas (with coordinates slightly adjusted near sector centers) explaining why they need rapid inspection, what issue is predicted there, and the urgency ('High', 'Medium', 'Low').
3. Write a 2-3 sentence overall 'aiSummary' of the city's future risk profile.

Return ONLY a JSON response complying with the following schema:
- sectors: Array of objects with:
  - id: string matching the sector id (e.g. "sector-1")
  - prediction: string
- recommendedInspections: Array of objects with:
  - areaName: string (e.g. "Intersection of Oak & 5th")
  - latitude: number
  - longitude: number
  - priority: string (one of "High", "Medium", "Low")
  - reason: string
  - predictedIssueType: string (e.g. "Sidewalk Collapse", "Main Line Leak")
- aiSummary: string`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: textPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                sectors: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      prediction: { type: Type.STRING }
                    },
                    required: ["id", "prediction"]
                  }
                },
                recommendedInspections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      areaName: { type: Type.STRING },
                      latitude: { type: Type.NUMBER },
                      longitude: { type: Type.NUMBER },
                      priority: { type: Type.STRING },
                      reason: { type: Type.STRING },
                      predictedIssueType: { type: Type.STRING }
                    },
                    required: ["areaName", "latitude", "longitude", "priority", "reason", "predictedIssueType"]
                  }
                },
                aiSummary: { type: Type.STRING }
              },
              required: ["sectors", "recommendedInspections", "aiSummary"]
            }
          }
        });

        const parsed = JSON.parse(response.text.trim());

        // Merge prediction results from AI back into our calculated sectors
        const mergedSectors = analyzedSectors.map(s => {
          const aiSec = parsed.sectors?.find((item: any) => item.id === s.id);
          return {
            id: s.id,
            name: s.name,
            center: s.center,
            openIssueCount: s.openIssueCount,
            resolvedIssueCount: s.resolvedIssueCount,
            totalIssueCount: s.totalIssueCount,
            categories: s.categories,
            riskScore: s.riskScore,
            riskLevel: s.riskLevel,
            prediction: aiSec?.prediction || s.prediction
          };
        });

        const finalInspections = (parsed.recommendedInspections || []).map((ins: any, index: number) => ({
          id: `ins-ai-${index}`,
          areaName: ins.areaName,
          coordinates: { lat: Number(ins.latitude) || 37.77, lng: Number(ins.longitude) || -122.41 },
          priority: ins.priority || "Medium",
          reason: ins.reason,
          predictedIssueType: ins.predictedIssueType
        }));

        return res.json({
          sectors: mergedSectors,
          recommendedInspections: finalInspections.length > 0 ? finalInspections : defaultInspections.slice(0, 4),
          aiSummary: parsed.aiSummary || defaultSummary
        });

      } catch (err) {
        console.warn("Gemini call for predictive analysis failed, fallback to heuristics:", err);
        return res.json({
          sectors: analyzedSectors.map(s => ({
            id: s.id,
            name: s.name,
            center: s.center,
            openIssueCount: s.openIssueCount,
            resolvedIssueCount: s.resolvedIssueCount,
            totalIssueCount: s.totalIssueCount,
            categories: s.categories,
            riskScore: s.riskScore,
            riskLevel: s.riskLevel,
            prediction: s.prediction
          })),
          recommendedInspections: defaultInspections.slice(0, 4),
          aiSummary: defaultSummary
        });
      }

    } catch (err: any) {
      console.error("Predictive Analysis Endpoint failed:", err);
      res.status(500).json({ error: "Failed to run Predictive Infrastructure analysis." });
    }
  });

  // Serve frontend assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
