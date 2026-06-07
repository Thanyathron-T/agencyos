import { NextRequest, NextResponse } from 'next/server'

const GROQ_KEY = process.env.GROQ_API_KEY ?? ''
const GROQ_MODEL = 'llama-3.3-70b-versatile'

const PLANNER_PROMPT = `คุณคือ Lunaria C. ซีอีโอเอเจนต์ของ Lunaria Agency — Marketing AI Agency
หน้าที่ของคุณคือวิเคราะห์ brief ของลูกค้า แล้วแตกออกเป็นงานย่อย (tasks) ที่ทีมงานต้องทำ

แต่ละ task ต้องมี:
- "type": ประเภทงาน เลือกได้จากตัวเลือกต่อไปนี้เท่านั้น
  - "content" : เขียน caption/คอนเทนต์โซเชียล
  - "ads" : เขียน ad copy/โฆษณา
  - "marketing" : วางแผนกลยุทธ์การตลาด แคมเปญ content calendar หรือ KPI
  - "seo" : ทำ keyword research, on-page SEO, แนวทางเขียนคอนเทนต์ให้ติดอันดับ
  - "brand" : วาง brand positioning, tone of voice, brand identity, วิเคราะห์แบรนด์คู่แข่ง
  - "customer-service" : ตอบคำถามลูกค้า, รับมือข้อร้องเรียน/การคืนสินค้า, ทำ FAQ, ปิดการขาย
  - "analytics" : วิเคราะห์ผลแคมเปญ, สรุป insight, วิเคราะห์ A/B test, จัดทำรายงานข้อมูล
  - "marketplace" : เขียนหน้าสินค้า Shopee/Lazada/TikTok Shop, วางแผน Flash Sale/ราคา, เพิ่มรีวิวและอันดับสินค้า
  - "email" : เขียน email sequence/newsletter, ปรับ subject line, วางกลยุทธ์แคมเปญอีเมล
  - "influencer" : หา/วิเคราะห์อินฟลูเอนเซอร์/KOL, เขียน KOL brief, คำนวณ ROI ของอินฟลูเอนเซอร์
  - "graphic" : สร้าง image prompt สำหรับ AI, เขียน artwork brief/visual guideline, อธิบาย brand asset
  - "video" : เขียนสคริปต์วิดีโอ Reels/TikTok, ทำ storyboard/shot list, แนะนำ caption/subtitle
  - "strategy" : คำแนะนำเชิงกลยุทธ์ทั่วไปที่ไม่เข้าพวกข้างต้น
- "brief": รายละเอียดงานสั้นๆ ที่จะส่งให้ทีมที่รับผิดชอบ

ตอบกลับเป็น JSON เท่านั้น ในรูปแบบ:
{"tasks": [{"type": "content", "brief": "..."}, {"type": "ads", "brief": "..."}]}

ห้ามมีข้อความอื่นนอกจาก JSON`

const REPORT_PROMPT = `คุณคือ Lunaria C. ซีอีโอเอเจนต์ของ Lunaria Agency — Marketing AI Agency
คุณได้มอบหมายงานให้ทีมต่างๆ ทำเสร็จแล้ว และได้รับผลลัพธ์กลับมา
หน้าที่ของคุณคือสรุปผลลัพธ์ทั้งหมดให้ลูกค้าฟัง เป็นรายงานสรุปภาษาไทย กระชับ เป็นมืออาชีพ
จัดหมวดหมู่ตามประเภทงาน ใช้ emoji พอเหมาะ และให้คำแนะนำเพิ่มเติมถ้ามีประโยชน์`

type Task = {
  type: 'content' | 'ads' | 'marketing' | 'seo' | 'brand' | 'customer-service' | 'analytics' | 'marketplace'
    | 'email' | 'influencer' | 'graphic' | 'video' | 'strategy'
  brief: string
}

const TASK_TYPES: Task['type'][] = [
  'content', 'ads', 'marketing', 'seo', 'brand', 'customer-service', 'analytics', 'marketplace',
  'email', 'influencer', 'graphic', 'video', 'strategy',
]

const SUB_AGENTS: Record<string, { path: string; resultKey: string }> = {
  content: { path: '/api/content-agent', resultKey: 'captions' },
  ads: { path: '/api/ad-copy-agent', resultKey: 'adCopy' },
  marketing: { path: '/api/marketing-agent', resultKey: 'strategy' },
  seo: { path: '/api/seo-agent', resultKey: 'seoPlan' },
  brand: { path: '/api/brand-agent', resultKey: 'brandPlan' },
  'customer-service': { path: '/api/customer-service-agent', resultKey: 'reply' },
  analytics: { path: '/api/analytics-agent', resultKey: 'insights' },
  marketplace: { path: '/api/marketplace-agent', resultKey: 'listingPlan' },
  email: { path: '/api/email-agent', resultKey: 'emailPlan' },
  influencer: { path: '/api/influencer-agent', resultKey: 'kolPlan' },
  graphic: { path: '/api/graphic-agent', resultKey: 'designBrief' },
  video: { path: '/api/video-agent', resultKey: 'videoScript' },
}

type TaskResult = { type: string; brief: string; result: string }

async function callGroq(messages: { role: string; content: string }[], maxTokens = 1000): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: maxTokens,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq error: ${err}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

function parseTasks(raw: string): Task[] {
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) return []
  try {
    const parsed = JSON.parse(match[0])
    if (!Array.isArray(parsed.tasks)) return []
    return parsed.tasks.filter((t: unknown): t is Task =>
      !!t && typeof t === 'object' &&
      TASK_TYPES.includes((t as Task).type) &&
      typeof (t as Task).brief === 'string'
    )
  } catch {
    return []
  }
}

async function runTask(origin: string, task: Task): Promise<TaskResult> {
  const subAgent = SUB_AGENTS[task.type]
  if (subAgent) {
    const res = await fetch(`${origin}${subAgent.path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief: task.brief }),
    })
    const data = await res.json()
    return { type: task.type, brief: task.brief, result: data[subAgent.resultKey] ?? data.error ?? '(ไม่มีผลลัพธ์)' }
  }

  // strategy: handled directly by the CEO agent itself
  const result = await callGroq([
    { role: 'system', content: 'คุณคือที่ปรึกษากลยุทธ์การตลาดมืออาชีพ ให้คำแนะนำที่นำไปใช้ได้จริง ตอบเป็นภาษาไทย' },
    { role: 'user', content: task.brief },
  ], 600)
  return { type: 'strategy', brief: task.brief, result }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message: string = body.message ?? body.brief ?? body.text ?? ''

    if (!message) {
      return NextResponse.json({ success: false, error: 'message is required' }, { status: 400 })
    }
    if (!GROQ_KEY) {
      return NextResponse.json({ success: false, error: 'GROQ_API_KEY is not configured' }, { status: 500 })
    }

    // 1. Analyze the brief and break it down into tasks
    const planRaw = await callGroq([
      { role: 'system', content: PLANNER_PROMPT },
      { role: 'user', content: message },
    ], 700)

    let tasks = parseTasks(planRaw)
    if (tasks.length === 0) {
      tasks = [{ type: 'strategy', brief: message }]
    }

    // 2. Dispatch each task to the right agent (in parallel)
    const origin = req.nextUrl.origin
    const results = await Promise.all(tasks.map((task) => runTask(origin, task)))

    // 3. Aggregate everything into a single report
    const aggregated = results
      .map((r, i) => `[งานที่ ${i + 1} — ${r.type}]\nโจทย์: ${r.brief}\nผลลัพธ์:\n${r.result}`)
      .join('\n\n')

    const report = await callGroq([
      { role: 'system', content: REPORT_PROMPT },
      { role: 'user', content: `Brief ของลูกค้า: ${message}\n\nผลงานจากทีมต่างๆ:\n${aggregated}` },
    ], 1200)

    return NextResponse.json({
      success: true,
      source: 'groq',
      reply: report,
      tasks: results,
    })

  } catch (err) {
    console.error('[chat-agent/CEO] Unexpected error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
