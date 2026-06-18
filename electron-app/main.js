const { app, BrowserWindow } = require("electron");
const path = require("path");
const { fork } = require("child_process");

let mainWindow;
let serverProcess;

function startServer() {
  return new Promise((resolve) => {
    const serverPath = path.join(__dirname, "..", "server.js");
    serverProcess = fork(serverPath, [], {
      env: { ...process.env, PORT: "4173" },
      stdio: "pipe",
      silent: true,
    });

    serverProcess.stdout.on("data", (data) => {
      if (data.toString().includes("已启动")) resolve();
    });

    setTimeout(resolve, 2000);
  });
}

async function createWindow() {
  await startServer();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "Camil&Tieria · 雅思农场助手",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL("http://127.0.0.1:4173");
  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (serverProcess) serverProcess.kill();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
