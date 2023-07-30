// // main.js
// const { app, BrowserWindow } = require('electron');

// let win;

// function createWindow() {
//   win = new BrowserWindow({
//     webPreferences: {
//       nodeIntegration: true // Permite usar o Node.js no contexto da janela do Electron.
//     }
//   });

//   win.loadURL(`file://${__dirname}/dist/finance-web-app/index.html`); // Carrega a página Angular no Electron.
//   win.removeMenu();
//   win.on('closed', () => {
//     win = null;
//   });
//   win.maximize();
// }

// app.on('ready', createWindow);

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// app.on('activate', () => {
//   if (win === null) {
//     createWindow();
//   }
// });
const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'dist', 'index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
