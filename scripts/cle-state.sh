#!/usr/bin/env bash
# CLE State Manager v1 — Issue별 진행 상태 관리
# Usage: cle-state.sh <action> <issue_number> [data]
# Actions: init, update, get, checkpoint

set -euo pipefail

STATE_DIR="${CLE_STATE_DIR:-$HOME/.openclaw/workspace/cle-state}"
mkdir -p "$STATE_DIR"

ACTION="${1:?Usage: cle-state.sh <action> <issue_number> [data]}"
ISSUE="${2:?Issue number required}"
STATE_FILE="$STATE_DIR/cle-$ISSUE.json"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

init() {
  if [ -f "$STATE_FILE" ]; then
    echo "State already exists for #$ISSUE"
    cat "$STATE_FILE"
    return
  fi
  cat > "$STATE_FILE" << EOF
{
  "issue": "$ISSUE",
  "status": "detected",
  "phase": "parse",
  "created_at": "$TIMESTAMP",
  "updated_at": "$TIMESTAMP",
  "attempts": 0,
  "max_attempts": 3,
  "artifacts": [],
  "errors": [],
  "checkpoints": [],
  "next_step": "parse_issue"
}
EOF
  echo "Initialized state for #$ISSUE"
}

update() {
  local key="$3"
  local value="$4"
  python3 -c "
import json, sys, datetime
with open('$STATE_FILE', 'r') as f:
    state = json.load(f)
state['$key'] = json.loads('''$value''') if isinstance('''$value''', str) and '''$value'''.startswith('[') or '''$value'''.startswith('{') else '$value'
state['updated_at'] = '$TIMESTAMP'
with open('$STATE_FILE', 'w') as f:
    json.dump(state, f, ensure_ascii=False, indent=2)
"
  echo "Updated $key for #$ISSUE"
}

checkpoint() {
  local cp_name="$3"
  local cp_data="${4:-}"
  python3 -c "
import json
with open('$STATE_FILE', 'r') as f:
    state = json.load(f)
state['checkpoints'].append({
    'name': '$cp_name',
    'timestamp': '$TIMESTAMP',
    'data': json.loads('''$cp_data''') if '''$cp_data''' else {}
})
state['updated_at'] = '$TIMESTAMP'
with open('$STATE_FILE', 'w') as f:
    json.dump(state, f, ensure_ascii=False, indent=2)
"
  echo "Checkpoint '$cp_name' added for #$ISSUE"
}

error() {
  local err_msg="$3"
  python3 -c "
import json
with open('$STATE_FILE', 'r') as f:
    state = json.load(f)
state['errors'].append({'message': '$err_msg', 'timestamp': '$TIMESTAMP'})
state['attempts'] = state.get('attempts', 0) + 1
state['updated_at'] = '$TIMESTAMP'
with open('$STATE_FILE', 'w') as f:
    json.dump(state, f, ensure_ascii=False, indent=2)
"
  echo "Error logged for #$ISSUE: $err_msg"
}

get() {
  if [ -f "$STATE_FILE" ]; then
    cat "$STATE_FILE"
  else
    echo '{"error":"no_state","issue":"'$ISSUE'"}'
  fi
}

case "$ACTION" in
  init) init ;;
  update) update "$@" ;;
  checkpoint) checkpoint "$@" ;;
  error) error "$@" ;;
  get) get ;;
  *) echo "Unknown action: $ACTION"; exit 1 ;;
esac
