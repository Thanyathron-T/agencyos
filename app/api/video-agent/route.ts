import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GROQ_KEY = process.env.GROQ_API_KEY ?? ''

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYSTEM_PROMPT = `คุณคือ Video Content Creator มืออาชีพ ผู้เชี่ยวชาญการทำวิดีโอสั้นสำหรับตลาดไทย
หน้าที่ของคุณคือ:
1. เขียนสคริปต์วิดีโอสำหรับ Reels/TikTok
2. สร้าง Storyboard และ Shot List
3. แนะนำ Caption และ Subtitle ที่ดึงดูดผู้ชม
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

    const videoScript = await callGroq(brief)

    const { error: dbErr } = await supabase.from('tasks').insert({
      agent_name: 'Video Agent',
      action: 'จัดทำสคริปต์วิดีโอเสร็จแล้ว ✅',
      detail: brief.slice(0, 200),
      color_key: 'blue',
    })
    if (dbErr) console.error('[video-agent] Supabase insert error:', dbErr.message)

    return NextResponse.json({ success: true, source: 'groq', videoScript })

  } catch (err) {
    console.error('[video-agent] Unexpected error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
