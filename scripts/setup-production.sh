#!/usr/bin/env bash
# One-shot production setup for Movo (Supabase + optional GitHub CI push)
#
# Required:
#   SUPABASE_ACCESS_TOKEN  → https://supabase.com/dashboard/account/tokens
#
# Optional (GitHub CI workflow push):
#   GITHUB_TOKEN with `workflow` scope (or `gh auth login` with workflow scope)
#
# Usage:
#   export SUPABASE_ACCESS_TOKEN="sbp_..."
#   ./scripts/setup-production.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_REF="${SUPABASE_PROJECT_REF:-amqvdxbgmpfzymgfqoou}"
SITE_URL="${MOVO_SITE_URL:-https://movo-mauve.vercel.app}"
API="https://api.supabase.com/v1/projects/${PROJECT_REF}"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "❌ SUPABASE_ACCESS_TOKEN 가 필요합니다."
  echo "   https://supabase.com/dashboard/account/tokens 에서 발급 후:"
  echo "   export SUPABASE_ACCESS_TOKEN=\"sbp_...\""
  exit 1
fi

run_sql_file() {
  local file="$1"
  local name="$2"
  echo "▶ SQL: ${name}"
  python3 - <<PY
import json, pathlib, sys, urllib.request

token = "${SUPABASE_ACCESS_TOKEN}"
ref = "${PROJECT_REF}"
query = pathlib.Path("${file}").read_text()
body = json.dumps({"query": query}).encode()
req = urllib.request.Request(
    f"https://api.supabase.com/v1/projects/{ref}/database/query",
    data=body,
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    },
    method="POST",
)
try:
    with urllib.request.urlopen(req) as resp:
        print(f"   ✅ OK ({resp.status})")
except urllib.error.HTTPError as e:
    print(f"   ❌ HTTP {e.code}: {e.read().decode()}", file=sys.stderr)
    sys.exit(1)
PY
}

patch_auth() {
  echo "▶ Auth: site_url + redirect URLs"
  python3 - <<PY
import json, urllib.request, sys

token = "${SUPABASE_ACCESS_TOKEN}"
ref = "${PROJECT_REF}"
site = "${SITE_URL}"
payload = {
    "site_url": site,
    "uri_allow_list": f"{site}/**,http://localhost:3000/**",
}
body = json.dumps(payload).encode()
req = urllib.request.Request(
    f"https://api.supabase.com/v1/projects/{ref}/config/auth",
    data=body,
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    },
    method="PATCH",
)
try:
    with urllib.request.urlopen(req) as resp:
        print(f"   ✅ OK ({resp.status})")
        print(f"   site_url = {site}")
except urllib.error.HTTPError as e:
    print(f"   ❌ HTTP {e.code}: {e.read().decode()}", file=sys.stderr)
    sys.exit(1)
PY
}

echo "Movo production setup"
echo "Project: ${PROJECT_REF}"
echo "Site:    ${SITE_URL}"
echo

run_sql_file "${ROOT}/supabase/migrations/003_production_foundation.sql" "003_production_foundation"
run_sql_file "${ROOT}/supabase/migrations/004_storage_private.sql" "004_storage_private"
run_sql_file "${ROOT}/supabase/migrations/005_enable_realtime_messages.sql" "005_enable_realtime_messages"
run_sql_file "${ROOT}/supabase/migrations/006_member_schedule_request.sql" "006_member_schedule_request"
patch_auth

echo
echo "✅ Supabase 설정 완료"
echo
echo "GitHub CI workflow push (선택):"

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  cd "${ROOT}"
  git add .github/workflows/ci.yml
  if git diff --cached --quiet; then
    echo "   CI workflow 이미 커밋됨"
  else
    git commit -m "Add GitHub Actions CI workflow"
    git push origin main && echo "   ✅ CI workflow push 완료" || echo "   ❌ push 실패 — PAT에 workflow scope 필요"
  fi
else
  echo "   gh CLI 로그인 후 다시 실행하거나,"
  echo "   GitHub → Settings → Developer settings → PAT 에 workflow scope 추가 후:"
  echo "   git add .github/workflows/ci.yml && git commit -m 'Add CI' && git push"
fi
