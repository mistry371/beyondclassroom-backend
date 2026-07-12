#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Beyond Classroom — backend deploy bootstrap for an Ubuntu EC2 instance.
# Run ON the server (as ubuntu):  bash setup.sh
# Idempotent: safe to re-run for updates.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR=/opt/beyondclassroom-backend
REPO="${REPO:-https://github.com/mistry371/beyondclassroom-backend.git}"
BRANCH="${BRANCH:-fix/content-access-promoter-commission-perf}"
PORT="${PORT:-5000}"

echo "== 1/6 System packages =="
sudo apt-get update -y
if ! command -v node >/dev/null || [ "$(node -v | cut -c2-3)" -lt 18 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
sudo apt-get install -y git nginx
sudo npm install -g pm2

echo "== 2/6 Fetch code =="
if [ -d "$APP_DIR/.git" ]; then
  sudo git -C "$APP_DIR" fetch --all && sudo git -C "$APP_DIR" reset --hard "origin/$BRANCH"
else
  sudo git clone -b "$BRANCH" "$REPO" "$APP_DIR"
fi
sudo chown -R "$USER":"$USER" "$APP_DIR"

echo "== 3/6 Install deps =="
cd "$APP_DIR/server"
npm ci --omit=dev || npm install --omit=dev

echo "== 4/6 Env file =="
if [ ! -f "$APP_DIR/server/.env" ]; then
  echo "!! Create $APP_DIR/server/.env from deploy/.env.production.example before starting."
  cp "$APP_DIR/deploy/.env.production.example" "$APP_DIR/server/.env"
  echo "   Edit it now:  nano $APP_DIR/server/.env"
fi

echo "== 5/6 Start with pm2 =="
pm2 start server.js --name bc-backend --update-env || pm2 restart bc-backend --update-env
pm2 save
sudo env PATH=$PATH pm2 startup systemd -u "$USER" --hp "$HOME" | tail -1 | bash || true

echo "== 6/6 nginx reverse proxy =="
sudo cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/bc-backend
sudo ln -sf /etc/nginx/sites-available/bc-backend /etc/nginx/sites-enabled/bc-backend
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Done. Health: curl http://localhost:$PORT/api/health"
echo "   Public:  curl http://<EC2_PUBLIC_IP>/api/health"
