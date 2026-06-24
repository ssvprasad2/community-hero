export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssueStatus = 'Reported' | 'Verified' | 'In Progress' | 'Resolved';

export interface TimelineEvent {
  id: string;
  status: IssueStatus;
  timestamp: string;
  description: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  image?: string; // Base64 or URL
  latitude: number;
  longitude: number;
  category: string;
  severity: SeverityLevel;
  summary: string;
  department: string;
  status: IssueStatus;
  upvotes: number;
  votes?: number; // DB field alignment
  createdAt: string;
  created_at?: string; // DB field alignment
  timeline: TimelineEvent[];
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  priorityExplanation?: string;
  priorityScore: number;
}

export interface DashboardStats {
  total: number;
  open: number;
  resolved: number;
  highPriority: number;
}
