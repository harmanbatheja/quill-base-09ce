const fs = require("fs");
const path = require("path");

const ENV_PATH = path.resolve(process.cwd(), ".env");

function parseEnv(raw) {
  const entries = [];
  for (const line of String(raw).split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      entries.push({ type: "comment", raw: line });
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      entries.push({ type: "raw", raw: line });
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    entries.push({ type: "pair", key, value, raw: line });
  }
  return entries;
}

function ensureEnvFile() {
  if (!fs.existsSync(ENV_PATH)) {
    const seed = `# Quill EnvGuard — save these before stopping processes
APP_NAME=quill-envguard
DATABASE_URL=postgres://quill:change-me@localhost:5432/quill
API_SECRET=sk_live_replace_with_real_secret
REDIS_URL=redis://localhost:6379/0
SESSION_SECRET=replace-with-long-random-string
`;
    fs.writeFileSync(ENV_PATH, seed, "utf8");
  }
}

function readEnv() {
  ensureEnvFile();
  const content = fs.readFileSync(ENV_PATH, "utf8");
  const entries = parseEnv(content);
  const secrets = entries
    .filter((e) => e.type === "pair")
    .map(({ key, value }) => ({ key, value }));
  return {
    path: ENV_PATH,
    exists: true,
    content,
    secrets,
    updatedAt: fs.statSync(ENV_PATH).mtime.toISOString(),
  };
}

function writeEnv(content) {
  if (typeof content !== "string") {
    throw new Error("content must be a string");
  }
  fs.writeFileSync(ENV_PATH, content, "utf8");
  return readEnv();
}

module.exports = { ENV_PATH, readEnv, writeEnv, ensureEnvFile };
