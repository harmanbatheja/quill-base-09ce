const http = require("http");
const { ensureEnvFile, readEnv, writeEnv } = require("./envStore");
const {
  listProcesses,
  startDemoProcess,
  killProcess,
  killAll,
} = require("./processManager");
const { renderPage } = require("./page");

const port = Number(process.env.PORT || 3000);

ensureEnvFile();

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(Object.assign(new Error("Invalid JSON body"), { code: "BAD_JSON" }));
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  const { pathname } = url;
  const method = req.method || "GET";

  try {
    if (pathname === "/health") {
      return sendJson(res, 200, { ok: true });
    }

    if (pathname === "/api/env" && method === "GET") {
      return sendJson(res, 200, readEnv());
    }

    if (pathname === "/api/env" && method === "PUT") {
      const body = await readBody(req);
      if (typeof body.content !== "string") {
        return sendJson(res, 400, { error: "content string required" });
      }
      return sendJson(res, 200, writeEnv(body.content));
    }

    if (pathname === "/api/processes" && method === "GET") {
      return sendJson(res, 200, { processes: listProcesses() });
    }

    if (pathname === "/api/processes" && method === "POST") {
      const body = await readBody(req);
      const proc = startDemoProcess(body.name);
      return sendJson(res, 201, { process: proc });
    }

    if (pathname === "/api/processes/kill-all" && method === "POST") {
      const body = await readBody(req);
      const results = killAll({
        confirmed: Boolean(body.confirmed),
        savedToPasswordManager: Boolean(body.savedToPasswordManager),
      });
      return sendJson(res, 200, { processes: results });
    }

    if (pathname.startsWith("/api/processes/") && method === "DELETE") {
      const id = pathname.slice("/api/processes/".length);
      const body = await readBody(req);
      const proc = killProcess(id, {
        confirmed: Boolean(body.confirmed),
        savedToPasswordManager: Boolean(body.savedToPasswordManager),
      });
      return sendJson(res, 200, { process: proc });
    }

    if (pathname === "/" && method === "GET") {
      const env = readEnv();
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(renderPage(env));
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (err) {
    const code = err && err.code;
    if (code === "CONFIRMATION_REQUIRED") {
      return sendJson(res, 403, { error: err.message, code });
    }
    if (code === "NOT_FOUND") {
      return sendJson(res, 404, { error: err.message, code });
    }
    if (code === "BAD_JSON") {
      return sendJson(res, 400, { error: err.message, code });
    }
    console.error(err);
    sendJson(res, 500, { error: "Internal server error" });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log("listening on :" + port);
  console.log("env file:", readEnv().path);
});
