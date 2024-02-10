import { BrowserWindow, globalShortcut } from 'electron'
import path from 'node:path'

export const wins: { [key in 'main' | 'screenshot']?: BrowserWindow } = {}

function createMainWin() {
  if (!wins.main) {
    wins.main = new BrowserWindow({
      title: '截图-DEMO',
      icon: path.join(process.env.VITE_PUBLIC, 'logo.svg'),
      width: 300,
      height: 200,
      webPreferences: {
        preload: path.join(__dirname, 'preload.mjs'),
        // 开启在 preload 可以随意给渲染进程 window 对象挂载属性，兼顾 api 能力与安全
        contextIsolation: false,
        // 允许 Ajax 跨域
        webSecurity: false,
      },
    })

    const html = 'index.html'

    if (process.env.VITE_DEV_SERVER_URL) {
      wins.main.loadURL(process.env.VITE_DEV_SERVER_URL + html)
      // wins.main.webContents.openDevTools()
    } else {
      wins.main.loadFile(path.join(process.env.DIST, html))
    }
  }

  return wins.main
}

function createScreenshotWin() {
  if (!wins.screenshot) {
    wins.screenshot = new BrowserWindow({
      autoHideMenuBar: true, // 自动隐藏菜单栏
      useContentSize: true, // width 和 height 将设置为 web 页面的尺寸
      movable: false, // 是否可移动
      frame: false, // 无边框窗口
      resizable: false, // 窗口大小是否可调整
      hasShadow: false, // 窗口是否有阴影
      transparent: true, // 使窗口透明
      fullscreenable: true, // 窗口是否可以进入全屏状态
      fullscreen: true, // 窗口是否全屏
      simpleFullscreen: true, // 在 macOS 上使用 pre-Lion 全屏
      alwaysOnTop: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.mjs'),
        // 开启在 preload 可以随意给渲染进程 window 对象挂载属性，兼顾 api 能力与安全
        contextIsolation: false,
        // 允许 Ajax 跨域
        webSecurity: false,
      },
    })

    const html = 'screenshot.html'

    if (process.env.VITE_DEV_SERVER_URL) {
      wins.screenshot.loadURL(process.env.VITE_DEV_SERVER_URL + html)
      wins.screenshot.webContents.openDevTools()
    } else {
      wins.screenshot.loadFile(path.join(process.env.DIST, html))
    }
  }

  return wins.screenshot
}

export const helper = {
  openMainWin() {
    createMainWin().show()
  },
  closeMainWin() {
    createMainWin().hide()
    // TODO: 刷新页面 - reload
  },
  openScreenshotWin() {
    createScreenshotWin().show()
  },
  closeScreenshotWin() {
    createScreenshotWin().hide()
    // TODO: 刷新页面 - reload
  },

  closeScreenshotWin_openMainWin() {
    helper.closeScreenshotWin()
    helper.openMainWin()
  },
  closeMainWin_openScreenshotWin() {
    helper.closeMainWin()
    helper.openScreenshotWin()
  },
}

// --------------

const screenshot = 'CommandOrControl+Shift+S'
const screenshotEsc = 'Esc'

export function initWinShortcut() {
  globalShortcut.register(screenshot, () => {
    openScreenshotWinWithEsc()
  })
}

export function openScreenshotWinWithEsc() {
  globalShortcut.register(screenshotEsc, () => {
    globalShortcut.unregister(screenshotEsc)
    helper.closeScreenshotWin_openMainWin()
  })
  helper.closeMainWin_openScreenshotWin()
}
