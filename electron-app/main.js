const { app, BrowserWindow } = require("electron");
const http = require("http");
const fs = require("fs");
const path = require("path");

let mainWindow;
let server;

const PORT = 4173;

// 打包后文件在 resources/extra/，开发时在项目根目录 ../
const ROOT = app.isPackaged
  ? path.join(process.resourcesPath, "extra")
  : path.join(__dirname, "..");

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
  ".woff2": "font/woff2",
};

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function chatEndpoint(base) {
  const clean = String(base || "https://api.openai.com/v1").replace(/\/+$/, "");
  return /\/chat\/completions$/i.test(clean) ? clean : `${clean}/chat/completions`;
}

async function proxyChat(req, res) {
  const MAX = 16 * 1024 * 1024;
  let total = 0;
  const chunks = [];
  req.on("data", (c) => { total += c.length; if (total <= MAX) chunks.push(c); });
  req.on("end", async () => {
    if (total > MAX) return sendJson(res, 413, { error: "内容过大" });
    try {
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      const endpoint = new URL(chatEndpoint(body.apiBase));
      if (!["http:", "https:"].includes(endpoint.protocol)) throw new Error("API 地址错误");
      if (!body.model || !Array.isArray(body.messages)) throw new Error("缺少模型或消息");
      const headers = { "Content-Type": "application/json" };
      if (body.apiKey) headers.Authorization = `Bearer ${body.apiKey}`;
      const upstream = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ model: body.model, messages: body.messages }),
      });
      const text = await upstream.text();
      res.writeHead(upstream.status, { "Content-Type": upstream.headers.get("content-type") || "application/json" });
      res.end(text);
    } catch (e) {
      sendJson(res, 502, { error: e.message || "API 转发失败" });
    }
  });
}

function serveFile(req, res) {
  const url = new URL(req.url, "http://127.0.0.1");
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { pathname = "/"; }
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.join(ROOT, pathname);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end("Forbidden"); return; }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404); res.end("Not found"); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });
}

function startServer() {
  return new Promise((resolve) => {
    server = http.createServer((req, res) => {
      if (req.method === "POST" && req.url === "/api/chat") proxyChat(req, res);
      else if (req.method === "GET" || req.method === "HEAD") serveFile(req, res);
      else { res.writeHead(405); res.end(); }
    });
    server.listen(PORT, "127.0.0.1", () => {
      console.log(`麦芽雅思农场已启动：http://127.0.0.1:${PORT}`);
      resolve();
    });
  });
}

async function createWindow() {
  await startServer();
  mainWindow = new BrowserWindow({
    width: 1200, height: 800, minWidth: 800, minHeight: 600,
    title: "Camil&Tieria · 雅思农场助手",
    webPreferences: { preload: path.join(__dirname, "preload.js"), nodeIntegration: false, contextIsolation: true },
  });
  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => { if (server) server.close(); if (process.platform !== "darwin") app.quit(); });
app.on("before-quit", () => { if (server) server.close(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
