export interface MosaicTile {
  x: number
  y: number
  color: number[]
}

export interface MosaicData {
  size: number
  tiles: MosaicTile[]
}
