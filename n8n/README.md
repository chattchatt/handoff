# n8n — Upstage 3-API pipeline

`execution-memory-main.workflow.json` is the exported n8n workflow that powers Handoff's
real Upstage 3-API pipeline. The frontend (`src/lib/n8n.ts`) POSTs to its webhook.

## Flow
```
Webhook (multipart, binary `sourceFile` + text fields)
  → Normalize Input (base64-encode the file)
  → IF "Has File?"
       ├─ true:  Document Parse → Information Extraction → Merge Doc Context ┐
       └─ false: Text Only Path ───────────────────────────────────────────┤
  → Upstage Solar Structured Output
  → Assemble Response  (emits pipeline{documentParse,informationExtract,solar} + _error{code,message,stage})
  → Respond to Webhook
```

## Upstage APIs (one shared n8n credential: httpBearerAuth "Bearer Auth account")
- **Document Parse** — `POST /v1/document-digitization` (multipart, `model=document-parse`) → `content.text`, `usage.pages`.
- **Information Extraction** — `POST /v1/information-extraction`. Requires the document as a base64 **`image_url`** data URL (it rejects plain-text content). Returns `choices[0].message.content` as a JSON **string**.
- **Solar** — `POST /v1/chat/completions`, model **`solar-pro2`**. (solar-pro3 was too slow — >90s even with `reasoning_effort: minimal`; pro2 is fast enough for this structured transform.)

## Request / response contract
See the comment block at the top of `src/lib/n8n.ts`. The webhook receives a binary `sourceFile`
part; the response must populate the `pipeline` block with real counts and return `_error{code,message,stage}`
(`stage` ∈ documentParse | informationExtract | solar) on any node failure.

## Editing workflow (no API/MCP access)
1. Export the live workflow from n8n.cloud (⋯ → Download).
2. Edit the JSON here.
3. Re-import (overwrite) in n8n.cloud and publish.

The export contains only a **credential reference** (id + name) — never the raw API key.
The webhook path is `upflow`; keep `options: {}` so n8n auto-parses multipart and exposes the file as binary `sourceFile`.
