<script setup lang="ts">
import { composeImage } from '../../utils/image'
import { DHistory } from '../../funcs/draw.history'
import { Canvas } from '../../screenshot-canvas/canvas'
import { useStore } from '../../store'
import ScreenshotButton from '../../screenshot-button/index.vue'

const store = useStore()
const onClick = () => {
  const { image, width, height, bounds } = store
  DHistory.clearSelect()

  setTimeout(() => {
    if (!Canvas.ctx || !image || !bounds) {
      return
    }
    composeImage({
      image,
      width,
      height,
      history: DHistory.history,
      bounds,
    }).then((blob) => {
      // TODO: 后期考虑做成悬浮结果 (适用图片对比场景)
      // call.onPin(blob, bounds)
      store.reset()
    })
  })
}
</script>

<template>
  <ScreenshotButton title="扫码" icon="icon-pin" @click="onClick" />
</template>
