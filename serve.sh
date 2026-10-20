#!/usr/bin/env bash
# Serves the site at http://localhost:4000 with rebuild + browser reload on every save.
# Extra arguments go to jekyll serve (e.g. --port 4001).
#
# Jekyll runs on a mirror of docs/ in the WSL home, not on /mnt/d: building ~900 MB of media
# across the Windows drive bridge takes minutes per save, and WSL2 gets no file change events
# from Windows drives. A 1 s rsync loop carries edits made in Windows over to the mirror.
set -euo pipefail

src="$(cd "$(dirname "$0")/docs" && pwd)"
mirror="$HOME/.cache/stardeus-website"

export PATH="$HOME/.rbenv/bin:$PATH"
if ! command -v rbenv >/dev/null; then
    echo "rbenv not found - run ./setup-wsl.sh first." >&2
    exit 1
fi
eval "$(rbenv init - bash)"

export BUNDLE_FROZEN=true
if ! (cd "$src" && bundle check >/dev/null 2>&1); then
    echo "Gems are missing - run ./setup-wsl.sh first." >&2
    exit 1
fi

# .jekyll-metadata is excluded both ways: the mirror keeps its own incremental state, and the
# stale copy tracked in git never reaches it (nor gets rewritten by it).
sync() {
    rsync -a --delete --itemize-changes \
        --exclude _site --exclude .jekyll-cache --exclude .jekyll-metadata \
        "$src/" "$mirror/docs/"
}

# Incremental builds do not track data files or _config.yml as dependencies (a stale codex
# search index), and jekyll serve never reloads _config.yml - so those start a fresh build.
needs_fresh_build() {
    grep -qE ' (_config\.yml|_data/)' <<<"$1"
}

jekyll_pid=""
start_jekyll() {
    (cd "$mirror/docs" && exec bundle exec jekyll serve --incremental --livereload \
        --destination "$mirror/_site" "$@") &
    jekyll_pid=$!
}
stop_jekyll() {
    if [ -n "$jekyll_pid" ]; then
        kill "$jekyll_pid" 2>/dev/null || true
        wait "$jekyll_pid" 2>/dev/null || true
        jekyll_pid=""
    fi
}
# Background jobs ignore Ctrl+C in a script, so pass it on.
trap 'stop_jekyll; exit 0' INT TERM
trap stop_jekyll EXIT

mkdir -p "$mirror/docs"
echo "Syncing docs/ to $mirror ..."
changes=$(sync)
if needs_fresh_build "$changes"; then
    rm -f "$mirror/docs/.jekyll-metadata"
fi
start_jekyll "$@"

while kill -0 "$jekyll_pid" 2>/dev/null; do
    sleep 1
    # An editor's temp file can vanish mid-pass; the next pass picks up the rest.
    changes=$(sync || true)
    if [ -n "$changes" ] && needs_fresh_build "$changes"; then
        echo "_config.yml or _data/ changed - restarting with a full build."
        stop_jekyll
        rm -f "$mirror/docs/.jekyll-metadata"
        start_jekyll "$@"
    fi
done
wait "$jekyll_pid"
