import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GROQ_KEY = process.env.GROQ_API_KEY ?? ''

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYSTEM_PROMPT = `คุณคือ SEO Specialist มืออาชีพ ผู้เชี่ยวชาญตลาดและพฤติกรรมการค้นหาของผู้ใช้ชาวไทย
หน้าที่ของคุณคือ:
1. ทำ Keyword Research และวิเคราะห์คีย์เวิร์ด
2. ให้คำแนะนำ On-page SEO
3. แนะนำแนวทางเขียนคอนเทนต์ให้ติดอันดับ SEO
ตอบเป็นภาษาไทยเสมอ จัดเป็นหัวข้อชัดเจน นำไปใช้ได้จริง`

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
      max_tokens: 1500,
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
    if (!GROQ_KEY) {
      return NextResponse.json({ success: false, error: 'GROQ_API_KEY is not configured' }, { status: 500 })
    }

    const seoPlan = await callGroq(brief)

    const { error: dbErr } = await supabase.from('tasks').insert({
      agent_name: 'SEO Agent',
      action: 'วิเคราะห์ SEO เสร็จแล้ว ✅',
      detail: brief.slice(0, 200),
      color_key: 'emerald',
    })
    if (dbErr) console.error('[seo-agent] Supabase insert error:', dbErr.message)

    return NextResponse.json({ success: true, source: 'groq', seoPlan })

  } catch (err) {
    console.error('[seo-agent] Unexpected error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
