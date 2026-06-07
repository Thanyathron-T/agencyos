import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GROQ_KEY = process.env.GROQ_API_KEY ?? ''

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYSTEM_PROMPT = `คุณคือ Influencer Marketing Strategist มืออาชีพ ผู้เชี่ยวชาญตลาด Influencer/KOL ในไทย
หน้าที่ของคุณคือ:
1. ค้นหาและวิเคราะห์โปรไฟล์อินฟลูเอนเซอร์ที่เหมาะกับแบรนด์
2. เขียน KOL Brief และแนวทางแคมเปญ
3. คำนวณ ROI ตามระดับอินฟลูเอนเซอร์ (Nano/Micro/Macro/Mega)
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

    const kolPlan = await callGroq(brief)

    const { error: dbErr } = await supabase.from('tasks').insert({
      agent_name: 'Influencer Agent',
      action: 'จัดทำแผน Influencer เสร็จแล้ว ✅',
      detail: brief.slice(0, 200),
      color_key: 'pink',
    })
    if (dbErr) console.error('[influencer-agent] Supabase insert error:', dbErr.message)

    return NextResponse.json({ success: true, source: 'groq', kolPlan })

  } catch (err) {
    console.error('[influencer-agent] Unexpected error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
