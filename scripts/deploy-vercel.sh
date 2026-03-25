#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BRANCH="${1:-main}"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required but not installed."
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required but not installed."
  exit 1
fi

if ! command -v vercel >/dev/null 2>&1 && ! command -v npx >/dev/null 2>&1; then
  echo "vercel CLI or npx is required but not installed."
  exit 1
fi

if [[ ! -d .git ]]; then
  echo "This script must be run from the project git repository."
  exit 1
fi

if [[ ! -f .vercel/project.json ]]; then
  echo "This project is not linked to Vercel. Run 'vercel link' first."
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is dirty. Commit or stash changes before deploying."
  exit 1
fi

echo "Fetching latest commits from origin..."
git fetch origin "$BRANCH"

CURRENT_BRANCH="$(git branch --show-current)"
if [[ "$CURRENT_BRANCH" != "$BRANCH" ]]; then
  echo "Checking out $BRANCH..."
  git checkout "$BRANCH"
fi

echo "Fast-forwarding to origin/$BRANCH..."
git merge --ff-only "origin/$BRANCH"

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Deploying to Vercel production..."
if command -v vercel >/dev/null 2>&1; then
  vercel deploy --prod --yes
else
  npx vercel deploy --prod --yes
fi
