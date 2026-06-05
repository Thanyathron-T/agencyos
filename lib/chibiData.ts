/* Thai conversation lines + chibi-specific data */

export const thaiConversations: Record<string, string[]> = {
  "z-marketing": [
    "ขอเพิ่ม Hook อีก 3 แบบนะ ✨",
    "Draft Copy รอบแรกเสร็จแล้ว! 🎉",
    "Brand Voice ต้องอ่อนโยนขึ้น 💕",
    "กำลัง Pitch Concept ใหม่ค่ะ",
    "Tagline ตัวใหม่ดูดีมากเลย ✅",
    "ปรับ Tone ให้ Premium ขึ้นได้เลย",
    "Campaign Brief พร้อมแล้วนะคะ 🌸",
  ],
  "z-content": [
    "กำลัง Draft Caption อยู่ค่ะ 📝",
    "SEO ผ่านแล้ว ส่ง Review ได้เลย ✅",
    "Keyword ตัวนี้ดีมากเลย! เอาเลย",
    "Blog 1,800 คำเสร็จแล้ว 🎊",
    "Outline พร้อม รอ Approve นะคะ",
    "Trending Topic นี้ต้องทำเลย 🔥",
    "กำลังเขียน Script ตอนที่ 2 อยู่",
  ],
  "z-design": [
    "Artwork รอบแรกพร้อมแล้ว 🎨",
    "Font ตัวนี้ cute มากๆ เลยนะ ✨",
    "กำลัง Export ไฟล์ให้ลูกค้าอยู่",
    "Color Palette ใหม่สวยมาก! 💜",
    "Mockup พร้อม Review ได้เลยนะคะ",
    "Visual Identity เสร็จสมบูรณ์! 🎉",
    "Revision รอบ 2 ปรับนิดหน่อยค่ะ",
  ],
  "z-ads": [
    "CTR เพิ่มขึ้น 14%! 🚀",
    "กำลัง Optimise Budget อยู่นะ",
    "A/B Test รันเรียบร้อยแล้ว ✅",
    "ROAS ดีขึ้นมากเลยวันนี้ 📈",
    "เพิ่ม Conversion Rate ได้แล้ว 🎯",
    "Bid Strategy ปรับใหม่แล้วนะคะ",
    "Ad Score สูงขึ้นทุก Campaign ✨",
  ],
  "z-support": [
    "ลูกค้าขอข้อมูล Package ค่ะ 🤝",
    "ตอบ Comment เสร็จหมดแล้ว ✅",
    "Engagement วันนี้ดีมากเลย! 💕",
    "DM เข้ามา 5 ข้อความ กำลังตอบ",
    "ลูกค้า Happy มากเลย! 😊",
    "Satisfaction Report เสร็จแล้วค่ะ",
    "ชุมชน Online กำลังบูม! 🌸",
  ],
  "z-ops": [
    "Schedule Publish เรียบร้อยแล้ว 📅",
    "Report พร้อมส่งลูกค้าแล้วค่ะ ✅",
    "Automation ทำงานปกติดีนะ",
    "Dashboard Update เรียบร้อย 💙",
    "Analytics สรุปผลสัปดาห์แล้ว 📊",
    "Workflow ทำงาน Smooth มาก ✨",
    "Pipeline ไม่มี Error ค่ะ 🎊",
  ],
};

/* Thai task descriptions keyed by agent id */
export const thaiTasks: Record<string, string> = {
  oa1:  "กำลังพัฒนา Brand Positioning สำหรับแคมเปญ TechNova Q3",
  oa2:  "กำลังรีวิว Metric ประสิทธิภาพแคมเปญ EcoWear",
  oa3:  "กำลังเขียน Hero Banner Copy ของ TechNova — Revision 3",
  oa4:  "รอรับ Brief ใหม่จาก Campaign Lead",
  oa5:  "กำลัง Publish บทความ SEO FinFlow ขึ้น CMS",
  oa6:  "วิเคราะห์ Keyword Cluster สำหรับแคมเปญ FinFlow",
  oa7:  "สแกน Trending Topic เดือนมิถุนายน 2026",
  oa8:  "กำลัง Art Direction รีวิว EcoWear Brand Identity",
  oa9:  "ออกแบบ Instagram Carousel 10 ชิ้นให้ EcoWear",
  oa10: "กำลัง Optimise Google Ads — ปรับ Bidding Strategy",
  oa11: "รออนุมัติงบประมาณ Q3 จากลูกค้า",
  oa12: "รัน A/B Test โฆษณา Facebook ให้ NovaPay",
  oa13: "Queue ว่าง — รอ Content Batch จาก Content Zone",
  oa14: "จัดทำรายงานความพึงพอใจลูกค้ารายเดือน — 3 ราย",
  oa15: "สร้าง Cross-Channel Performance Dashboard สัปดาห์ที่ 22",
  oa16: "รัน A/B Test Subject Line สำหรับ NovaPay Welcome Email",
  oa17: "Workflow ทำงานปกติ — พร้อมรับงานใหม่",
};

/* Activity feed initial messages */
export interface ChatMessage {
  id: string;
  agentName: string;
  agentAvatar: string;
  zoneId: string;
  message: string;
  timeAgo: string;
}

export const initialChatMessages: ChatMessage[] = [
  {
    id: "cm1",
    agentName: "BlogCraft",
    agentAvatar: "BC",
    zoneId: "z-content",
    message: "Blog SEO FinFlow เสร็จแล้วค่ะ! 1,800 คำ พร้อม Publish 🎉",
    timeAgo: "เมื่อกี้",
  },
  {
    id: "cm2",
    agentName: "AdBot Alpha",
    agentAvatar: "AA",
    zoneId: "z-ads",
    message: "CTR ของ MindfulMeals เพิ่มขึ้น 14% แล้วนะคะ 📈",
    timeAgo: "4 นาที",
  },
  {
    id: "cm3",
    agentName: "CopyBot Pro",
    agentAvatar: "CB",
    zoneId: "z-marketing",
    message: "Hero Banner TechNova Revision 3 ผ่านแล้ว ✅",
    timeAgo: "9 นาที",
  },
  {
    id: "cm4",
    agentName: "PixelForge",
    agentAvatar: "PF",
    zoneId: "z-design",
    message: "Instagram Carousel EcoWear พร้อมส่งแล้ว 10 ชิ้น 🎨",
    timeAgo: "16 นาที",
  },
  {
    id: "cm5",
    agentName: "DataPulse",
    agentAvatar: "DP",
    zoneId: "z-ops",
    message: "Dashboard Week 22 เสร็จเรียบร้อยค่ะ 📊",
    timeAgo: "24 นาที",
  },
  {
    id: "cm6",
    agentName: "TrendWatch",
    agentAvatar: "TW",
    zoneId: "z-content",
    message: "พบ Trending Topic 8 หัวข้อสำหรับเดือนมิถุนายนค่ะ 🔥",
    timeAgo: "31 นาที",
  },
  {
    id: "cm7",
    agentName: "SocialSync",
    agentAvatar: "SY",
    zoneId: "z-support",
    message: "ตอบ Comment ครบทุกแพลตฟอร์มแล้วค่ะ 💕",
    timeAgo: "38 นาที",
  },
];

/* Pool of new messages that cycle into the chat */
export const chatMessagePool: Omit<ChatMessage, "id" | "timeAgo">[] = [
  { agentName: "BrandVoice",   agentAvatar: "BV", zoneId: "z-marketing", message: "ปรับ Brand Voice ให้ Premium ขึ้นแล้วนะคะ ✨" },
  { agentName: "SEO Sage",     agentAvatar: "SS", zoneId: "z-content",   message: "พบ Keyword โอกาสใหม่อีก 12 ตัวค่ะ 🎯" },
  { agentName: "VisualMind",   agentAvatar: "VM", zoneId: "z-design",    message: "Artwork รอบ 2 ปรับสี Palette เรียบร้อยแล้ว 🎨" },
  { agentName: "AdBot Alpha",  agentAvatar: "AA", zoneId: "z-ads",       message: "ROAS Campaign MindfulMeals ดีขึ้น 22% 🚀" },
  { agentName: "ClientPulse",  agentAvatar: "CP", zoneId: "z-support",   message: "ลูกค้า TechNova ชอบ Proposal มากค่ะ 🤝" },
  { agentName: "EmailCraft",   agentAvatar: "EC", zoneId: "z-ops",       message: "A/B Test Email NovaPay — Version B ชนะ 📧" },
  { agentName: "CampaignAI",   agentAvatar: "CA", zoneId: "z-marketing", message: "Campaign EcoWear พร้อมเปิดตัวแล้วค่ะ 🌸" },
  { agentName: "BlogCraft",    agentAvatar: "BC", zoneId: "z-content",   message: "เขียน Case Study FinFlow เสร็จแล้ว 2,400 คำ ✅" },
  { agentName: "PixelForge",   agentAvatar: "PF", zoneId: "z-design",    message: "Export ไฟล์ทั้งหมดพร้อมส่งลูกค้าแล้วค่ะ 📦" },
  { agentName: "BidMaster",    agentAvatar: "BM", zoneId: "z-ads",       message: "Facebook Ads Score เพิ่มเป็น 9/10 แล้วค่ะ ⭐" },
  { agentName: "DataPulse",    agentAvatar: "DP", zoneId: "z-ops",       message: "Analytics Report สัปดาห์นี้ Trend ดีมากค่ะ 📈" },
  { agentName: "FlowBot",      agentAvatar: "FB", zoneId: "z-ops",       message: "Automation ทำงาน 24/7 ไม่มี Error เลยค่ะ ✨" },
];

/* Today's missions */
export interface Mission {
  done: boolean;
  text: string;
  emoji: string;
}

export const todaysMissions: Mission[] = [
  { done: true,  text: "ส่ง Content Calendar ให้ TechNova",         emoji: "📅" },
  { done: true,  text: "Publish Blog SEO สำหรับ FinFlow",           emoji: "✍️" },
  { done: false, text: "รีวิว EcoWear Visual Identity",              emoji: "🎨" },
  { done: false, text: "จัดทำ Report ประจำสัปดาห์",                  emoji: "📊" },
  { done: false, text: "ปรับ Ads Budget สำหรับ MindfulMeals",       emoji: "💰" },
];

/* Team mood */
export interface MoodItem {
  emoji: string;
  label: string;
  count: number;
  color: string;
}

export const teamMoods: MoodItem[] = [
  { emoji: "😊", label: "แฮปปี้",        count: 8,  color: "bg-chibi-pink/40"    },
  { emoji: "🎯", label: "โฟกัส",         count: 5,  color: "bg-chibi-primary/30" },
  { emoji: "🚀", label: "ไฟแรง",         count: 2,  color: "bg-chibi-sun/50"     },
  { emoji: "☕", label: "ง่วงนิดหน่อย",   count: 2,  color: "bg-chibi-mint/40"    },
];
