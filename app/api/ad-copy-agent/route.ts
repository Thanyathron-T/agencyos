import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const N8N_URL  = process.env.N8N_AD_COPY_WEBHOOK_URL ?? ''
const GROQ_KEY = process.env.GROQ_API_KEY ?? ''

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYSTEM_PROMPT = `คุณคือ Ad Copy Specialist มืออาชีพ
เขียนโฆษณาภาษาไทยที่ดึงดูดใจ ขายได้จริง สร้างสรรค์ และตรงกลุ่มเป้าหมาย
ทุกครั้งให้เขียน Ad Copy 3 แบบ แต่ละแบบมี:
1. Headline (พาดหัว) — สั้น กระชับ แรง
2. Body (เนื้อหา) — อธิบายประโยชน์ สร้างความต้องการ
3. CTA (Call-to-Action) — ชัดเจน กระตุ้นให้คลิก/ซื้อทันที
แบ่งแต่ละ version ด้วยบรรทัด ---`

async function callGroq(brief: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: brief },
      ],
      max_tokens: 1200,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq error: ${err}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? '(ไม่มีผลลัพธ์)'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const brief: string = body.brief ?? body.message ?? body.text ?? ''

    if (!brief) {
      return NextResponse.json({ success: false, error: 'brief is required' }, { status: 400 })
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
        console.warn('[ad-copy-agent] n8n failed, falling back to Groq')
      } catch (e) {
        console.warn('[ad-copy-agent] n8n unreachable, falling back to Groq:', e)
      }
    }

    // ── Fallback: Groq ──────────────────────────────────────
    if (!GROQ_KEY) {
      return NextResponse.json(
        { success: false, error: 'GROQ_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const adCopy = await callGroq(brief)

    // ── Log to Supabase ─────────────────────────────────────
    const { error: dbErr } = await supabase.from('tasks').insert({
      agent_name: 'Ad Copy Agent',
      action: 'เขียน Ad Copy เสร็จแล้ว ✅',
      detail: brief.slice(0, 200),
      color_key: 'amber',
    })
    if (dbErr) console.error('[ad-copy-agent] Supabase insert error:', dbErr.message)

    return NextResponse.json({ success: true, source: 'groq', adCopy })

  } catch (err) {
    console.error('[ad-copy-agent] Unexpected error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
