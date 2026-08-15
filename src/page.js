function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPage(env) {
  const secretsRows = env.secrets
    .map(
      (s) => `<tr data-key="${escapeHtml(s.key)}">
      <td><code>${escapeHtml(s.key)}</code></td>
      <td><code class="secret-value">${escapeHtml(s.value)}</code></td>
      <td><button type="button" class="ghost copy-one" data-key="${escapeHtml(s.key)}" data-value="${escapeHtml(s.value)}">Copy</button></td>
    </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Quill EnvGuard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg0: #0f1c18;
      --bg1: #163028;
      --ink: #e8f2ec;
      --muted: #9bb5a8;
      --line: rgba(232, 242, 236, 0.14);
      --accent: #7dcea0;
      --warn: #f0c674;
      --danger: #e07a6b;
      --panel: rgba(12, 24, 20, 0.72);
      --radius: 14px;
      font-family: "IBM Plex Sans", sans-serif;
      color-scheme: dark;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      color: var(--ink);
      background:
        radial-gradient(1200px 600px at 10% -10%, #245c48 0%, transparent 55%),
        radial-gradient(900px 500px at 100% 0%, #3a4d2e 0%, transparent 50%),
        linear-gradient(165deg, var(--bg0), var(--bg1));
    }
    .wrap {
      width: min(920px, 94vw);
      margin: 0 auto;
      padding: 2.5rem 0 4rem;
    }
    header h1 {
      font-family: Fraunces, Georgia, serif;
      font-weight: 700;
      font-size: clamp(2rem, 5vw, 3rem);
      margin: 0 0 0.4rem;
      letter-spacing: -0.02em;
    }
    header p {
      margin: 0;
      color: var(--muted);
      max-width: 42rem;
      line-height: 1.5;
    }
    .panel {
      margin-top: 1.5rem;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 1.1rem 1.2rem;
      backdrop-filter: blur(8px);
    }
    .panel h2 {
      margin: 0 0 0.75rem;
      font-size: 0.95rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 600;
    }
    .path {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.9rem;
      word-break: break-all;
    }
    .path span {
      color: var(--warn);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.92rem;
    }
    th, td {
      text-align: left;
      padding: 0.55rem 0.35rem;
      border-bottom: 1px solid var(--line);
      vertical-align: top;
    }
    th { color: var(--muted); font-weight: 500; }
    code {
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.85rem;
    }
    .secret-value { color: var(--warn); }
    textarea {
      width: 100%;
      min-height: 11rem;
      resize: vertical;
      background: #0a1411;
      color: var(--ink);
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 0.85rem;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.85rem;
      line-height: 1.45;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      margin-top: 0.85rem;
      align-items: center;
    }
    button, .btn {
      appearance: none;
      border: 1px solid var(--line);
      background: #1c3a30;
      color: var(--ink);
      border-radius: 999px;
      padding: 0.55rem 1rem;
      font: 500 0.9rem/1 "IBM Plex Sans", sans-serif;
      cursor: pointer;
    }
    button:hover { border-color: var(--accent); }
    button.primary {
      background: var(--accent);
      color: #0d1a15;
      border-color: transparent;
    }
    button.danger {
      background: transparent;
      border-color: var(--danger);
      color: var(--danger);
    }
    button.ghost {
      background: transparent;
      padding: 0.35rem 0.7rem;
    }
    button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .check {
      display: flex;
      gap: 0.55rem;
      align-items: flex-start;
      color: var(--muted);
      font-size: 0.92rem;
      line-height: 1.4;
    }
    .check input { margin-top: 0.2rem; }
    .status {
      min-height: 1.25rem;
      margin-top: 0.75rem;
      color: var(--accent);
      font-size: 0.88rem;
    }
    .status.err { color: var(--danger); }
    #process-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    #process-list li {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: center;
      padding: 0.55rem 0;
      border-bottom: 1px solid var(--line);
      font-size: 0.9rem;
    }
    .meta { color: var(--muted); font-family: "IBM Plex Mono", monospace; font-size: 0.8rem; }
    .empty { color: var(--muted); font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>Quill EnvGuard</h1>
      <p>Review the env file location and secrets first. Copy them into your password manager, then stop processes safely.</p>
    </header>

    <section class="panel" aria-labelledby="loc-title">
      <h2 id="loc-title">Env file location</h2>
      <div class="path">
        <span id="env-path">${escapeHtml(env.path)}</span>
        <button type="button" class="ghost" id="copy-path">Copy path</button>
      </div>
      <p class="meta" style="margin:0.6rem 0 0">Updated ${escapeHtml(env.updatedAt)}</p>
    </section>

    <section class="panel" aria-labelledby="secrets-title">
      <h2 id="secrets-title">Env contents for password manager</h2>
      <table>
        <thead><tr><th>Key</th><th>Value</th><th></th></tr></thead>
        <tbody id="secrets-body">${secretsRows || `<tr><td colspan="3" class="empty">No key/value pairs yet.</td></tr>`}</tbody>
      </table>
      <div class="row">
        <button type="button" class="primary" id="copy-all">Copy all secrets</button>
        <button type="button" id="copy-raw">Copy raw .env</button>
      </div>
    </section>

    <section class="panel" aria-labelledby="edit-title">
      <h2 id="edit-title">Raw .env</h2>
      <textarea id="env-editor" spellcheck="false">${escapeHtml(env.content)}</textarea>
      <div class="row">
        <button type="button" class="primary" id="save-env">Save env file</button>
        <button type="button" id="reload-env">Reload</button>
      </div>
      <div class="status" id="env-status" role="status"></div>
    </section>

    <section class="panel" aria-labelledby="proc-title">
      <h2 id="proc-title">Processes</h2>
      <p class="empty" style="margin:0 0 0.75rem">Kill is blocked until you confirm secrets were saved to your password manager.</p>
      <label class="check">
        <input type="checkbox" id="saved-check" />
        <span>I saved the env file contents to my password manager</span>
      </label>
      <label class="check" style="margin-top:0.55rem">
        <input type="checkbox" id="confirm-check" />
        <span>I reviewed the env path and contents above — ready to kill processes</span>
      </label>
      <div class="row">
        <button type="button" id="start-demo">Start demo process</button>
        <button type="button" class="danger" id="kill-all" disabled>Kill all processes</button>
      </div>
      <ul id="process-list"><li class="empty">No tracked processes yet.</li></ul>
      <div class="status" id="proc-status" role="status"></div>
    </section>
  </div>
  <script>
    const envStatus = document.getElementById("env-status");
    const procStatus = document.getElementById("proc-status");
    const savedCheck = document.getElementById("saved-check");
    const confirmCheck = document.getElementById("confirm-check");
    const killAllBtn = document.getElementById("kill-all");

    function setStatus(el, msg, isErr) {
      el.textContent = msg || "";
      el.classList.toggle("err", Boolean(isErr));
    }

    async function copyText(text) {
      await navigator.clipboard.writeText(text);
    }

    function gate() {
      const ok = savedCheck.checked && confirmCheck.checked;
      killAllBtn.disabled = !ok;
      document.querySelectorAll(".kill-one").forEach((b) => { b.disabled = !ok; });
      return ok;
    }
    savedCheck.addEventListener("change", gate);
    confirmCheck.addEventListener("change", gate);

    document.getElementById("copy-path").onclick = async () => {
      await copyText(document.getElementById("env-path").textContent);
      setStatus(envStatus, "Env path copied.");
    };

    document.getElementById("copy-all").onclick = async () => {
      const res = await fetch("/api/env");
      const data = await res.json();
      const blob = data.secrets.map((s) => s.key + "=" + s.value).join("\\n");
      await copyText(blob);
      setStatus(envStatus, "All secrets copied — paste into your password manager.");
    };

    document.getElementById("copy-raw").onclick = async () => {
      await copyText(document.getElementById("env-editor").value);
      setStatus(envStatus, "Raw .env copied.");
    };

    document.getElementById("secrets-body").addEventListener("click", async (e) => {
      const btn = e.target.closest(".copy-one");
      if (!btn) return;
      await copyText(btn.dataset.key + "=" + btn.dataset.value);
      setStatus(envStatus, "Copied " + btn.dataset.key + " for password manager.");
    });

    async function refreshEnv() {
      const res = await fetch("/api/env");
      const data = await res.json();
      document.getElementById("env-path").textContent = data.path;
      document.getElementById("env-editor").value = data.content;
      const body = document.getElementById("secrets-body");
      if (!data.secrets.length) {
        body.innerHTML = '<tr><td colspan="3" class="empty">No key/value pairs yet.</td></tr>';
      } else {
        body.innerHTML = data.secrets.map((s) =>
          '<tr><td><code>' + s.key + '</code></td><td><code class="secret-value">' + s.value +
          '</code></td><td><button type="button" class="ghost copy-one" data-key="' + s.key +
          '" data-value="' + s.value + '">Copy</button></td></tr>'
        ).join("");
      }
    }

    document.getElementById("reload-env").onclick = async () => {
      await refreshEnv();
      setStatus(envStatus, "Reloaded from disk.");
    };

    document.getElementById("save-env").onclick = async () => {
      const content = document.getElementById("env-editor").value;
      const res = await fetch("/api/env", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        setStatus(envStatus, "Save failed.", true);
        return;
      }
      await refreshEnv();
      setStatus(envStatus, "Env file saved.");
    };

    function renderProcesses(processes) {
      const list = document.getElementById("process-list");
      if (!processes.length) {
        list.innerHTML = '<li class="empty">No tracked processes yet.</li>';
        return;
      }
      list.innerHTML = processes.map((p) =>
        '<li><div><strong>' + p.name + '</strong> <span class="meta">pid ' + p.pid +
        ' · ' + p.status + '</span></div>' +
        (p.status === "running"
          ? '<button type="button" class="danger kill-one" data-id="' + p.id + '" ' +
            (gate() ? "" : "disabled") + ">Kill</button>"
          : '<span class="meta">done</span>') +
        "</li>"
      ).join("");
    }

    async function refreshProcesses() {
      const res = await fetch("/api/processes");
      const data = await res.json();
      renderProcesses(data.processes || []);
    }

    document.getElementById("start-demo").onclick = async () => {
      const res = await fetch("/api/processes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "demo-worker" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(procStatus, data.error || "Failed to start", true);
        return;
      }
      setStatus(procStatus, "Started demo process pid " + data.process.pid);
      await refreshProcesses();
    };

    document.getElementById("process-list").addEventListener("click", async (e) => {
      const btn = e.target.closest(".kill-one");
      if (!btn) return;
      if (!gate()) {
        setStatus(procStatus, "Save env to your password manager and confirm first.", true);
        return;
      }
      const res = await fetch("/api/processes/" + btn.dataset.id, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: true, savedToPasswordManager: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(procStatus, data.error || "Kill failed", true);
        return;
      }
      setStatus(procStatus, "Killed process " + data.process.pid);
      await refreshProcesses();
    });

    killAllBtn.onclick = async () => {
      if (!gate()) return;
      const res = await fetch("/api/processes/kill-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: true, savedToPasswordManager: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(procStatus, data.error || "Kill all failed", true);
        return;
      }
      setStatus(procStatus, "All processes stopped.");
      await refreshProcesses();
    };

    refreshProcesses();
  </script>
</body>
</html>`;
}

module.exports = { renderPage };
