#!/bin/zsh
set -eu

task_root="$(cd -- "$(dirname -- "$0")/.." && pwd)"
runtime="$task_root/work/ledfx-runtime"

cd "$task_root"
printf 'Starting LedFx. Keep this window open while using music lighting.\n'

exec "$runtime/venv/bin/ledfx" \
  --config "$runtime/config" \
  --host YOUR_LOOPBACK_IP --port 8888 \
  --offline --no-tray --open-ui
