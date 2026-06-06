import { NextRequest, NextResponse } from 'next/server'

const N8N_WEBHOOK_URL = process.env.N8N_AD_COPY_WEBHOOK_URL ?? ''

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!N8N_WEBHOOK_URL) {
      return NextResponse.json(
        { success: false, error: 'N8N_AD_COPY_WEBHOOK_URL is not configured' },
        { status: 500 }
      )
    }

    const n8nRes = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!n8nRes.ok) {
      const err = await n8nRes.text()
      console.error('[ad-copy-agent] n8n error:', err)
      return NextResponse.json(
        { success: false, error: 'n8n webhook failed', detail: err },
        { status: 502 }
      )
    }

    const data = await n8nRes.json()
    return NextResponse.json({ success: true, ...data })

  } catch (err) {
    console.error('[ad-copy-agent] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
