import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GROQ_KEY = process.env.GROQ_API_KEY ?? ''

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYSTEM_PROMPT = `คุณคือ Marketplace Manager มืออาชีพ ผู้เชี่ยวชาญการขายบน Shopee, Lazada และ TikTok Shop ในตลาดไทย
หน้าที่ของคุณคือ:
1. เขียนหน้าสินค้า (product listing) ให้ Shopee/Lazada/TikTok Shop ที่ดึงดูดและปิดการขายได้
2. วางแผน Flash Sale และกลยุทธ์การตั้งราคา
3. ให้คำแนะนำการเพิ่มรีวิวและดันอันดับสินค้า (review & ranking optimization)
ตอบเป็นภาษาไทยเสมอ จัดเป็นหัวข้อชัดเจน นำไปใช้ได้จริง ใช้ emoji พอเหมาะ`

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

    const listingPlan = await callGroq(brief)

    const { error: dbErr } = await supabase.from('tasks').insert({
      agent_name: 'Marketplace Agent',
      action: 'จัดทำแผนมาร์เก็ตเพลสเสร็จแล้ว ✅',
      detail: brief.slice(0, 200),
      color_key: 'amber',
    })
    if (dbErr) console.error('[marketplace-agent] Supabase insert error:', dbErr.message)

    return NextResponse.json({ success: true, source: 'groq', listingPlan })

  } catch (err) {
    console.error('[marketplace-agent] Unexpected error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
