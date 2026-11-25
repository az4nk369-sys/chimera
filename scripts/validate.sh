#!/usr/bin/env bash
# validate.sh — dipakai hook .kiro/hooks/validate-on-save.json dan manual.
# node --check semua file JS + validasi JSON hook Kiro.
set -euo pipefail
cd "$(dirname "$0")/.."

fail=0
for f in js/*.js; do
  if ! node --check "$f"; then
    echo "FAIL: $f"
    fail=1
  fi
done

for f in .kiro/hooks/*.json; do
  if ! node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" "$f"; then
    echo "FAIL: $f (JSON tidak valid)"
    fail=1
  fi
done

if [ "$fail" -ne 0 ]; then
  echo "Validasi GAGAL"
  exit 1
fi
echo "Validasi OK: semua file JS lolos node --check, semua hook JSON valid."
