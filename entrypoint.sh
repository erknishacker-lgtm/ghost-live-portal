#!/bin/sh
set -e

echo "[entrypoint] running prisma migrate deploy..."
# Invoke the real script directly instead of the node_modules/.bin/prisma
# symlink — Docker's COPY dereferences that symlink into a standalone file,
# which breaks the relative path it uses to find its sibling .wasm file.
node ./node_modules/prisma/build/index.js migrate deploy

echo "[entrypoint] starting server..."
exec node server.js
