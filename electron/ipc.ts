import {
  dialog,
  desktopCapturer,
  ipcMain,
  screen,
} from 'electron'
import fs from 'node:fs'
import { getScreenSize } from './utils'
import { helper, openScreenshotWinWithEsc } from './win'

export function initIpc() {
  ipcMain.handle('get-screenshort-image', async () => {
    const { id } = screen.getPrimaryDisplay()
    const { scaleWidth, scaleHeight } = getScreenSize()
    const sources = [
      ...(await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: scaleWidth,
          height: scaleHeight,
        },
      })),
    ]

    let source = sources.filter((e: any) => parseInt(e.display_id, 10) == id)[0]
    source || (source = sources[0])
    const img = source.thumbnail.toDataURL()
    return img
  })

  ipcMain.handle('call-screenshot', async () => {
    openScreenshotWinWithEsc()
  })

  ipcMain.handle('exit-screenshot', async () => {
    helper.closeScreenshotWin_openMainWin()
  })

  ipcMain.handle('save-screenshot', async (_event, imageBase64: string) => {
    const filename = `${Date.now()}.png`
    const result = await dialog.showSaveDialog({
      title: '保存',
      defaultPath: filename,
    })
    if (!result.canceled) {
      const base64Data = imageBase64.replace(/^data:image\/png;base64,/, '')
      await fs.promises.writeFile(result.filePath!, base64Data, 'base64')
    }
  })
}
