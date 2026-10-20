#!/usr/bin/env bash
# One-time setup for previewing the site locally from WSL Ubuntu.
# WSL, because Gemfile.lock only lists Linux/macOS platforms - Windows Ruby would rewrite it.
# Re-running is safe: every step skips what is already there.
set -euo pipefail

cd "$(dirname "$0")/docs"

deps=(git curl rsync build-essential libssl-dev libyaml-dev zlib1g-dev libffi-dev)
missing=()
for p in "${deps[@]}"; do
    dpkg -s "$p" >/dev/null 2>&1 || missing+=("$p")
done
if [ ${#missing[@]} -gt 0 ]; then
    echo "Installing build dependencies: ${missing[*]}"
    sudo apt-get update
    sudo apt-get install -y "${missing[@]}"
fi

if [ ! -d "$HOME/.rbenv" ]; then
    git clone --depth 1 https://github.com/rbenv/rbenv.git "$HOME/.rbenv"
fi
if [ ! -d "$HOME/.rbenv/plugins/ruby-build" ]; then
    git clone --depth 1 https://github.com/rbenv/ruby-build.git "$HOME/.rbenv/plugins/ruby-build"
else
    git -C "$HOME/.rbenv/plugins/ruby-build" pull --ff-only --quiet
fi
if ! grep -q 'rbenv init' "$HOME/.bashrc"; then
    printf '\neval "$(~/.rbenv/bin/rbenv init - bash)"\n' >> "$HOME/.bashrc"
fi

export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init - bash)"

# Reads docs/.ruby-version, so a version bump there needs only a re-run.
rbenv install -s

bundler_version=$(awk '/^BUNDLED WITH/ { getline; gsub(/ /, ""); print }' Gemfile.lock)
gem list -i bundler -v "$bundler_version" >/dev/null || gem install bundler -v "$bundler_version"
rbenv rehash

# Frozen: never let a local install rewrite the lockfile GitHub Pages builds from.
BUNDLE_FROZEN=true bundle install

echo "Setup done. Run ./serve.sh (WSL) or serve.cmd (Windows)."
