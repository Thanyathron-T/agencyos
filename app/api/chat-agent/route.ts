import { NextRequest, NextResponse } from 'next/server'

const N8N_URL  = process.env.N8N_CHAT_WEBHOOK_URL ?? ''
const GROQ_KEY = process.env.GROQ_API_KEY ?? ''

const SYSTEM_PROMPT = `คุณคือ AI Agent ผู้ช่วยของ AgencyOS — Marketing AI Agency
ตอบคำถามเกี่ยวกับ Marketing, Content, Ads, Strategy ได้ครบ
ตอบเป็นภาษาไทยเสมอ กระชับ ฉลาด มีประโยชน์ ใช้ emoji พอเหมาะ
ถ้าถามเรื่อง campaign หรือ brief ให้ให้คำแนะนำที่นำไปใช้ได้จริง`

async function callGroq(messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 800,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq error: ${err}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? '(ไม่มีคำตอบ)'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message: string = body.message ?? body.text ?? ''
    const history: { role: string; content: string }[] = body.history ?? []

    if (!message) {
      return NextResponse.json({ success: false, error: 'message is required' }, { status: 400 })
    }

    // ── Try n8n first (if configured) ──────────────────────
    if (N8N_URL) {
      try {
        const n8nRes = await fetch(N8N_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (n8nRes.ok) {
          const data = await n8nRes.json()
          return NextResponse.json({ success: true, source: 'n8n', ...data })
        }
        console.warn('[chat-agent] n8n failed, falling back to Groq')
      } catch (e) {
        console.warn('[chat-agent] n8n unreachable, falling back to Groq:', e)
      }
    }

    // ── Fallback: Groq ──────────────────────────────────────
    if (!GROQ_KEY) {
      return NextResponse.json(
        { success: false, error: 'GROQ_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const messages = [
      ...history.map((h: { role: string; content: string }) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ]

    const reply = await callGroq(messages)
    return NextResponse.json({ success: true, source: 'groq', reply })

  } catch (err) {
    console.error('[chat-agent] Unexpected error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
