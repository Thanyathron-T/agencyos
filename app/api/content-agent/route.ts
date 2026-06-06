import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { brief } = await req.json()

    if (!brief || typeof brief !== 'string') {
      return NextResponse.json(
        { success: false, error: 'brief is required' },
        { status: 400 }
      )
    }

    // 1. Call Groq API
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'คุณคือ Content Creator มืออาชีพ เขียน caption ภาษาไทย 3 แบบ มี emoji มี CTA แบ่งด้วย ---',
          },
          {
            role: 'user',
            content: brief,
          },
        ],
        max_tokens: 1000,
      }),
    })

    if (!groqRes.ok) {
      const err = await groqRes.text()
      console.error('[content-agent] Groq error:', err)
      return NextResponse.json(
        { success: false, error: 'Groq API failed', detail: err },
        { status: 502 }
      )
    }

    const groqData = await groqRes.json()
    const captions: string = groqData.choices?.[0]?.message?.content ?? ''

    // 2. Insert task to Supabase
    const { error: dbErr } = await supabase.from('tasks').insert({
      agent_name: 'คอนเทนต์ 1',
      action: 'เขียน caption เสร็จแล้ว ✅',
      detail: brief,
      color_key: 'cyan',
    })

    if (dbErr) {
      console.error('[content-agent] Supabase insert error:', dbErr.message)
    }

    // 3. Return captions
    return NextResponse.json({ success: true, captions })

  } catch (err) {
    console.error('[content-agent] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
