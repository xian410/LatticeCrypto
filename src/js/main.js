const { app, BrowserWindow } = require("electron");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 900,
    height: 750,
  });

  win.loadFile("./src/index.html");
};

app.whenReady().then(() => {
  createWindow();
});
