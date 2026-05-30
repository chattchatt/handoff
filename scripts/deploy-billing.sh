#!/usr/bin/env bash
# One-shot Polar billing deploy for Handoff.
# Sets the Supabase Edge Function secrets and deploys the 3 billing functions.
# Secrets are prompted for at runtime (never stored on disk, never printed),
# so nothing sensitive lands in the repo, shell history, or anywhere shared.
#
# Prereqs (one-time): Supabase CLI installed + `supabase link` already done
# (both confirmed for this repo), and the two Polar products created so you have
# their Product IDs.
#
# Usage:  bash scripts/deploy-billing.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== Handoff · Polar billing deploy =="

# Supabase CLI auth without the interactive `supabase login`:
# generate a token at https://supabase.com/dashboard/account/tokens
if [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  read -rsp "Supabase access token (sbp_...): " SUPABASE_ACCESS_TOKEN; echo
  export SUPABASE_ACCESS_TOKEN
fi

read -rsp "Polar access token (polar_oat_...): " POLAR_ACCESS_TOKEN; echo
read -rp  "Polar server [sandbox/production] (default: sandbox): " POLAR_SERVER
POLAR_SERVER="${POLAR_SERVER:-sandbox}"
# Product IDs are not secrets. These sandbox defaults are pre-filled — press
# Enter to accept, or paste production IDs when going live.
read -rp  "Polar Pro product ID [98dff3a7-7ed4-4f69-9366-26e39ba0181a]: " POLAR_PRODUCT_PRO
POLAR_PRODUCT_PRO="${POLAR_PRODUCT_PRO:-98dff3a7-7ed4-4f69-9366-26e39ba0181a}"
read -rp  "Polar Team product ID [39e0d8a0-2ac9-4b52-b63a-a91392b62849]: " POLAR_PRODUCT_TEAM
POLAR_PRODUCT_TEAM="${POLAR_PRODUCT_TEAM:-39e0d8a0-2ac9-4b52-b63a-a91392b62849}"

if [ -z "$POLAR_ACCESS_TOKEN" ] || [ -z "$POLAR_PRODUCT_PRO" ] || [ -z "$POLAR_PRODUCT_TEAM" ]; then
  echo "ERROR: Polar access token and both product IDs are required." >&2
  exit 1
fi

echo "→ Setting secrets..."
supabase secrets set \
  POLAR_ACCESS_TOKEN="$POLAR_ACCESS_TOKEN" \
  POLAR_SERVER="$POLAR_SERVER" \
  POLAR_PRODUCT_PRO="$POLAR_PRODUCT_PRO" \
  POLAR_PRODUCT_TEAM="$POLAR_PRODUCT_TEAM"

echo "→ Deploying functions..."
supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
supabase functions deploy polar-webhook

cat <<EOF

✅ Deployed. Webhook URL to register in Polar (Settings → Webhooks, Format: Raw):

    https://lcdgboolxhajstcuaikp.supabase.co/functions/v1/polar-webhook

Events: subscription.created, subscription.active, subscription.updated,
        subscription.canceled, subscription.revoked

After creating the webhook, copy its signing secret and add it (no redeploy needed):

    SUPABASE_ACCESS_TOKEN="\$SUPABASE_ACCESS_TOKEN" supabase secrets set POLAR_WEBHOOK_SECRET="whsec_..."

Then run subscriptions.sql in the Supabase SQL Editor if you haven't yet.
EOF
