# n8n Workflows — AgencyOS

## content-agent.json — Content Creator Agent

Accepts a POST request with a content brief, generates 3 Thai-language Facebook/Instagram captions via Groq (Llama 3), logs the task to Supabase, and returns the captions as JSON.

### Flow

```
POST /webhook/content-agent
        │
        ▼
  Groq API (llama3-8b-8192)
        │
        ▼
  Supabase INSERT → tasks table
        │
        ▼
  JSON response → { success, captions }
```

---

## Import

1. Open your n8n instance
2. **Workflows → Import from file**
3. Select `content-agent.json`

---

## Configure credentials

Replace the two placeholder values before activating:

| Node | Header | Replace with |
|---|---|---|
| Groq API | `Authorization: Bearer GROQ_API_KEY` | Your key from [console.groq.com](https://console.groq.com) |
| Supabase Insert Task | `apikey: SUPABASE_KEY` | Your Supabase anon key |
| Supabase Insert Task | `Authorization: Bearer SUPABASE_KEY` | Same anon key |

Supabase anon key: `sb_publishable_Vp6Qp6CwmoP9eXAo7-qZTQ_or0CXSG7`

---

## Test

```bash
curl -X POST https://your-n8n-domain/webhook/content-agent \
  -H "Content-Type: application/json" \
  -d '{"brief": "โปรโมท กาแฟออร์แกนิค เชียงราย ราคา 150 บาท"}'
```

Expected response:

```json
{
  "success": true,
  "captions": "Caption 1...\n---\nCaption 2...\n---\nCaption 3..."
}
```

Each run also inserts a row into the Supabase `tasks` table, which triggers the Live Office realtime feed.
