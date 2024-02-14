import path from 'path'
import { app } from 'electron'
import { fileURLToPath } from 'url'
import {
  helper,
  initWinShortcut,
  wins,
} from './win'
import { initIpc } from './ipc'

globalThis.__dirname = path.dirname(fileURLToPath(import.meta.url))
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
// The built directory structure
//
// ├─┬ dist
// │ ├─┬ electron
// │ │ ├── main.js
// │ │ └── preload.js
// │ ├── index.html
// │ ├── ...other-static-files-from-public
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public')

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

app.on('window-all-closed', () => {
  for (const [key, win] of Object.entries(wins)) {
    win.closable && win.close()
    wins[key] = null
  }

  app.quit()
})

app.whenReady().then(() => {
  // 打开主窗口
  helper.openMainWin()

  // 注册快捷键
  initWinShortcut()

  // 注册 IPC
  initIpc()
})
