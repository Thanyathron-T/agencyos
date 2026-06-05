export type OfficeStatus = "working" | "idle" | "reviewing" | "waiting" | "publishing";

export interface OfficeAgent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  zoneId: string;
  status: OfficeStatus;
  task: string;
  progress: number;
  completedTasks: number;
  lastActivity: string;
  colorKey: string;
}

export interface OfficeZone {
  id: string;
  name: string;
  description: string;
  colorKey: string;
}

export interface ActivityEvent {
  id: string;
  agentName: string;
  action: string;
  detail: string;
  timeAgo: string;
  colorKey: string;
}

export const officeZones: OfficeZone[] = [
  {
    id: "z-marketing",
    name: "Marketing Zone",
    description: "Brand strategy & campaign management",
    colorKey: "violet",
  },
  {
    id: "z-content",
    name: "Content Zone",
    description: "Writing, SEO & trend analysis",
    colorKey: "cyan",
  },
  {
    id: "z-design",
    name: "Design Zone",
    description: "Creative direction & visual assets",
    colorKey: "pink",
  },
  {
    id: "z-ads",
    name: "Ads Zone",
    description: "Paid media & budget optimisation",
    colorKey: "amber",
  },
  {
    id: "z-support",
    name: "Support Zone",
    description: "Social media & customer success",
    colorKey: "emerald",
  },
  {
    id: "z-ops",
    name: "Operations Zone",
    description: "Analytics, email & automation",
    colorKey: "blue",
  },
];

export const officeAgents: OfficeAgent[] = [
  // Marketing Zone
  {
    id: "oa1",
    name: "BrandVoice",
    role: "Brand Strategist",
    avatar: "BV",
    zoneId: "z-marketing",
    status: "working",
    task: "Developing Q3 brand positioning for TechNova launch campaign",
    progress: 72,
    completedTasks: 184,
    lastActivity: "3 min ago",
    colorKey: "violet",
  },
  {
    id: "oa2",
    name: "CampaignAI",
    role: "Campaign Manager",
    avatar: "CA",
    zoneId: "z-marketing",
    status: "reviewing",
    task: "Reviewing EcoWear multi-channel campaign performance metrics",
    progress: 45,
    completedTasks: 97,
    lastActivity: "12 min ago",
    colorKey: "violet",
  },
  {
    id: "oa3",
    name: "CopyBot Pro",
    role: "Copywriter",
    avatar: "CB",
    zoneId: "z-marketing",
    status: "working",
    task: "Writing TechNova hero banner copy — 3rd revision",
    progress: 88,
    completedTasks: 342,
    lastActivity: "Just now",
    colorKey: "violet",
  },
  {
    id: "oa4",
    name: "MarketMind",
    role: "Market Researcher",
    avatar: "MM",
    zoneId: "z-marketing",
    status: "idle",
    task: "Awaiting new brief from campaign lead",
    progress: 0,
    completedTasks: 58,
    lastActivity: "41 min ago",
    colorKey: "violet",
  },

  // Content Zone
  {
    id: "oa5",
    name: "BlogCraft",
    role: "Content Writer",
    avatar: "BC",
    zoneId: "z-content",
    status: "publishing",
    task: "Publishing FinFlow SEO article to CMS — final review passed",
    progress: 95,
    completedTasks: 211,
    lastActivity: "1 min ago",
    colorKey: "cyan",
  },
  {
    id: "oa6",
    name: "SEO Sage",
    role: "SEO Strategist",
    avatar: "SS",
    zoneId: "z-content",
    status: "working",
    task: "Keyword clustering analysis for FinFlow growth campaign",
    progress: 61,
    completedTasks: 187,
    lastActivity: "8 min ago",
    colorKey: "cyan",
  },
  {
    id: "oa7",
    name: "TrendWatch",
    role: "Trend Analyst",
    avatar: "TW",
    zoneId: "z-content",
    status: "working",
    task: "Scanning emerging topics in B2B SaaS — June 2026 digest",
    progress: 38,
    completedTasks: 62,
    lastActivity: "5 min ago",
    colorKey: "cyan",
  },

  // Design Zone
  {
    id: "oa8",
    name: "VisualMind",
    role: "Creative Director",
    avatar: "VM",
    zoneId: "z-design",
    status: "reviewing",
    task: "Art direction review for EcoWear brand identity system",
    progress: 55,
    completedTasks: 219,
    lastActivity: "18 min ago",
    colorKey: "pink",
  },
  {
    id: "oa9",
    name: "PixelForge",
    role: "Graphic Designer",
    avatar: "PF",
    zoneId: "z-design",
    status: "working",
    task: "Creating 10-slide Instagram carousel for EcoWear Spring collection",
    progress: 77,
    completedTasks: 143,
    lastActivity: "4 min ago",
    colorKey: "pink",
  },

  // Ads Zone
  {
    id: "oa10",
    name: "AdBot Alpha",
    role: "Paid Ads Specialist",
    avatar: "AA",
    zoneId: "z-ads",
    status: "working",
    task: "Optimising MindfulMeals Google Ads — adjusting bidding strategy",
    progress: 83,
    completedTasks: 133,
    lastActivity: "2 min ago",
    colorKey: "amber",
  },
  {
    id: "oa11",
    name: "SpendWise",
    role: "Budget Optimiser",
    avatar: "SW",
    zoneId: "z-ads",
    status: "waiting",
    task: "Awaiting Q3 budget allocation approval from client",
    progress: 20,
    completedTasks: 44,
    lastActivity: "1h ago",
    colorKey: "amber",
  },
  {
    id: "oa12",
    name: "BidMaster",
    role: "PPC Manager",
    avatar: "BM",
    zoneId: "z-ads",
    status: "working",
    task: "Running A/B split test on Facebook ads creative for NovaPay",
    progress: 64,
    completedTasks: 89,
    lastActivity: "9 min ago",
    colorKey: "amber",
  },

  // Support Zone
  {
    id: "oa13",
    name: "SocialSync",
    role: "Social Media Manager",
    avatar: "SY",
    zoneId: "z-support",
    status: "idle",
    task: "Queue empty — awaiting content batch from Content Zone",
    progress: 0,
    completedTasks: 411,
    lastActivity: "33 min ago",
    colorKey: "emerald",
  },
  {
    id: "oa14",
    name: "ClientPulse",
    role: "Customer Success",
    avatar: "CP",
    zoneId: "z-support",
    status: "working",
    task: "Compiling monthly client satisfaction report — 3 clients",
    progress: 42,
    completedTasks: 76,
    lastActivity: "6 min ago",
    colorKey: "emerald",
  },

  // Operations Zone
  {
    id: "oa15",
    name: "DataPulse",
    role: "Analytics Agent",
    avatar: "DP",
    zoneId: "z-ops",
    status: "working",
    task: "Building Week 22 cross-channel performance dashboard",
    progress: 91,
    completedTasks: 95,
    lastActivity: "Just now",
    colorKey: "blue",
  },
  {
    id: "oa16",
    name: "EmailCraft",
    role: "Email Marketer",
    avatar: "EC",
    zoneId: "z-ops",
    status: "working",
    task: "Running A/B test on 4 subject lines for NovaPay welcome sequence",
    progress: 56,
    completedTasks: 278,
    lastActivity: "7 min ago",
    colorKey: "blue",
  },
  {
    id: "oa17",
    name: "FlowBot",
    role: "Automation Manager",
    avatar: "FB",
    zoneId: "z-ops",
    status: "idle",
    task: "All automation workflows running — standing by",
    progress: 0,
    completedTasks: 312,
    lastActivity: "22 min ago",
    colorKey: "blue",
  },
];

export const officeActivityFeed: ActivityEvent[] = [
  {
    id: "ev1",
    agentName: "BlogCraft",
    action: "published",
    detail: "FinFlow SEO article — 1,800 words — to production CMS",
    timeAgo: "1 min ago",
    colorKey: "cyan",
  },
  {
    id: "ev2",
    agentName: "AdBot Alpha",
    action: "optimised",
    detail: "3 MindfulMeals ad campaigns — avg. CPA reduced by 12%",
    timeAgo: "4 min ago",
    colorKey: "amber",
  },
  {
    id: "ev3",
    agentName: "CopyBot Pro",
    action: "completed",
    detail: "TechNova hero banner copy — revision 3 approved",
    timeAgo: "9 min ago",
    colorKey: "violet",
  },
  {
    id: "ev4",
    agentName: "PixelForge",
    action: "delivered",
    detail: "EcoWear Instagram carousel — 10 assets exported",
    timeAgo: "16 min ago",
    colorKey: "pink",
  },
  {
    id: "ev5",
    agentName: "DataPulse",
    action: "generated",
    detail: "Week 22 cross-channel performance dashboard",
    timeAgo: "24 min ago",
    colorKey: "blue",
  },
  {
    id: "ev6",
    agentName: "TrendWatch",
    action: "discovered",
    detail: "8 emerging B2B SaaS topics for June content calendar",
    timeAgo: "31 min ago",
    colorKey: "cyan",
  },
  {
    id: "ev7",
    agentName: "EmailCraft",
    action: "launched",
    detail: "NovaPay welcome sequence A/B test — 4 variants live",
    timeAgo: "45 min ago",
    colorKey: "blue",
  },
  {
    id: "ev8",
    agentName: "VisualMind",
    action: "approved",
    detail: "EcoWear brand identity system — ready for production",
    timeAgo: "1h ago",
    colorKey: "pink",
  },
];

export const companyHealth = {
  agentsOnline: 13,
  agentsTotal: 17,
  activeProjects: 24,
  outputsToday: 47,
  mrr: "$84,200",
  mrrChange: "+12%",
};
