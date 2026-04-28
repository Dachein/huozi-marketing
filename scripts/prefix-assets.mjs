#!/usr/bin/env node
// Post-build: move `.open-next/assets/_next` under `marketing-static/` so
// the Workers ASSETS binding resolves the same paths Next.js emits in
// HTML when `assetPrefix: '/marketing-static'` is set.
//
// Run after `@opennextjs/cloudflare build`.
import { existsSync, renameSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const ASSETS_DIR = ".open-next/assets";
const SRC = join(ASSETS_DIR, "_next");
const DST = join(ASSETS_DIR, "marketing-static", "_next");

if (!existsSync(SRC)) {
  console.error(`[prefix-assets] expected ${SRC} to exist after build — did the build run?`);
  process.exit(1);
}
if (existsSync(DST)) {
  console.log(`[prefix-assets] ${DST} already exists; skipping (idempotent rerun)`);
  process.exit(0);
}

mkdirSync(dirname(DST), { recursive: true });
renameSync(SRC, DST);
console.log(`[prefix-assets] moved ${SRC} → ${DST}`);
