#!/bin/sh
PORT=8080
ROOT="$(cd "$(dirname "$0")" && pwd)"

# kill any previous instance on this port
lsof -ti tcp:$PORT | xargs kill -9 2>/dev/null

echo "Serving $ROOT on http://localhost:$PORT"
echo "Press Ctrl-C to stop."

# open browser after a short delay so the server is up
(sleep 0.4 && open "http://localhost:$PORT") &

cd "$ROOT" && python3 -m http.server $PORT
