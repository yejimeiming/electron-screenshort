import { screen } from 'electron'

export function getScreenSize() {
  const { size, scaleFactor } = screen.getPrimaryDisplay()
  return {
    width: size.width,
    height: size.height,
    scaleFactor,
    scaleWidth: size.width * scaleFactor,
    scaleHeight: size.height * scaleFactor,
  }
}
