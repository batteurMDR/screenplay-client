const {app, BrowserWindow, ipcMain} = require('electron')
const menubar = require('menubar')
const  path = require('path')
const url = require('url')

var icons = {
  connected: 'IconTemplate.png',
  disconnected: 'IconTemplate.png'
}

let mb = menubar({
  width: 700,
  height: 300,
  index: 'file://' + path.join(__dirname, 'app.html'),
  icon: icons.disconnected,
  preloadWindow: true
})

mb.on('ready', function(){
  // mb.window.webContents.openDevTools()
  // mb.window.show();
  if (process.platform == 'win32') {
    deeplinkingUrl = process.argv.slice(1)
    mb.window.webContents.send('peerid',url.parse(deeplinkingUrl).host)
    mb.window.show();
  }
})

const PROTOCOL_PREFIX = 'estiamscreen'
let deeplinkingUrl

app.setAsDefaultProtocolClient(PROTOCOL_PREFIX)

app.on('open-url', function (event, str) {
  event.preventDefault()
  deeplinkingUrl = str
  mb.window.webContents.send('peerid',url.parse(deeplinkingUrl).host)
  mb.window.show();
})

// let winView

// function createWindowView () {
//   // mainWindow = new BrowserWindow({width: 700, height: 300})
//   // mainWindow.loadFile('app.html')

//   // // Open the DevTools.
//   // mainWindow.webContents.openDevTools()

//   // mainWindow.on('closed', function () {
//   //   mainWindow = null
//   // })
// }

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindowView()
  }
})