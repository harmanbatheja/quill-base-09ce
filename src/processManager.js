const { spawn } = require("child_process");
const crypto = require("crypto");

/** @type {Map<string, { id: string, name: string, command: string, pid: number, startedAt: string, status: string }>} */
const tracked = new Map();

function listProcesses() {
  return Array.from(tracked.values()).sort((a, b) =>
    a.startedAt < b.startedAt ? 1 : -1
  );
}

function startDemoProcess(name = "demo-worker") {
  const id = crypto.randomBytes(4).toString("hex");
  const label = String(name || "demo-worker").slice(0, 64);
  // Long-lived no-op child so the UI can demonstrate safe shutdown
  const child = spawn(
    process.execPath,
    ["-e", "setInterval(() => {}, 60000); process.title = 'quill-demo-worker';"],
    { stdio: "ignore", detached: false }
  );
  const record = {
    id,
    name: label,
    command: "quill-demo-worker",
    pid: child.pid,
    startedAt: new Date().toISOString(),
    status: "running",
  };
  tracked.set(id, record);
  child.on("exit", () => {
    const current = tracked.get(id);
    if (current) {
      current.status = "exited";
      tracked.set(id, current);
    }
  });
  return record;
}

function killProcess(id, { confirmed, savedToPasswordManager } = {}) {
  if (!confirmed || !savedToPasswordManager) {
    const err = new Error(
      "Confirm you reviewed the env file and saved secrets to your password manager before killing processes."
    );
    err.code = "CONFIRMATION_REQUIRED";
    throw err;
  }
  const record = tracked.get(id);
  if (!record) {
    const err = new Error("Process not found");
    err.code = "NOT_FOUND";
    throw err;
  }
  if (record.status !== "running") {
    return record;
  }
  try {
    process.kill(record.pid, "SIGTERM");
  } catch (e) {
    if (e && e.code !== "ESRCH") throw e;
  }
  record.status = "killed";
  tracked.set(id, record);
  return record;
}

function killAll({ confirmed, savedToPasswordManager } = {}) {
  if (!confirmed || !savedToPasswordManager) {
    const err = new Error(
      "Confirm you reviewed the env file and saved secrets to your password manager before killing processes."
    );
    err.code = "CONFIRMATION_REQUIRED";
    throw err;
  }
  const results = [];
  for (const id of tracked.keys()) {
    results.push(killProcess(id, { confirmed: true, savedToPasswordManager: true }));
  }
  return results;
}

module.exports = { listProcesses, startDemoProcess, killProcess, killAll };
