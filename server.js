const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 4173;
const ROOT = __dirname;
const MAX_BODY = 16 * 1024 * 1024;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}

function chatEndpoint(base) {
  const clean = String(base || "https://api.openai.com/v1").replace(/\/+$/, "");
  return /\/chat\/completions$/i.test(clean) ? clean : `${clean}/chat/completions`;
}

async function proxyChat(request, response) {
  let total = 0;
  const chunks = [];
  for await (const chunk of request) {
    total += chunk.length;
    if (total > MAX_BODY) {
      sendJson(response, 413, { error: "图片或消息内容过大" });
      return;
    }
    chunks.push(chunk);
  }

  try {
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const endpoint = new URL(chatEndpoint(body.apiBase));
    if (!["http:", "https:"].includes(endpoint.protocol)) throw new Error("API 地址必须使用 http 或 https");
    if (!body.model || !Array.isArray(body.messages)) throw new Error("缺少模型或消息内容");

    const headers = { "Content-Type": "application/json" };
    if (body.apiKey) headers.Authorization = `Bearer ${body.apiKey}`;
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ model: body.model, messages: body.messages }),
      signal: AbortSignal.timeout(120000),
    });
    const text = await upstream.text();
    response.writeHead(upstream.status, { "Content-Type": upstream.headers.get("content-type") || "application/json; charset=utf-8" });
    response.end(text);
  } catch (error) {
    sendJson(response, 502, { error: error.message || "API 转发失败" });
  }
}

function serveFile(request, response) {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { pathname = "/"; }
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.resolve(ROOT, `.${pathname}`);
  if (!filePath.startsWith(ROOT + path.sep)) {
    response.writeHead(403); response.end("Forbidden"); return;
  }
  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    const headers = { "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream" };
    if (/\.(png|jpg|jpeg|svg)$/i.test(filePath)) headers["Cache-Control"] = "public, max-age=86400";
    response.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(response);
  });
}

const server = http.createServer((request, response) => {
  if (request.method === "POST" && request.url === "/api/chat") proxyChat(request, response);
  else if (request.method === "GET" || request.method === "HEAD") serveFile(request, response);
  else { response.writeHead(405); response.end("Method not allowed"); }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`麦芽雅思农场已启动：http://127.0.0.1:${PORT}`);
});

