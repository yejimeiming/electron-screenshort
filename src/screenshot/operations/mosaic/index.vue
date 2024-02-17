<script setup lang="ts">
import {
  computed,
  onUnmounted,
  watch,
  ref,
} from 'vue'
import { DHistory } from '../../funcs/draw.history'
import { Canvas } from '../../screenshot-canvas/canvas'
import { Events } from '../../screenshot-canvas/events'
import { useStore } from '../../store'
import { HistoryItemType } from '../../enums'
import { MosaicData } from './types'
import { draw, getColor } from './draw'
import type { HistoryItemSource } from '../../types'
import ScreenshotButton from '../../screenshot-button/index.vue'
import ScreenshotSize from '../../screenshot-size/index.vue'

const store = useStore()
const size = ref(3)
const imageDataRef = ref<ImageData | null>(null)
const mosaicRef = ref<HistoryItemSource<MosaicData, null> | null>(null)

const checked = computed(() => store.operation === 'Mosaic')

const onSizeChange = (s: number) => {
  size.value = s
}

const selectMosaic = () => {
  store.setOperation('Mosaic')
  store.setCursor('default')
}

const onSelectMosaic = () => {
  if (checked.value) {
    return
  }
  selectMosaic()
  DHistory.clearSelect()
}

const stopMousedown = Events.on('mousedown', (e: MouseEvent) => {
  if (!checked.value || mosaicRef.value || !imageDataRef.value || !Canvas.ctx) {
    return
  }

  const rect = Canvas.ctx.canvas.getBoundingClientRect()
  const x = e.clientX - rect.x
  const y = e.clientY - rect.y
  const mosaicSize = size.value * 2
  mosaicRef.value = {
    name: 'Mosaic',
    type: HistoryItemType.Source,
    data: {
      size: mosaicSize,
      tiles: [
        {
          x,
          y,
          color: getColor(x, y, imageDataRef.value),
        }
      ]
    },
    editHistory: [],
    draw,
  }
})

const stopMousemove = Events.on('mousemove', (e: MouseEvent) => {
  if (!checked.value || !mosaicRef.value || !Canvas.ctx || !imageDataRef.value) {
    return
  }

  const rect = Canvas.ctx.canvas.getBoundingClientRect()
  const x = e.clientX - rect.x
  const y = e.clientY - rect.y

  const mosaicSize = mosaicRef.value.data.size
  const mosaicTiles = mosaicRef.value.data.tiles

  let lastTile = mosaicTiles[mosaicTiles.length - 1]

  if (!lastTile) {
    mosaicTiles.push({
      x,
      y,
      color: getColor(x, y, imageDataRef.value)
    })
  } else {
    const dx = lastTile.x - x
    const dy = lastTile.y - y
    // 减小点的个数
    let length = Math.sqrt(dx ** 2 + dy ** 2)
    const sin = -dy / length
    const cos = -dx / length

    while (length > mosaicSize) {
      const cx = Math.floor(lastTile.x + mosaicSize * cos)
      const cy = Math.floor(lastTile.y + mosaicSize * sin)
      lastTile = {
        x: cx,
        y: cy,
        color: getColor(cx, cy, imageDataRef.value)
      }
      mosaicTiles.push(lastTile)
      length -= mosaicSize
    }

    // 最后一个位置补充一块
    if (length > mosaicSize / 2) {
      mosaicTiles.push({
        x,
        y,
        color: getColor(x, y, imageDataRef.value)
      })
    }
  }

  if (DHistory.history.top !== mosaicRef.value) {
    DHistory.push(mosaicRef.value)
  } else {
    DHistory.set(DHistory.history)
  }
})

const stopMouseup = Events.on('mouseup', () => {
  if (!checked.value) {
    return
  }

  mosaicRef.value = null
})

watch(() => [
  store.width,
  store.height,
  store.bounds,
  store.image,
  checked,
], () => {
  const { bounds, image, width, height } = store
  if (!bounds || !image || !checked.value) {
    return
  }

  const $canvas = document.createElement('canvas')

  const canvasContext = $canvas.getContext('2d')

  if (!canvasContext) {
    return
  }

  $canvas.width = bounds.width
  $canvas.height = bounds.height

  const rx = image.naturalWidth / width
  const ry = image.naturalHeight / height

  canvasContext.drawImage(
    image,
    bounds.x * rx,
    bounds.y * ry,
    bounds.width * rx,
    bounds.height * ry,
    0,
    0,
    bounds.width,
    bounds.height,
  )

  // imageDataRef.value = canvasContext.getImageData(0, 0, bounds.width, bounds.height)
})

onUnmounted(() => {
  stopMousedown()
  stopMousemove()
  stopMouseup()
})
</script>

<template>
  <ScreenshotButton title="马赛克" icon="icon-mosaic" :checked="checked" @click="onSelectMosaic">
    <template v-slot:option>
      <ScreenshotSize :value="size" :onChange="onSizeChange" />
    </template>
  </ScreenshotButton>
</template>
