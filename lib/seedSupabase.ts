import { supabase } from './supabase'

const AGENTS = [
  // Marketing (3)
  { id: 'oa1', name: 'นักการตลาด 1', role: 'Brand Strategist', zone_id: 'z-marketing', status: 'working', task: 'Developing Q3 brand positioning', progress: 72, color_key: 'violet' },
  { id: 'oa2', name: 'นักการตลาด 2', role: 'Campaign Manager', zone_id: 'z-marketing', status: 'reviewing', task: 'Reviewing campaign performance metrics', progress: 45, color_key: 'violet' },
  { id: 'oa3', name: 'นักการตลาด 3', role: 'Copywriter', zone_id: 'z-marketing', status: 'working', task: 'Writing hero banner copy — 3rd revision', progress: 88, color_key: 'violet' },
  // Content (3)
  { id: 'oa5', name: 'คอนเทนต์ 1', role: 'Content Writer', zone_id: 'z-content', status: 'publishing', task: 'Publishing SEO article to CMS', progress: 95, color_key: 'cyan' },
  { id: 'oa6', name: 'คอนเทนต์ 2', role: 'SEO Strategist', zone_id: 'z-content', status: 'working', task: 'Keyword clustering analysis for growth campaign', progress: 61, color_key: 'cyan' },
  { id: 'oa7', name: 'คอนเทนต์ 3', role: 'Trend Analyst', zone_id: 'z-content', status: 'working', task: 'Scanning emerging topics — June digest', progress: 38, color_key: 'cyan' },
  // Design (2)
  { id: 'oa8', name: 'กราฟฟิค 1', role: 'Creative Director', zone_id: 'z-design', status: 'reviewing', task: 'Art direction review for brand identity', progress: 55, color_key: 'pink' },
  { id: 'oa9', name: 'กราฟฟิค 2', role: 'Graphic Designer', zone_id: 'z-design', status: 'working', task: 'Creating Instagram carousel — Spring collection', progress: 77, color_key: 'pink' },
  // Ads (3)
  { id: 'oa10', name: 'ยิงแอด 1', role: 'Paid Ads Specialist', zone_id: 'z-ads', status: 'working', task: 'Optimising Google Ads — adjusting bidding strategy', progress: 83, color_key: 'amber' },
  { id: 'oa11', name: 'ยิงแอด 2', role: 'Budget Optimiser', zone_id: 'z-ads', status: 'waiting', task: 'Awaiting Q3 budget allocation approval', progress: 20, color_key: 'amber' },
  { id: 'oa12', name: 'ยิงแอด 3', role: 'PPC Manager', zone_id: 'z-ads', status: 'working', task: 'Running A/B split test on Facebook ads creative', progress: 64, color_key: 'amber' },
  // Support (2)
  { id: 'oa13', name: 'ตอบแชท 1', role: 'Social Media Manager', zone_id: 'z-support', status: 'idle', task: 'Queue empty — awaiting content batch', progress: 0, color_key: 'emerald' },
  { id: 'oa14', name: 'ตอบแชท 2', role: 'Customer Success', zone_id: 'z-support', status: 'working', task: 'Compiling monthly client satisfaction report', progress: 42, color_key: 'emerald' },
]

const TASKS = [
  { agent_name: 'คอนเทนต์ 1', action: 'published', detail: 'FinFlow SEO article — 1,800 words — to production CMS', color_key: 'cyan' },
  { agent_name: 'ยิงแอด 1', action: 'optimised', detail: '3 ad campaigns — avg. CPA reduced by 12%', color_key: 'amber' },
  { agent_name: 'นักการตลาด 3', action: 'completed', detail: 'TechNova hero banner copy — revision 3 approved', color_key: 'violet' },
  { agent_name: 'กราฟฟิค 2', action: 'delivered', detail: 'Instagram carousel — 10 assets exported', color_key: 'pink' },
  { agent_name: 'ออเดอร์ 1', action: 'generated', detail: 'Week 22 cross-channel performance dashboard', color_key: 'blue' },
  { agent_name: 'คอนเทนต์ 3', action: 'discovered', detail: '8 emerging B2B SaaS topics for June content calendar', color_key: 'cyan' },
  { agent_name: 'ออเดอร์ 2', action: 'launched', detail: 'NovaPay welcome sequence A/B test — 4 variants live', color_key: 'blue' },
  { agent_name: 'กราฟฟิค 1', action: 'approved', detail: 'EcoWear brand identity system — ready for production', color_key: 'pink' },
  { agent_name: 'นักการตลาด 2', action: 'reviewed', detail: 'Q2 campaign report — 5 clients summarised', color_key: 'violet' },
  { agent_name: 'ตอบแชท 2', action: 'resolved', detail: '12 customer tickets — avg. response time 4 min', color_key: 'emerald' },
]

let seeded = false

export async function seedIfNeeded() {
  if (seeded) return
  seeded = true

  const { count } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true })

  if ((count ?? 0) > 0) return

  await supabase.from('agents').insert(AGENTS)
  await supabase.from('tasks').insert(TASKS)
}
