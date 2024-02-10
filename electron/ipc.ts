import {
  desktopCapturer,
  ipcMain,
  screen,
} from 'electron'
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
}
