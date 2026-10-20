[stardeusgame.com](https://stardeusgame.com)

## Local preview (Windows + WSL Ubuntu)

1. Once: `wsl -d Ubuntu --cd . -- bash ./setup-wsl.sh` (Ruby from `docs/.ruby-version`, gems from `docs/Gemfile.lock`).
2. Every time: run `serve.cmd` (or `./serve.sh` inside WSL) and open http://localhost:4000.

Edits in `docs/` rebuild and reload the browser on save. Ctrl+C stops the server.
